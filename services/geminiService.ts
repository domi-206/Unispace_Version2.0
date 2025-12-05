
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizResult, Topic, AIAnalysisResult, Flashcard } from "../types";

// Safety check for process.env to prevent runtime crashes in browser environments
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("Unable to access process.env");
  }
  return '';
};

const apiKey = getApiKey();

// Helper to safely parse JSON from AI response
const safeParseJSON = (text: string | undefined, fallback: any) => {
  if (!text) return fallback;
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON Parse Error (likely truncated AI response):", e);
    return fallback;
  }
};

// Mock function to extract text from a "File" (simulated)
export const extractTextFromFile = async (file: File): Promise<string> => {
  // Faster processing (<3s requirement)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
        [DOCUMENT CONTENT for ${file.name}]
        
        Unit 1: Introduction to Computer Science
        Computer Science is the study of computation, automation, and information.
        Key Concept: Algorithms are step-by-step procedures for calculations.
        
        Unit 2: Data Structures
        Arrays are linear data structures. Linked lists consist of nodes.
        Queues follow FIFO (First In First Out). Stacks follow LIFO (Last In First Out).
        
        Unit 3: Web Technologies
        HTML stands for HyperText Markup Language. CSS is Cascading Style Sheets.
        React is a JavaScript library for building user interfaces.
        
        [END CONTENT]
      `);
    }, 100); // Reduced delay for snappy feel
  });
};

export const generateTopicsFromText = async (text: string): Promise<Topic[]> => {
  if (!apiKey) {
    return [
      { id: 't1', title: 'Introduction & Basics', description: 'Core concepts and definitions.', isLocked: false, isCompleted: false },
      { id: 't2', title: 'Intermediate Concepts', description: 'Applying the basics.', isLocked: true, isCompleted: false },
      { id: 't3', title: 'Advanced Analysis', description: 'Complex scenarios and critical thinking.', isLocked: true, isCompleted: false },
    ];
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Analyze the text and list 3-5 key study topics.
    JSON ONLY. Max 15 words description.
    
    Text: "${text.substring(0, 4000)}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = safeParseJSON(response.text, []);
    return data.map((t: any, index: number) => ({
      ...t,
      id: t.id || `topic-${index}`,
      isLocked: index !== 0,
      isCompleted: false
    }));
  } catch (error) {
    console.error("Error generating topics:", error);
    return [];
  }
};

export const generateQuizForTopic = async (topicTitle: string, context: string, numQuestions: number): Promise<QuizQuestion[]> => {
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Generate ${numQuestions} multiple choice questions about "${topicTitle}".
    Based on context: "${context.substring(0, 3000)}"
    JSON Array format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    });
    return safeParseJSON(response.text, []);
  } catch (e) {
    return [];
  }
};

export const analyzeQuizPerformance = async (questions: QuizQuestion[], userAnswers: number[]): Promise<QuizResult> => {
  if (!apiKey) return { score: 0, total: 0, strengths: [], weaknesses: [], keyTerms: [], passed: false };

  const ai = new GoogleGenAI({ apiKey });
  let score = 0;
  questions.forEach((q, idx) => { if (userAnswers[idx] === q.correctAnswer) score++; });
  const passed = (score / questions.length) * 100 >= 70;

  const prompt = `
    Analyze quiz performance.
    Questions: ${JSON.stringify(questions.map(q => q.question).slice(0, 5))}
    Score: ${score}/${questions.length}
    Return JSON: strengths, weaknesses, keyTerms (strings).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const data = safeParseJSON(response.text, {});
    return {
      score,
      total: questions.length,
      passed,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      keyTerms: data.keyTerms || []
    };
  } catch (e) {
    return { score, total: questions.length, passed, strengths: [], weaknesses: [], keyTerms: [] };
  }
}

export const askStudyQuestion = async (context: string, question: string): Promise<string> => {
  if (!apiKey) return "AI Service Unavailable (Missing API Key)";
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Context: "${context.substring(0,4000)}"\nQuestion: "${question}"\nAnswer simply.`;
  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text || "No answer found.";
};

// --- AI ENGINE FEATURES (STRICT PYTHON LOGIC ADAPTATION) ---

export const analyzeCourseMaterial = async (courseText: string, pastQuestionsText: string): Promise<AIAnalysisResult> => {
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  // LOGIC ADAPTED FROM PYTHON SCRIPT:
  // 1. Analyze "raw text" from past questions (extract specific academic questions, ignore instructions).
  // 2. Act as "Expert Tutor" using "Course Material" as Context.
  // 3. Strict Rules: Answer based on Context, or say "Not covered". Provide detailed explanation.
  
  const prompt = `
    ACT AS THE "INTELLIGENT EXAM SOLVER".
    
    STEP 1: EXAM PARSING
    Analyze the "PAST QUESTIONS" text. Extract every specific academic question asked.
    Ignore instructions like "Time allowed", "Answer all questions".
    Deduplicate the questions.
    
    STEP 2: EXPERT TUTOR SOLVING
    For each extracted question, use the "COURSE MATERIAL" as the Context to provide an answer.
    
    RULES:
    1. Your answer must be strictly based on the "COURSE MATERIAL" provided.
    2. If the answer is not found in the Context, state "This topic is not covered in the provided Course Material."
    3. Provide a detailed explanation for the answer.
    
    COURSE MATERIAL (CONTEXT):
    "${courseText.substring(0, 80000)}"
    
    PAST QUESTIONS (RAW TEXT):
    "${pastQuestionsText.substring(0, 20000)}"
    
    OUTPUT FORMAT (JSON):
    {
      "pastQuestionAnswers": [
        {
          "question": "Extracted Question 1",
          "answer": "Detailed Answer based on context...",
          "topicRef": "Relevant Section Header"
        }
      ],
      "summary": []
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  points: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            pastQuestionAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  year: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  topicRef: { type: Type.STRING }
                }
              }
            },
            faqs: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  likelihood: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                }
              }
            },
            topicExplanations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return safeParseJSON(response.text, {
      summary: [],
      pastQuestionAnswers: [],
      faqs: [],
      predictions: [],
      topicExplanations: []
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const generateFlashcards = async (text: string): Promise<Flashcard[]> => {
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  // STRICT Q: and A: format for flashcards
  const prompt = `
    Generate study flashcards from the provided text.
    
    INSTRUCTIONS:
    1. Identify key questions or terms in the text (especially from Past Questions sections).
    2. Create concise, memory-friendly answers.
    3. IMPORTANT: The 'term' field must start with 'Q: ' and the 'definition' field must start with 'A: '.
    
    EXAMPLE:
    term: "Q: What is SMP?"
    definition: "A: Symmetric Multiprocessing."
    
    TEXT CONTENT:
    "${text.substring(0, 50000)}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING }
            }
          }
        }
      }
    });

    return safeParseJSON(response.text, []);
  } catch (e) {
    return [];
  }
};
