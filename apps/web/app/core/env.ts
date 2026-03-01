import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  // Database (Prisma / MongoDB)
  DATABASE_URL: z.string().url().optional(),
  // OpenAI (LangChain, LlamaIndex)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_VISION_MODEL: z.string().default("gpt-4o"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o-mini"),
  COMPOSIO_API_KEY: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_GMAIL: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_GOOGLE_CALENDAR: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_GOOGLE_DRIVE: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_GOOGLE_SHEETS: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_GOOGLE_DOCS: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_NOTION: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_SLACK: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_YOUTUBE: z.string().optional(),
  COMPOSIO_AUTH_CONFIG_REDDIT: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),
  GROK_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_PDF_INDEX_NAME: z.string().optional(),
  PINECONE_IMG_TEXT_INDEX_NAME: z.string().optional(),
  // Assembly AI
  ASSEMBLYAI_API_KEY: z.string().optional(),
  // AWS (SQS)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_SQS_PDF_INDEXING_QUEUE_URL: z.string().url().optional(),
  AWS_SQS_IMAGE_PROCESSING_QUEUE_URL: z.string().url().optional(),
  // Redis Cloud
  REDIS_URL: z.string().url().optional(),
  // Ably (pub/sub)
  ABLY_API_KEY: z.string().optional(),
  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_R2_FILES_BUCKET_NAME: z.string().optional(),
  CLOUDFLARE_R2_IMAGES_BUCKET_NAME: z.string().optional(),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_VISION_MODEL: process.env.OPENAI_VISION_MODEL,
    OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
    OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL,
    COMPOSIO_API_KEY: process.env.COMPOSIO_API_KEY,
    COMPOSIO_AUTH_CONFIG_GMAIL: process.env.COMPOSIO_AUTH_CONFIG_GMAIL,
    COMPOSIO_AUTH_CONFIG_GOOGLE_CALENDAR: process.env.COMPOSIO_AUTH_CONFIG_GOOGLE_CALENDAR,
    COMPOSIO_AUTH_CONFIG_GOOGLE_DRIVE: process.env.COMPOSIO_AUTH_CONFIG_GOOGLE_DRIVE,
    COMPOSIO_AUTH_CONFIG_GOOGLE_SHEETS: process.env.COMPOSIO_AUTH_CONFIG_GOOGLE_SHEETS,
    COMPOSIO_AUTH_CONFIG_GOOGLE_DOCS: process.env.COMPOSIO_AUTH_CONFIG_GOOGLE_DOCS,
    COMPOSIO_AUTH_CONFIG_NOTION: process.env.COMPOSIO_AUTH_CONFIG_NOTION,
    COMPOSIO_AUTH_CONFIG_SLACK: process.env.COMPOSIO_AUTH_CONFIG_SLACK,
    COMPOSIO_AUTH_CONFIG_YOUTUBE: process.env.COMPOSIO_AUTH_CONFIG_YOUTUBE,
    COMPOSIO_AUTH_CONFIG_REDDIT: process.env.COMPOSIO_AUTH_CONFIG_REDDIT,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    GROK_API_KEY: process.env.GROK_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_PDF_INDEX_NAME: process.env.PINECONE_PDF_INDEX_NAME,
    PINECONE_IMG_TEXT_INDEX_NAME: process.env.PINECONE_IMG_TEXT_INDEX_NAME,
    ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_SQS_PDF_INDEXING_QUEUE_URL: process.env.AWS_SQS_PDF_INDEXING_QUEUE_URL,
    AWS_SQS_IMAGE_PROCESSING_QUEUE_URL: process.env.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL,
    REDIS_URL: process.env.REDIS_URL,
    ABLY_API_KEY: process.env.ABLY_API_KEY,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_FILES_BUCKET_NAME: process.env.CLOUDFLARE_R2_FILES_BUCKET_NAME,
    CLOUDFLARE_R2_IMAGES_BUCKET_NAME: process.env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME,
    CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  });
  if (!parsed.success) {
    const msg = Object.entries(parsed.error.flatten().fieldErrors)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("; ");
    throw new Error(`Invalid environment: ${msg}`);
  }
  return parsed.data;
}

export const env = loadEnv();
