import { GoogleGenAI, Type } from "@google/genai";
import { ProjectType, RiskReport } from "../types";

// In a real production app, you should proxy this through your backend.
// For the hackathon frontend demo, we use the API key directly if available,
// or fail gracefully.
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateRiskReport = async (
  projectType: ProjectType,
  description: string
): Promise<RiskReport> => {
  if (!API_KEY) {
    // Fallback mock data if no key is provided in the environment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
            riskScore: 78,
            riskLevel: 'HIGH',
            summary: "Automated analysis detected potential vulnerabilities in the ownership structure and high concentration of token supply.",
            investmentAdvice: "Exercise extreme caution. The contract is unverified on standard explorers and liquidity is locked for a short duration.",
            auditDetails: [
                "Owner can mint unlimited tokens",
                "Liquidity unlock in 48 hours",
                "Social sentiment is botted"
            ]
        });
      }, 2000);
    });
  }

  try {
    const prompt = `
      Analyze the risk for a crypto project with the following details:
      Type: ${projectType}
      Description/URL: ${description}

      Provide a JSON response with:
      - riskScore (0-100, where 100 is highest risk)
      - riskLevel (LOW, MEDIUM, HIGH, CRITICAL)
      - summary (max 2 sentences)
      - investmentAdvice (short advice)
      - auditDetails (array of 3 short bullet points)
      
      Be critical and realistic like a security auditor.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            summary: { type: Type.STRING },
            investmentAdvice: { type: Type.STRING },
            auditDetails: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as RiskReport;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback on error
    return {
        riskScore: 50,
        riskLevel: 'MEDIUM',
        summary: "Could not complete full AI analysis due to connectivity issues.",
        investmentAdvice: "DYOR. Automated systems are currently unavailable.",
        auditDetails: ["Service unreachable", "Check contract manually"]
    };
  }
};