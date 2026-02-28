import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "../../../../");
const envPath = resolve(rootDir, ".env");
config({ path: envPath });

export interface Settings {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  AWS_SQS_PDF_INDEXING_QUEUE_URL: string;
  AWS_SQS_IMAGE_PROCESSING_QUEUE_URL: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_R2_ACCESS_KEY_ID: string;
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: string;
  CLOUDFLARE_R2_FILES_BUCKET_NAME: string;
  CLOUDFLARE_R2_IMAGES_BUCKET_NAME: string;
  OPENAI_API_KEY: string;
  OPENAI_VISION_MODEL: string;
  OPENAI_EMBEDDING_MODEL: string;
  PINECONE_API_KEY: string;
  PINECONE_PDF_INDEX_NAME: string;
  PINECONE_IMG_TEXT_INDEX_NAME: string;
  DATABASE_URL: string;
  MIN_IMAGE_WIDTH: number;
  MIN_IMAGE_HEIGHT: number;
  MIN_UNIQUE_COLORS: number;
  MAX_LAPLACIAN_VAR: number;
  MIN_LOW_FREQ_RATIO: number;
  MAX_MEAN_BLANK: number;
  MIN_STD_UNIFORM: number;
  CHUNK_SIZE: number;
  CHUNK_OVERLAP: number;
  EMBED_DIM: number;
  IMAGE_BATCH_SIZE: number;
  EMBED_BATCH_SIZE: number;
  PINECONE_UPSERT_BATCH_SIZE: number;
}

function loadSettings(): Settings {
  return {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    AWS_REGION: process.env.AWS_REGION ?? "",
    AWS_SQS_PDF_INDEXING_QUEUE_URL:
      process.env.AWS_SQS_PDF_INDEXING_QUEUE_URL ?? "",
    AWS_SQS_IMAGE_PROCESSING_QUEUE_URL:
      process.env.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL ?? "",
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
    CLOUDFLARE_R2_SECRET_ACCESS_KEY:
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
    CLOUDFLARE_R2_FILES_BUCKET_NAME:
      process.env.CLOUDFLARE_R2_FILES_BUCKET_NAME ?? "",
    CLOUDFLARE_R2_IMAGES_BUCKET_NAME:
      process.env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME ?? "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
    OPENAI_VISION_MODEL: process.env.OPENAI_VISION_MODEL ?? "gpt-4o",
    OPENAI_EMBEDDING_MODEL:
      process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
    PINECONE_API_KEY: process.env.PINECONE_API_KEY ?? "",
    PINECONE_PDF_INDEX_NAME: process.env.PINECONE_PDF_INDEX_NAME ?? "",
    PINECONE_IMG_TEXT_INDEX_NAME:
      process.env.PINECONE_IMG_TEXT_INDEX_NAME ?? "",
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    MIN_IMAGE_WIDTH: parseInt(process.env.MIN_IMAGE_WIDTH ?? "400", 10),
    MIN_IMAGE_HEIGHT: parseInt(process.env.MIN_IMAGE_HEIGHT ?? "400", 10),
    MIN_UNIQUE_COLORS: parseInt(process.env.MIN_UNIQUE_COLORS ?? "100", 10),
    MAX_LAPLACIAN_VAR: parseInt(process.env.MAX_LAPLACIAN_VAR ?? "600", 10),
    MIN_LOW_FREQ_RATIO: parseFloat(
      process.env.MIN_LOW_FREQ_RATIO ?? "0.38"
    ),
    MAX_MEAN_BLANK: parseInt(process.env.MAX_MEAN_BLANK ?? "245", 10),
    MIN_STD_UNIFORM: parseInt(process.env.MIN_STD_UNIFORM ?? "15", 10),
    CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE ?? "1024", 10),
    CHUNK_OVERLAP: parseInt(process.env.CHUNK_OVERLAP ?? "150", 10),
    EMBED_DIM: parseInt(process.env.EMBED_DIM ?? "1536", 10),
    IMAGE_BATCH_SIZE: parseInt(process.env.IMAGE_BATCH_SIZE ?? "5", 10),
    EMBED_BATCH_SIZE: parseInt(process.env.EMBED_BATCH_SIZE ?? "100", 10),
    PINECONE_UPSERT_BATCH_SIZE: parseInt(
      process.env.PINECONE_UPSERT_BATCH_SIZE ?? "100",
      10
    ),
  };
}

let cached: Settings | null = null;

export function getSettings(): Settings {
  if (!cached) {
    cached = loadSettings();
  }
  return cached;
}
