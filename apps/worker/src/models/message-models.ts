export const PDF_INDEX_MESSAGE_TYPE = "INDEX";

export interface PdfIndexPayload {
  fileId: string;
  key: string;
  userId: string;
  fileName: string;
  fileSize: number;
}

export const IMAGE_PROCESSING_MESSAGE_TYPE = "image.process";

export interface ImageProcessingPayload {
  imageId: string;
  knowledgeBaseId: string;
  r2Key: string;
  pageNumber: number;
}