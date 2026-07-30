import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI, Type } from "@google/genai";

export type Diagnosis = {
  disease_name: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High" | "None";
  symptoms: string;
  causes: string;
  treatment: string;
  organic_treatment: string;
  chemical_treatment: string;
  prevention: string;
  watering_advice: string;
  fertilizer_advice: string;
  recovery_time: string;
  is_healthy: boolean;
  disclaimer: string;
};

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    disease_name: { type: Type.STRING, description: "Common name of the identified disease or condition. Use 'Healthy Plant' if no issues found." },
    confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 100" },
    severity: { type: Type.STRING, description: "Severity level: Low, Moderate, High, or None" },
    symptoms: { type: Type.STRING, description: "Visible symptoms observed on the plant" },
    causes: { type: Type.STRING, description: "Likely causes of the condition" },
    treatment: { type: Type.STRING, description: "General treatment recommendations" },
    organic_treatment: { type: Type.STRING, description: "Organic or natural treatment options" },
    chemical_treatment: { type: Type.STRING, description: "Chemical treatment options if applicable" },
    prevention: { type: Type.STRING, description: "Preventive measures to avoid recurrence" },
    watering_advice: { type: Type.STRING, description: "Specific watering guidance" },
    fertilizer_advice: { type: Type.STRING, description: "Specific fertilizer guidance" },
    recovery_time: { type: Type.STRING, description: "Expected recovery timeframe" },
    is_healthy: { type: Type.BOOLEAN, description: "Whether the plant appears healthy" },
    disclaimer: { type: Type.STRING, description: "A brief disclaimer about the AI diagnosis" },
  },
  required: [
    "disease_name", "confidence", "severity", "symptoms", "causes",
    "treatment", "organic_treatment", "chemical_treatment", "prevention",
    "watering_advice", "fertilizer_advice", "recovery_time", "is_healthy", "disclaimer",
  ],
};

function createClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key is not configured. Set GEMINI_API_KEY in the environment.");
  return new GoogleGenAI({ apiKey });
}

let client: GoogleGenAI | undefined;
function getClient() {
  if (!client) client = createClient();
  return client;
}

export const diagnosePlant = createServerFn({ method: "POST" })
  .inputValidator((data: { image: string; description?: string }) => {
    if (!data?.image?.startsWith("data:image/")) throw new Error("A plant photo is required");
    return data;
  })
  .handler(async ({ data }): Promise<Diagnosis> => {
    const ai = getClient();
    const base64Data = data.image.split(",")[1];
    const mimeType = data.image.match(/data:(image\/[a-zA-Z]+);/)?.[1] ?? "image/jpeg";

    const prompt = data.description
      ? `You are Biosphere's AI Plant Doctor, a certified plant pathologist. Analyze this plant image. The user reports: "${data.description}". Identify the plant and diagnose any visible health issues. Provide a thorough, practical assessment.`
      : "You are Biosphere's AI Plant Doctor, a certified plant pathologist. Analyze this plant image. Identify the plant and diagnose any visible health issues. Provide a thorough, practical assessment.";

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: diagnosisSchema,
          temperature: 0.4,
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg.includes("API key")) throw new Error("Gemini API key is invalid or not configured.");
      if (msg.includes("429") || msg.includes("quota")) throw new Error("Too many requests — please try again in a moment.");
      if (msg.includes("safety")) throw new Error("The image was blocked by safety filters. Try a clearer photo.");
      throw new Error("Could not analyze the image. Please try again.");
    }

    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response. Try a clearer photo.");

    let parsed: Diagnosis;
    try {
      parsed = JSON.parse(text) as Diagnosis;
    } catch {
      throw new Error("Could not read the diagnosis. Try a clearer photo.");
    }

    return {
      disease_name: parsed.disease_name ?? "Unknown",
      confidence: Math.max(0, Math.min(100, Math.round(parsed.confidence ?? 0))),
      severity: parsed.severity ?? "None",
      symptoms: parsed.symptoms ?? "",
      causes: parsed.causes ?? "",
      treatment: parsed.treatment ?? "",
      organic_treatment: parsed.organic_treatment ?? "",
      chemical_treatment: parsed.chemical_treatment ?? "",
      prevention: parsed.prevention ?? "",
      watering_advice: parsed.watering_advice ?? "",
      fertilizer_advice: parsed.fertilizer_advice ?? "",
      recovery_time: parsed.recovery_time ?? "",
      is_healthy: parsed.is_healthy ?? false,
      disclaimer: parsed.disclaimer ?? "This AI diagnosis is for informational purposes only and is not a substitute for professional advice.",
    };
  });
