import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisType } from "../types";

const MODEL_NAME = "gemini-2.0-flash"; // Defaulting to 2.0 Flash as requested

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel.");
  }
  return new GoogleGenAI({ apiKey });
};

export const testConnection = async () => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Hello, test connection.",
    });
    return !!response.text;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

const MEDICINE_SCAN_PROMPT = `
Analyze the provided image of a medicine strip or packaging.
Extract the following information in JSON format:
- brandName: The commercial name of the medicine.
- saltComposition: The active ingredients/chemical composition.
- manufacturer: The company that produced it.
- batchNumber: The batch or lot number.
- expiryDate: The expiration date.
- authenticityStatus: One of "Likely Authentic", "Suspicious", or "Unable to Determine".
- reason: A clear explanation for the authenticity status. Look for red flags like spelling mistakes, missing batch info, inconsistent fonts, or poor print quality.

STRICT SAFETY RULES:
1. NEVER guess a medicine name. If text is blurry or unreadable, set the field to "Text Unclear".
2. NEVER default to common medicines like Paracetamol if the image is unclear.
3. If you cannot find a specific field, mark it as "Not Found".
`;

const PRESCRIPTION_READ_PROMPT = `
Analyze the provided image of a handwritten doctor's prescription.
Convert the handwriting into clean text and extract a list of medicines.
For each medicine, identify:
- name: Name of the medicine.
- dosage: Strength (e.g., 500mg, 5ml).
- frequency: How often to take it (e.g., 1-0-1, twice a day).
- duration: For how many days/weeks.
- uses: General purpose of this medicine.
- sideEffects: Common side effects.
- warnings: Important safety warnings.

STRICT SAFETY RULES:
1. NEVER guess a medicine name. If handwriting is illegible, set the name to "Text Unclear".
2. Provide a rawText field containing the full transcribed text of the prescription.
3. Return the data in JSON format.
`;

export const analyzeImage = async (
  base64Image: string,
  type: AnalysisType
) => {
  const ai = getGeminiClient();
  
  const prompt = type === AnalysisType.MEDICINE_SCAN 
    ? MEDICINE_SCAN_PROMPT 
    : PRESCRIPTION_READ_PROMPT;

  const responseSchema = type === AnalysisType.MEDICINE_SCAN 
    ? {
        type: Type.OBJECT,
        properties: {
          brandName: { type: Type.STRING },
          saltComposition: { type: Type.STRING },
          manufacturer: { type: Type.STRING },
          batchNumber: { type: Type.STRING },
          expiryDate: { type: Type.STRING },
          authenticityStatus: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["brandName", "saltComposition", "manufacturer", "batchNumber", "expiryDate", "authenticityStatus", "reason"]
      }
    : {
        type: Type.OBJECT,
        properties: {
          rawText: { type: Type.STRING },
          medicines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                dosage: { type: Type.STRING },
                frequency: { type: Type.STRING },
                duration: { type: Type.STRING },
                uses: { type: Type.STRING },
                sideEffects: { type: Type.STRING },
                warnings: { type: Type.STRING },
              },
              required: ["name", "dosage", "frequency", "duration"]
            }
          }
        },
        required: ["rawText", "medicines"]
      };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema as any,
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Invalid response from AI");
  }
};
