import asyncio
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from worker.core.config import get_settings
from worker.libs.aws.base import parse_message_body, process_with_retry
from worker.libs.aws.client import get_sqs_client

log = logging.getLogger(__name__)

VISIBILITY_TIMEOUT = 300
MAX_MESSAGES = 5
BATCH_SIZE = 5
WAIT_TIME = 20


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def _receive_pdf_messages() -> list[dict[str, Any]]:
    s = get_settings()
    client = get_sqs_client()
    resp = client.receive_message(
        QueueUrl=s.AWS_SQS_PDF_INDEXING_QUEUE_URL,
        MaxNumberOfMessages=MAX_MESSAGES,
        WaitTimeSeconds=WAIT_TIME,
        VisibilityTimeout=VISIBILITY_TIMEOUT,
        MessageAttributeNames=["All"],
        AttributeNames=["All"],
    )
    return resp.get("Messages", []) or []


def poll_pdf_queue(handler: callable) -> int:
    """
    Step 1: Poll PDF queue once
    Step 2: Parse each message body
    Step 3: Process with retry logic
    """
    trace = _trace_id()
    log.info("[trace_id=%s] Polling PDF queue", trace)
    messages = _receive_pdf_messages()
    s = get_settings()

    for msg in messages:
        def adapter(raw_msg):
            body = parse_message_body(raw_msg)
            handler(body)

        process_with_retry(
            s.AWS_SQS_PDF_INDEXING_QUEUE_URL, msg, adapter, _trace_id()
        )
    return len(messages)


async def run_pdf_poller(handler: callable, poll_interval: float = 1.0) -> None:
    """Background loop: poll PDF queue, process, sleep."""
    log.info("PDF queue poller started")
    loop = asyncio.get_event_loop()
    while True:
        try:
            n = await loop.run_in_executor(None, lambda: poll_pdf_queue(handler))
            if n > 0:
                log.info("[trace_id=%s] Processed %d PDF message(s)", _trace_id(), n)
        except asyncio.CancelledError:
            raise
        except Exception as e:
            log.exception("[trace_id=%s] PDF poller error: %s", _trace_id(), e)
        await asyncio.sleep(poll_interval)


def _receive_image_messages() -> list[dict[str, Any]]:
    s = get_settings()
    client = get_sqs_client()
    resp = client.receive_message(
        QueueUrl=s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL,
        MaxNumberOfMessages=MAX_MESSAGES,
        WaitTimeSeconds=WAIT_TIME,
        VisibilityTimeout=VISIBILITY_TIMEOUT,
        MessageAttributeNames=["All"],
        AttributeNames=["All"],
    )
    return resp.get("Messages", []) or []


def _process_one_image(msg: dict[str, Any], handler: callable) -> None:
    s = get_settings()
    trace = _trace_id()

    def adapter(raw_msg):
        body = parse_message_body(raw_msg)
        handler(body)

    process_with_retry(
        s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL, msg, adapter, trace
    )


def poll_images_queue(handler: callable) -> int:
    """
    Step 1: Poll image queue once
    Step 2: Process messages in batches of 5 concurrently
    """
    trace = _trace_id()
    log.info("[trace_id=%s] Polling image queue", trace)
    messages = _receive_image_messages()
    with ThreadPoolExecutor(max_workers=BATCH_SIZE) as ex:
        futures = [ex.submit(_process_one_image, msg, handler) for msg in messages]
        for f in futures:
            f.result()
    return len(messages)


async def run_images_poller(handler: callable, poll_interval: float = 1.0) -> None:
    """Background loop: poll image queue, process, sleep."""
    log.info("Image queue poller started")
    loop = asyncio.get_event_loop()
    while True:
        try:
            n = await loop.run_in_executor(
                None, lambda: poll_images_queue(handler)
            )
            if n > 0:
                log.info(
                    "[trace_id=%s] Processed %d image message(s)",
                    _trace_id(),
                    n,
                )
        except asyncio.CancelledError:
            raise
        except Exception as e:
            log.exception(
                "[trace_id=%s] Image poller error: %s", _trace_id(), e
            )
        await asyncio.sleep(poll_interval)

