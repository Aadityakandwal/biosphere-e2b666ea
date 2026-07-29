import { createServerFn } from "@tanstack/react-start";

export type Diagnosis = {
  plant: string;
  issue: string;
  match: number;
  healthy: boolean;
  summary: string;
  chips: string[];
  actions: string[];
};

export const diagnosePlant = createServerFn({ method: "POST" })
  .inputValidator((data: { image: string }) => {
    if (!data?.image?.startsWith("data:image/")) throw new Error("A plant photo is required");
    return data;
  })
  .handler(async ({ data }): Promise<Diagnosis> => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("AI is not configured");

    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(data.image);
    if (!match) throw new Error("A plant photo is required");
    const [, mimeType, base64] = match;

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are Biosphere's AI Plant Doctor. Identify the plant from the photo and diagnose visible health issues. Be concise, practical and specific to what is visible.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                { text: "Diagnose this plant." },
                { inlineData: { mimeType, data: base64 } },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                plant: { type: "STRING", description: "Common name of the plant" },
                issue: {
                  type: "STRING",
                  description: "Short issue title, e.g. 'Nitrogen Deficiency'. Use 'Healthy Plant' if none.",
                },
                match: { type: "NUMBER", description: "Confidence 0-100" },
                healthy: { type: "BOOLEAN" },
                summary: { type: "STRING", description: "2-3 sentences explaining the diagnosis" },
                chips: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "2-3 short observations like 'Soil Hydration Low'",
                },
                actions: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "3 short care actions",
                },
              },
              required: ["plant", "issue", "match", "healthy", "summary", "chips", "actions"],
            },
          },
        }),
      },
    );

    if (res.status === 429) throw new Error("Too many requests — please try again in a moment.");
    if (!res.ok) throw new Error(`Diagnosis failed (${res.status}): ${await res.text()}`);

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p?.text ?? "")
      .join("")
      .trim();
    if (!text) throw new Error("Could not read the diagnosis. Try a clearer photo.");
    const parsed = JSON.parse(text) as Diagnosis;
    return {
      ...parsed,
      match: Math.max(0, Math.min(100, Math.round(parsed.match ?? 0))),
      chips: parsed.chips?.slice(0, 3) ?? [],
      actions: parsed.actions?.slice(0, 4) ?? [],
    };
  });
