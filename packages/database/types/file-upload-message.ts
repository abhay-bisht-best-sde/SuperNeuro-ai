export const FILE_UPLOAD_MESSAGE_TYPE = "file.uploaded" as const;

export interface FileUploadSqsMessage {
  type: typeof FILE_UPLOAD_MESSAGE_TYPE;
  payload: {
    fileId: string;
    key: string;
    userId: string;
    fileName: string;
    fileSize: number;
  };
}

export function createFileUploadMessage(
  payload: FileUploadSqsMessage["payload"]
): FileUploadSqsMessage {
  return {
    type: FILE_UPLOAD_MESSAGE_TYPE,
    payload,
  };
}

export const IMAGE_PROCESSING_MESSAGE_TYPE = "image.process" as const;

export interface ImageProcessingSqsMessage {
  type: typeof IMAGE_PROCESSING_MESSAGE_TYPE;
  payload: {
    imageId: string;
    knowledgeBaseId: string;
    r2Key: string;
  };
}

export function createImageProcessingMessage(
  payload: ImageProcessingSqsMessage["payload"]
): ImageProcessingSqsMessage {
  return {
    type: IMAGE_PROCESSING_MESSAGE_TYPE,
    payload,
  };
}

// --- PDF Indexing Pipeline ---

export const PDF_INDEX_MESSAGE_TYPE = "INDEX" as const;

export interface PdfIndexSqsMessage {
  type: typeof PDF_INDEX_MESSAGE_TYPE;
  payload: {
    fileId: string;
    key: string;
    userId: string;
    fileName: string;
    fileSize: number;
  };
}

export function createPdfIndexMessage(
  payload: PdfIndexSqsMessage["payload"]
): PdfIndexSqsMessage {
  return {
    type: PDF_INDEX_MESSAGE_TYPE,
    payload,
  };
}
