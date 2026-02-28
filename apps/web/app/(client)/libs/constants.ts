export const APP_NAME = "SuperNeuro";
export const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

export const QUERY_STALE_TIME_MS = 60_000;
export const KNOWLEDGE_BASE_POLL_INTERVAL_MS = 10_000;
export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
export const UPLOAD_CONCURRENCY = 4;
export const UPLOAD_RETRY_DELAYS = [0, 1000, 3000] as const;
export const ALLOWED_UPLOAD_TYPES = ["application/pdf"] as const;
