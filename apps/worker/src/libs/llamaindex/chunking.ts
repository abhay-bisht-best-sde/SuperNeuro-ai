import { Document, SentenceSplitter, type TextNode } from "llamaindex";
import { getSettings } from "../../core/config.js";

export interface ChunkWithId {
  node: TextNode;
  id: string;
}

export function createChunkSplitter(): SentenceSplitter {
  const s = getSettings();
  return new SentenceSplitter({
    chunkSize: s.CHUNK_SIZE,
    chunkOverlap: s.CHUNK_OVERLAP,
  });
}

export function chunkPageTextWithMetadata(
  rawText: string,
  pageIdx: number,
  sourceKey: string,
  fileId: string,
  splitter: SentenceSplitter
): ChunkWithId[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  const doc = new Document({
    text: trimmed,
    metadata: { source: sourceKey, page: pageIdx, kb_id: fileId },
  });

  const nodes = splitter.getNodesFromDocuments([doc]);
  const result: ChunkWithId[] = [];

  nodes.forEach((node, chunkIdx) => {
    const id = `${fileId}::p${pageIdx}::c${chunkIdx}`;
    const textNode = node as TextNode;
    textNode.id_ = id;
    textNode.metadata = {
      ...textNode.metadata,
      kb_id: fileId,
      page: pageIdx,
      source: sourceKey,
      text: (textNode.text ?? "").slice(0, 1000),
    };
    result.push({ node: textNode, id });
  });

  return result;
}
