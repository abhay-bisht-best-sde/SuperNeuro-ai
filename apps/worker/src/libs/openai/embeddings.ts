import { getSettings } from "../../core/config.js";
import { getOpenaiClient } from "./client.js";

export async function embedTexts(
  texts: string[],
  client?: ReturnType<typeof getOpenaiClient>
): Promise<number[][]> {
  const s = getSettings();
  const batchSize = s.EMBED_BATCH_SIZE;
  const c = client ?? getOpenaiClient();

  const result: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const resp = await c.embeddings.create({
      model: s.OPENAI_EMBEDDING_MODEL,
      input: batch,
    });
    for (const item of resp.data) {
      result.push(item.embedding);
    }
  }
  return result;
}
