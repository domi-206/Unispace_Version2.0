
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizResult, Topic } from "../types";

const apiKey = process.env.API_KEY || '';

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
  // In a real app, this would use a server or a PDF parsing library.
  // We will simulate a delay and return mock content based on filename.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
        Course Material: ${file.name}
        
        Introduction to the subject. Basic concepts include definitions, history, and scope.
        
        Chapter 1: Fundamentals. Key principles are A, B, and C. It is important to understand the underlying theory.
        
        Chapter 2: Advanced Applications. Application of principles in real world scenarios. Case studies involved.
        
        Chapter 3: Critical Analysis. Comparing different frameworks and their efficacy.
        
        Conclusion. Summary of all topics.
      `);
    }, 1500);
  });
};

export const generateTopicsFromText = async (text: string): Promise<Topic[]> => {
  if (!apiKey) {
    // Fallback
    return [
      { id: 't1', title: 'Introduction & Basics', description: 'Core concepts and definitions.', isLocked: false, isCompleted: false },
      { id: 't2', title: 'Intermediate Concepts', description: 'Applying the basics.', isLocked: true, isCompleted: false },
      { id: 't3', title: 'Advanced Analysis', description: 'Complex scenarios and critical thinking.', isLocked: true, isCompleted: false },
    ];
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Updated prompt to enforce brevity and prevent infinite loops
  const prompt = `
    Analyze the following study text and break it down into 3-5 distinct learning topics.
    
    CRITICAL: 
    - Return ONLY a JSON array.
    - Keep "description" VERY CONCISE (max 15 words).
    - Do NOT repeat text.
    
    Structure:
    [
      { "id": "unique_id", "title": "Topic Title", "description": "Short summary (max 15 words)." }
    ]
    
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
      isLocked: index !== 0, // Lock all except first
      isCompleted: false
    }));
  } catch (error) {
    console.error("Error generating topics:", error);
    return [
      { id: 'err1', title: 'General Overview', description: 'Generated due to connection error.', isLocked: false, isCompleted: false }
    ];
  }
};

export const generateQuizForTopic = async (topicTitle: string, context: string, numQuestions: number): Promise<QuizQuestion[]> => {
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Generate a ${numQuestions}-question multiple choice quiz about: "${topicTitle}".
    Use the provided context.
    
    CRITICAL: 
    - Return valid JSON array.
    - Options must be an array of 4 strings.
    - correctAnswer is index 0-3.
    
    Context: "${context.substring(0, 3000)}"
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
    console.error(e);
    return [];
  }
};

export const analyzeQuizPerformance = async (questions: QuizQuestion[], userAnswers: number[]): Promise<QuizResult> => {
  if (!apiKey) return { score: 0, total: 0, strengths: [], weaknesses: [], keyTerms: [], passed: false };

  const ai = new GoogleGenAI({ apiKey });
  let score = 0;
  
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctAnswer) score++;
  });

  const percentage = (score / questions.length) * 100;
  const passed = percentage >= 70;

  const prompt = `
    Analyze this quiz performance.
    Questions: ${JSON.stringify(questions.map(q => q.question).slice(0, 10))}
    Score: ${score}/${questions.length}
    
    Return JSON with 3 items each:
    - strengths: string[]
    - weaknesses: string[]
    - keyTerms: string[]
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
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyTerms: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const analysis = safeParseJSON(response.text, {});
    return {
      score,
      total: questions.length,
      passed,
      strengths: analysis.strengths || ["General Knowledge"],
      weaknesses: analysis.weaknesses || ["Specific Details"],
      keyTerms: analysis.keyTerms || ["Review All"]
    };

  } catch (error) {
    return {
      score,
      total: questions.length,
      passed,
      strengths: ["N/A"],
      weaknesses: ["N/A"],
      keyTerms: ["N/A"]
    };
  }
}

export const askStudyQuestion = async (context: string, question: string): Promise<string> => {
  if (!apiKey) return "API Key missing.";
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Context: "${context.substring(0,4000)}"\nQuestion: "${question}"\nAnswer concisely (max 50 words).`;
  const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
  return response.text || "No answer found.";
};
