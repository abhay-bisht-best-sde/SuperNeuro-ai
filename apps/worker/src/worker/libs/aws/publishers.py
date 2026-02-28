import json
import logging
import uuid
from typing import Any

from worker.core.config import get_settings
from worker.libs.aws.client import get_sqs_client
from worker.models.message_models import (
    IMAGE_PROCESSING_MESSAGE_TYPE,
    PDF_INDEX_MESSAGE_TYPE,
    ImageProcessingPayload,
    PdfIndexPayload,
)

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def publish_pdf_index_message(payload: PdfIndexPayload | dict) -> dict[str, Any]:
    """
    Step 1: Build message body with type and payload
    Step 2: Send to PDF indexing queue
    """
    trace = _trace_id()
    if isinstance(payload, dict):
        payload = PdfIndexPayload(**payload)
    body = json.dumps({"type": PDF_INDEX_MESSAGE_TYPE, "payload": payload.model_dump()})
    s = get_settings()
    client = get_sqs_client()
    result = client.send_message(
        QueueUrl=s.AWS_SQS_PDF_INDEXING_QUEUE_URL,
        MessageBody=body,
        MessageGroupId=payload.fileId,
        MessageDeduplicationId=f"{payload.fileId}-{payload.key}",
    )
    log.info("[trace_id=%s] Published PDF index message for fileId=%s", trace, payload.fileId)
    return result


def publish_image_processing_message(
    payload: ImageProcessingPayload | dict,
) -> dict[str, Any]:
    """
    Step 1: Build message body with type and payload
    Step 2: Send to image processing queue
    """
    trace = _trace_id()
    if isinstance(payload, dict):
        payload = ImageProcessingPayload(**payload)
    body = json.dumps(
        {"type": IMAGE_PROCESSING_MESSAGE_TYPE, "payload": payload.model_dump()}
    )
    s = get_settings()
    client = get_sqs_client()
    result = client.send_message(
        QueueUrl=s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL,
        MessageBody=body,
        MessageGroupId=payload.imageId,
        MessageDeduplicationId=f"{payload.imageId}-{payload.r2Key}",
    )
    log.info(
        "[trace_id=%s] Published image processing message for imageId=%s",
        trace,
        payload.imageId,
    )
    return result
