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
  // Grok (xAI)
  GROK_API_KEY: z.string().optional(),
  // ElevenLabs
  // Pinecone
  PINECONE_API_KEY: z.string().optional(),
  // Assembly AI
  ASSEMBLYAI_API_KEY: z.string().optional(),
  // AWS (SQS)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_SQS_QUEUE_URL: z.string().url().optional(),
  // Redis Cloud
  REDIS_URL: z.string().url().optional(),
  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().optional(),
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
    GROK_API_KEY: process.env.GROK_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_SQS_QUEUE_URL: process.env.AWS_SQS_QUEUE_URL,
    REDIS_URL: process.env.REDIS_URL,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid environment: ${parsed.error.flatten().fieldErrors as unknown as string}`,
    );
  }
  return parsed.data;
}

export const env = loadEnv();
