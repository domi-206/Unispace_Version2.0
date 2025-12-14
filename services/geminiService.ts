
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizResult, Topic, Flashcard, SolverResult, SummaryResult } from "../types";

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
    }, 100); 
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

// --- NEW AI ENGINE FEATURES (EXAM SOLVER, FLASHCARDS, SUMMARY) ---

export const aiExamSolver = async (courseText: string, pastQText: string): Promise<SolverResult> => {
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an Intelligent Exam Solver and Academic Tutor.
    Your goal is to solve past exam questions strictly based on the provided Course Material.

    CRITICAL INSTRUCTIONS:
    1. SOURCE MATERIAL: Use ONLY the provided 'Course Material' to derive answers.
    2. QUESTION EXTRACTION: Identify questions from the 'Past Questions' files. Look for dates or years in filenames or document headers to identify when questions appeared.
    3. DEDUPLICATION: If a question appears multiple times, list it ONLY ONCE, but track the years and count.
    4. FORMATTING REQUIREMENTS (Strictly follow this structure with BOLDING):

    UNIT [Number/Name if identifiable]

    **[Number]. [Question Text]?** (Years: [List years found e.g. 2021, 2023], Frequency: [Number of times] times)
    [Detailed Answer: Provide a comprehensive explanation found in the notes.]

    **[Number]. [Next Question]?** (Years: [e.g. 2022], Frequency: 1 time)
    [Detailed Answer...]

    PAST QUESTIONS (Raw Text):
    "${pastQText.substring(0, 15000)}"

    COURSE MATERIAL (Context):
    "${courseText.substring(0, 50000)}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return { markdownText: response.text || "No output generated." };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const generateStudyFlashcards = async (text: string): Promise<Flashcard[]> => {
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a Flashcard Generator.
    Your goal is to create a rapid-fire Q&A study sheet.

    CRITICAL INSTRUCTIONS:
    1. Extract questions from the provided text (Course Material + Past Questions).
    2. Answer using 'Course Material'.
    3. EXTREMELY IMPORTANT: Answers must be SHORT, CONCISE, and EASY TO UNDERSTAND.
    4. Deduplicate questions.
    5. OUTPUT FORMAT: Return a JSON array of objects with 'term' and 'definition'.
       - 'term' must start with "**Q:** "
       - 'definition' must start with "**A:** "

    TEXT CONTENT:
    "${text.substring(0, 60000)}"
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
    console.error(e);
    return [];
  }
};

export const generateSmartSummary = async (courseText: string): Promise<SummaryResult> => {
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an Expert Academic Simplifier.
    Your goal is to provide a comprehensive summary of the uploaded document, analyzing it Topic by Topic, but using VERY SIMPLE, PLAIN, and EASY-TO-UNDERSTAND language.

    CRITICAL INSTRUCTIONS:
    1. **Simplicity**: Write as if explaining to a beginner or high school student. Avoid complex jargon or explain it immediately in simple terms.
    2. **Structure**: Break down the document into logical **Topics/Sections**.
    3. **Content**: For EACH major topic or concept identified, you MUST provide the following details where applicable and BOLD the labels using **:
       - **Definition**: A simple, easy-to-grasp definition of the concept.
       - **Key Features**: Key attributes described simply.
       - **Types/Classifications**: Different types with simple descriptions.
       - **Advantages**: Benefits or strengths (simplified).
       - **Disadvantages**: Limitations or weaknesses (simplified).
       - **Simple Explanation**: A clear, conversational paragraph explaining what this concept means in plain English.

    FORMATTING REQUIREMENTS:

    **[Document Title]**

    **Executive Overview**
    [A simple high-level summary of what this document is about.]

    ---

    **TOPIC: [Topic Name]**

    *   **Definition**: [Simple definition]
    *   **Key Features**:
        *   [Feature 1]
        *   [Feature 2]
    *   **Types**:
        *   **[Type Name]**: [Simple Description]
    *   **Advantages**:
        *   [Advantage 1]
    *   **Disadvantages**:
        *   [Disadvantage 1]
    *   **Simple Explanation**:
        [A paragraph explaining the concept simply.]

    ---

    (Repeat for all major topics)

    **Conclusion**
    [Final simple summary]

    COURSE MATERIAL:
    "${courseText.substring(0, 60000)}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return { markdownText: response.text || "No summary generated." };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
