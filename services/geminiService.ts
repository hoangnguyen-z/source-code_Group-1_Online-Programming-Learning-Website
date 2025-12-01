import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (
  prompt: string, 
  history: { role: 'user' | 'model'; text: string }[] = []
): Promise<string> => {
  try {
    let context = "";
    history.forEach(h => {
      context += `${h.role === 'user' ? 'User' : 'AI'}: ${h.text}\n`;
    });

    const fullPrompt = `System: You are a helpful programming tutor AI for EduCode. Be concise and encouraging.
    
    Context:
    ${context}
    
    Current User Question: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I am having trouble connecting to the brain server right now. Please check your API Key.";
  }
};

export const gradeCodeWithAI = async (code: string, taskDescription: string): Promise<{ score: number; feedback: string }> => {
  try {
    const prompt = `
      Act as a strict but helpful programming teacher.
      Task: ${taskDescription}
      
      Student Code:
      \`\`\`
      ${code}
      \`\`\`
      
      Analyze the code for correctness, efficiency, and style.
      Return a JSON object with:
      - score (integer 0-100)
      - feedback (string, concise constructive criticism)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        }
      }
    });

    const jsonText = response.text;
    if (jsonText) {
      return JSON.parse(jsonText);
    }
    return { score: 0, feedback: "AI Parsing Error" };

  } catch (error) {
    console.error("AI Grading Error:", error);
    return { score: 0, feedback: "Could not grade automatically at this time." };
  }
};

export const simulateCodeExecution = async (code: string, language: string): Promise<string> => {
  try {
     const prompt = `
      Act as a ${language} interpreter.
      Execute the following code virtually and return ONLY the output.
      If the code has syntax errors, return the error message.
      
      Code:
      ${code}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (e) {
    return "Error executing code via AI Simulator.";
  }
}

// New: Smart Navigation Intent
export const analyzeNavigationIntent = async (userQuery: string): Promise<{ intent: string; target?: string }> => {
  try {
    const prompt = `
      Analyze the user's query to see if they want to navigate within the EduCode app.
      Available Views/Targets: 
      - 'dashboard' (My learning, progress)
      - 'landing' (Home, explore courses)
      - 'profile' (Settings, account)
      - 'support' (Help, report issue)
      - 'teacher-portal' (Grading, create course)
      
      If the user is asking a coding question, intent is 'chat'.
      If the user wants to go somewhere, intent is 'navigate'.

      User Query: "${userQuery}"

      Return JSON: { "intent": "navigate" | "chat", "target": "view_name" (if navigate) }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            target: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text;
    return jsonText ? JSON.parse(jsonText) : { intent: 'chat' };
  } catch (e) {
    return { intent: 'chat' };
  }
}