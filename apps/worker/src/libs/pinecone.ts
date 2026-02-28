import { Pinecone } from "@pinecone-database/pinecone";
import { getSettings } from "../core/config.js";

let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (pineconeClient) return pineconeClient;

  const s = getSettings();
  if (!s.PINECONE_API_KEY) {
    throw new Error(
      "PINECONE_API_KEY is required for embedding storage. Set it in your environment."
    );
  }
  pineconeClient = new Pinecone({ apiKey: s.PINECONE_API_KEY });
  return pineconeClient;
}

function validateIndexName(name: string, label: string): void {
  if (!name || name.trim() === "") {
    throw new Error(
      `${label} is required for Pinecone. Set PINECONE_PDF_INDEX_NAME and PINECONE_IMG_TEXT_INDEX_NAME in your environment.`
    );
  }
}

export function getPdfIndexName(): string {
  const name = getSettings().PINECONE_PDF_INDEX_NAME;
  validateIndexName(name, "PINECONE_PDF_INDEX_NAME");
  return name;
}

export function getImageIndexName(): string {
  const name = getSettings().PINECONE_IMG_TEXT_INDEX_NAME;
  validateIndexName(name, "PINECONE_IMG_TEXT_INDEX_NAME");
  return name;
}

export async function getOrCreateIndex(
  name: string,
  dimension?: number
): Promise<ReturnType<Pinecone["index"]>> {
  validateIndexName(name, "Index name");
  const s = getSettings();
  const dim = dimension ?? s.EMBED_DIM;
  const pc = getPineconeClient();

  const listResult = await pc.listIndexes();
  const indexNames = (listResult.indexes ?? []).map((i) => i.name);

  if (!indexNames.includes(name)) {
    await pc.createIndex({
      name,
      dimension: dim,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
      waitUntilReady: true,
    });
  }

  return pc.index(name);
}

let imageIndexPromise: Promise<ReturnType<Pinecone["index"]>> | null = null;

export function getImageIndex(): Promise<ReturnType<Pinecone["index"]>> {
  if (!imageIndexPromise) {
    imageIndexPromise = getOrCreateIndex(getImageIndexName());
  }
  return imageIndexPromise;
}
