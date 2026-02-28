export {
  type FileUploadSqsMessage,
  FILE_UPLOAD_MESSAGE_TYPE,
  createFileUploadMessage,
  type ImageProcessingSqsMessage,
  IMAGE_PROCESSING_MESSAGE_TYPE,
  createImageProcessingMessage,
  type PdfIndexSqsMessage,
  PDF_INDEX_MESSAGE_TYPE,
  createPdfIndexMessage,
} from "./file-upload-message";

/** Matches Prisma KnowledgeBaseIndexingStatus - use for client components */
export const KnowledgeBaseIndexingStatus = {
  PENDING: "PENDING",
  INDEXING: "INDEXING",
  INDEXED: "INDEXED",
  ERROR: "ERROR",
} as const;

export type KnowledgeBaseIndexingStatus =
  (typeof KnowledgeBaseIndexingStatus)[keyof typeof KnowledgeBaseIndexingStatus];

/** Matches Prisma ImageProcessingStatus - use for client components */
export const ImageProcessingStatus = {
  PENDING: "PENDING",
  INDEXING: "INDEXING",
  INDEXED: "INDEXED",
  ERROR: "ERROR",
} as const;

export type ImageProcessingStatus =
  (typeof ImageProcessingStatus)[keyof typeof ImageProcessingStatus];

export interface KnowledgeBaseImageItem {
  id: string;
  r2Key: string;
  indexingStatus: ImageProcessingStatus;
  textSummary?: string | null;
  processingAttempts: number;
  errorMessage?: string | null;
  createdAt: Date | string;
}

export interface KnowledgeBaseListItem {
  id: string;
  name: string;
  sourceType: "document";
  lastUpdated?: Date;
  status: KnowledgeBaseIndexingStatus;
  progress?: number;
  totalImages: number;
  imagesIndexed: number;
  images: KnowledgeBaseImageItem[];
  errorMessage?: string | null;
  processingAttempts?: number;
}