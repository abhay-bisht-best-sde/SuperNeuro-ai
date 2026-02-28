import { MessageRole } from "@repo/database";

export const MAX_BODY_SIZE_KB = 1024;
export const MAX_BODY_SIZE_MB = 1024 * 1024;
export const R2_BUCKET_ERROR = "R2 bucket not configured";
export const UNAUTHORIZED_ERROR = "Unauthorized";
export const FORBIDDEN_ERROR = "Forbidden";
export const BODY_TOO_LARGE_ERROR = "Request body too large";
export const INTERNAL_ERROR = "Internal Server Error";

export const ALLOWED_CONTENT_TYPES = ["application/pdf"] as const;
export const SIGNED_URL_EXPIRES_SEC = 3600;
export const MAX_PART_NUMBER = 10_000;
export const SYSTEM_MESSAGE = `
You are SuperNeuro.ai, an intelligent workflow co-pilot.

Your purpose is to help users automate, organize, retrieve, create, and execute tasks across connected tools such as Notion, Google Workspace (Docs, Sheets, Drive, Gmail, Calendar), Slack, and other integrated platforms.

You are not a generic chatbot.
You are an action-oriented productivity assistant.
`

export const SYSTEM_MESSAGE_OBJ = {
  role: MessageRole.SYSTEM.toLowerCase(),
  content: SYSTEM_MESSAGE,
}