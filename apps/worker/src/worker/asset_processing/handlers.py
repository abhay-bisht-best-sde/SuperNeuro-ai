import logging
from typing import Any

from worker.asset_processing.image_pipeline import run_image_pipeline
from worker.asset_processing.pdf_pipeline import run_pdf_pipeline
from worker.models.message_models import (
    IMAGE_PROCESSING_MESSAGE_TYPE,
    PDF_INDEX_MESSAGE_TYPE,
)

log = logging.getLogger(__name__)


def handle_pdf_message(body: dict[str, Any]) -> None:
    """
    body: { type, payload } from SQS.
    payload: fileId, key, userId, fileName, fileSize
    """
    if body.get("type") != PDF_INDEX_MESSAGE_TYPE:
        log.warning("Ignoring non-PDF message type: %s", body.get("type"))
        return
    payload = body.get("payload")
    if not payload:
        raise ValueError("Missing payload in PDF message")
    run_pdf_pipeline(payload)


def handle_image_message(body: dict[str, Any]) -> None:
    """
    body: { type, payload } from SQS.
    payload: imageId, knowledgeBaseId, r2Key
    """
    if body.get("type") != IMAGE_PROCESSING_MESSAGE_TYPE:
        log.warning("Ignoring non-image message type: %s", body.get("type"))
        return
    payload = body.get("payload")
    if not payload:
        raise ValueError("Missing payload in image message")
    run_image_pipeline(payload)
