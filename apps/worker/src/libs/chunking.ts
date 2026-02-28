import { getSettings } from "../core/config.js";

export interface ChunkMetadata {
  source: string;
  page: number;
}

export interface ChunkResult {
  text: string;
  metadata: ChunkMetadata;
}

function splitBySentences(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.filter((s) => s.trim().length > 0);
}

export function chunkPageText(
  rawText: string,
  pageIdx: number,
  sourceKey: string
): ChunkResult[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  const s = getSettings();
  const chunkSize = s.CHUNK_SIZE;
  const overlap = s.CHUNK_OVERLAP;

  const result: ChunkResult[] = [];
  const sentences = splitBySentences(trimmed);

  let currentChunk = "";
  let startIdx = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const withSpace = currentChunk ? ` ${sentence}` : sentence;

    if (currentChunk.length + withSpace.length <= chunkSize) {
      currentChunk += withSpace;
    } else {
      if (currentChunk) {
        result.push({
          text: currentChunk.trim(),
          metadata: { source: sourceKey, page: pageIdx },
        });
      }

      if (overlap > 0 && currentChunk.length > overlap) {
        const words = currentChunk.split(/\s+/);
        let overlapLen = 0;
        const overlapWords: string[] = [];
        for (let j = words.length - 1; j >= 0 && overlapLen < overlap; j--) {
          overlapWords.unshift(words[j]);
          overlapLen += words[j].length + 1;
        }
        currentChunk = overlapWords.join(" ");
      } else {
        currentChunk = "";
      }
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim()) {
    result.push({
      text: currentChunk.trim(),
      metadata: { source: sourceKey, page: pageIdx },
    });
  }

  return result;
}
