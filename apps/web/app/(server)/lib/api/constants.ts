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
