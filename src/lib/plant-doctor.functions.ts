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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          {
            role: "system",
            content:
              "You are Biosphere's AI Plant Doctor. Identify the plant from the photo and diagnose visible health issues. Be concise, practical and specific to what is visible.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Diagnose this plant." },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_diagnosis",
              description: "Report the plant diagnosis",
              parameters: {
                type: "object",
                properties: {
                  plant: { type: "string", description: "Common name of the plant" },
                  issue: { type: "string", description: "Short issue title, e.g. 'Nitrogen Deficiency'. Use 'Healthy Plant' if none." },
                  match: { type: "number", description: "Confidence 0-100" },
                  healthy: { type: "boolean" },
                  summary: { type: "string", description: "2-3 sentences explaining the diagnosis" },
                  chips: { type: "array", items: { type: "string" }, description: "2-3 short observations like 'Soil Hydration Low'" },
                  actions: { type: "array", items: { type: "string" }, description: "3 short care actions" },
                },
                required: ["plant", "issue", "match", "healthy", "summary", "chips", "actions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_diagnosis" } },
      }),
    });

    if (res.status === 429) throw new Error("Too many requests — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Plans & credits.");
    if (!res.ok) throw new Error(`Diagnosis failed (${res.status}): ${await res.text()}`);

    const json = await res.json();
    const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Could not read the diagnosis. Try a clearer photo.");
    const parsed = JSON.parse(args) as Diagnosis;
    return {
      ...parsed,
      match: Math.max(0, Math.min(100, Math.round(parsed.match ?? 0))),
      chips: parsed.chips?.slice(0, 3) ?? [],
      actions: parsed.actions?.slice(0, 4) ?? [],
    };
  });
