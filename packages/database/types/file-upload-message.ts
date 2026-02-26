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
