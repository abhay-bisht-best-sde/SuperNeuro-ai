import OpenAI from "openai";
import { getSettings } from "../../core/config.js";

let openaiClient: OpenAI | null = null;

export function getOpenaiClient(): OpenAI {
  if (openaiClient) return openaiClient;

  const s = getSettings();
  openaiClient = new OpenAI({ apiKey: s.OPENAI_API_KEY });
  return openaiClient;
}
