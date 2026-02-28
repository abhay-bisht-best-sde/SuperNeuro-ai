from pydantic import BaseModel

PDF_INDEX_MESSAGE_TYPE = "INDEX"


class PdfIndexPayload(BaseModel):
    fileId: str
    key: str
    userId: str
    fileName: str
    fileSize: int


IMAGE_PROCESSING_MESSAGE_TYPE = "image.process"


class ImageProcessingPayload(BaseModel):
    imageId: str
    knowledgeBaseId: str
    r2Key: str
