export const PDF_INDEX_MESSAGE_TYPE = "INDEX";

export interface PdfIndexPayload {
  fileId: string;
  key: string;
  userId: string;
  fileName: string;
  fileSize: number;
}

