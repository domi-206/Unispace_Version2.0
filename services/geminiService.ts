import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizResult, Topic, TheorySection, ExamResult } from "../types";

/**
 * Extracts text content from a File object.
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string || "No content extracted.");
    };
    reader.readAsText(file);
  });
};

/**
 * Generates distinct study topics from document context using Gemini.
 */
export const generateTopicsFromText = async (text: string): Promise<Topic[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `ABSOLUTE RULE: Analyze this content and extract ONLY the distinct study topics present in it. 
      Do not use external knowledge. If you cannot find distinct topics, categorize by logical document flow.
      Content: "${text.substring(0, 15000)}"`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["id", "title", "description"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini topics generation failed:", error);
    return [{ id: '1', title: 'General Overview', description: 'Unable to split topics automatically.' }];
  }
};

/**
 * Generates objective quiz questions based on topic and context.
 */
export const generateQuizForTopic = async (topicTitle: string, context: string, numQuestions: number): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `ABSOLUTE RULE: Generate exactly ${numQuestions} objective questions based ONLY on the following context for "${topicTitle}". 
      NO EXTERNAL KNOWLEDGE. If info is missing, say "This information is not available in the uploaded document."
      Context: "${context.substring(0, 12000)}"
      Include exact references.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              referenceText: { type: Type.STRING },
              pageNumber: { type: Type.INTEGER }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation", "referenceText", "pageNumber"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Gemini quiz generation failed:", e);
    return [];
  }
};

/**
 * Generates complex theory exam sections based on topic and context.
 */
export const generateExamForTopic = async (topicTitle: string, context: string, totalQuestions: number, difficulty: string): Promise<TheorySection[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `ABSOLUTE RULE: Generate exactly ${totalQuestions} theory questions based ONLY on the provided context for topic "${topicTitle}". 
      NO EXTERNAL KNOWLEDGE. 
      Difficulty: ${difficulty}.
      Each question must have a list of at least 5-10 key terminologies found in the document that a correct answer MUST contain.
      Context: "${context.substring(0, 15000)}"`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              mainQuestion: { type: Type.STRING },
              subQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    keywords: { 
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    referenceText: { type: Type.STRING },
                    pageNumber: { type: Type.INTEGER }
                  },
                  required: ["id", "text", "keywords", "referenceText", "pageNumber"]
                }
              },
              isCompulsory: { type: Type.BOOLEAN }
            },
            required: ["id", "title", "mainQuestion", "subQuestions", "isCompulsory"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Gemini exam generation failed:", e);
    return [];
  }
};

/**
 * Grades a theory exam submission strictly against document terminologies.
 */
export const gradeExamSubmission = async (sections: TheorySection[], answers: Record<string, string>): Promise<ExamResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const allSubs = sections.flatMap(s => s.subQuestions).filter(sq => !!answers[sq.id]);
    const gradingInput = allSubs.map(sq => {
      return `Question: ${sq.text}\nUser Answer: ${answers[sq.id] || "No Answer"}\nExpected Keywords: ${sq.keywords.join(", ")}`;
    }).join("\n---\n");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `ABSOLUTE RULE: Grade this theory exam based STRICTLY on the presence and logical use of document terminologies. 
      The total max score is 70. Passing requirement is 45 correct terminologies/concepts used. 
      Data:\n${gradingInput}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            passed: { type: Type.BOOLEAN },
            strengths: { type: Type.STRING },
            weaknesses: { type: Type.STRING },
            feedback: { type: Type.STRING },
            gradedAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subId: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  feedback: { type: Type.STRING },
                  keywordsFound: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["subId", "score", "feedback", "keywordsFound"]
              }
            }
          },
          required: ["score", "passed", "strengths", "weaknesses", "feedback", "gradedAnswers"]
        }
      }
    });
    const data = JSON.parse(response.text || '{}');
    return {
      ...data,
      total: allSubs.length,
      maxScore: 70,
      passingScore: 45
    };
  } catch (e) {
    console.error("Gemini grading failed:", e);
    return { score: 0, total: 0, passed: false, strengths: "N/A", weaknesses: "N/A", feedback: "N/A", maxScore: 70, passingScore: 45, gradedAnswers: [] };
  }
};

/**
 * Queries the model for an answer based solely on provided context.
 */
export const askStudyQuestion = async (context: string, question: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `ABSOLUTE RULE: Answer this question using ONLY the provided context. If info is missing, say: "This information is not available in the uploaded document."
      Context: "${context.substring(0, 15000)}"
      Question: "${question}"`,
    });
    return response.text || "This information is not available in the uploaded document.";
  } catch (e) {
    console.error("Gemini Q&A failed:", e);
    return "Error communicating with the Neural Hub.";
  }
};

/**
 * Analyzes objective quiz results and provides logical feedback.
 */
export const analyzeQuizPerformance = async (questions: QuizQuestion[], userAnswers: number[]): Promise<QuizResult> => {
  let score = 0;
  questions.forEach((q, idx) => { if (userAnswers[idx] === q.correctAnswer) score++; });
  const pct = (score / questions.length) * 100;
  const passed = pct >= 70;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const summary = questions.map((q, i) => `Q: ${q.question} | Result: ${userAnswers[i] === q.correctAnswer ? 'Correct' : 'Wrong'}`).join('\n');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze objective results (70% pass threshold). NO EXTERNAL KNOWLEDGE. Data:\n${summary}`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.STRING },
            weaknesses: { type: Type.STRING },
            feedback: { type: Type.STRING }
          },
          required: ["strengths", "weaknesses", "feedback"]
        }
      }
    });
    const data = JSON.parse(response.text || '{}');
    return { score, total: questions.length, passed, ...data };
  } catch (e) {
    console.error("Gemini performance analysis failed:", e);
    return { score, total: questions.length, passed, strengths: "N/A", weaknesses: "N/A", feedback: "N/A" };
  }
};
