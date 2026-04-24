import { GoogleGenAI, Type } from "@google/genai";
import { RoadmapStatus, RoadmapSession, Roadmap } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface RoadmapResponse {
  totalStudyHours: number;
  sessions: Omit<RoadmapSession, 'id' | 'status' | 'elapsedSeconds'>[];
}

export const roadmapService = {
  generateRoadmap: async (syllabus: string, timeframe: string): Promise<RoadmapResponse> => {
    const prompt = `
      Syllabus Content: "${syllabus}"
      Target Timeframe: "${timeframe}"
      
      Act as an Academic Success Architect. Create a highly efficient study roadmap. 
      Break the syllabus into logical chapters/topics. 
      Distribute them across the given timeframe. 
      
      Return the roadmap as a structured JSON object.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalStudyHours: { type: Type.NUMBER },
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    startTime: { type: Type.STRING },
                    endTime: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                    tips: { type: Type.STRING }
                  },
                  required: ["title", "topics", "startTime", "endTime"]
                }
              }
            },
            required: ["sessions"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}') as RoadmapResponse;
      return data;
    } catch (error) {
      console.error("Roadmap generation failed:", error);
      throw new Error("Failed to architect your roadmap.");
    }
  },

  askAiAboutSession: async (session: RoadmapSession, question: string): Promise<string> => {
    const prompt = `
      Topic: "${session.title}"
      Sub-topics: ${session.topics.join(", ")}
      Context: This is part of a study roadmap. 
      Student Question: "${question}"
      
      Provide a highly readable answer. 
      Use Markdown formatting:
      - Use bullet points for key concepts.
      - Use short, clear paragraphs.
      - Use bold text for important terms.
      
      Keep it brief but educational. Focus on making the concept easy to grasp.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert AI Study Tutor. Provide brief, encouraging, and highly educational answers.",
        }
      });

      return response.text || "I'm sorry, I couldn't generate an answer right now.";
    } catch (error) {
      console.error("AI Tutor failed:", error);
      return "The AI Tutor is currently unavailable. Please try again later.";
    }
  }
};
