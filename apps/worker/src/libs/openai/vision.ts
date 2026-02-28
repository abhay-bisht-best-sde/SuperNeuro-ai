import OpenAI from "openai";
import { getSettings } from "../../core/config.js";
import { getOpenaiClient } from "./client.js";

export async function describeImageWithVision(
  imageBuffer: Buffer,
  openaiClient?: OpenAI
): Promise<string> {
  const s = getSettings();
  const client = openaiClient ?? getOpenaiClient();

  const base64 = imageBuffer.toString("base64");
  const prompt =
    "You are a document understanding assistant. " +
    "This image was extracted from a PDF. " +
    "1. Extract ALL text visible in the image verbatim. " +
    "2. Describe what the chart, diagram, figure, or image shows in 2–4 sentences. " +
    "Return a single plain-text block with both parts, separated by a blank line. " +
    "Do not use markdown.";

  const response = await client.chat.completions.create({
    model: s.OPENAI_VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  return (content ?? "").trim();
}
