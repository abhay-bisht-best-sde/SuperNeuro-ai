import json
import logging
import uuid
from typing import Any, Callable

from worker.libs.aws.client import get_sqs_client

log = logging.getLogger(__name__)

MAX_RECEIVE_COUNT = 3


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def get_approximate_receive_count(msg: dict[str, Any]) -> int:
    attrs = msg.get("Attributes", {}) or {}
    return int(attrs.get("ApproximateReceiveCount", 0))


def should_delete_on_failure(msg: dict[str, Any]) -> bool:
    return get_approximate_receive_count(msg) >= MAX_RECEIVE_COUNT


def delete_message(queue_url: str, receipt_handle: str, trace_id: str) -> None:
    get_sqs_client().delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)
    log.info("[trace_id=%s] Message deleted from queue", trace_id)


def parse_message_body(msg: dict[str, Any]) -> dict[str, Any]:
    body = msg.get("Body", "{}")
    if isinstance(body, str):
        return json.loads(body)
    return body


def process_with_retry(
    queue_url: str,
    msg: dict[str, Any],
    handler: Callable[[dict[str, Any]], None],
    trace_id: str,
) -> None:
    """
    Run handler. On success: delete message.
    On failure: delete if receive_count >= 3, else re-raise.
    """
    receipt = msg.get("ReceiptHandle")
    receive_count = get_approximate_receive_count(msg)

    try:
        handler(msg)
        delete_message(queue_url, receipt, trace_id)
        log.info("[trace_id=%s] Message processed and deleted", trace_id)
    except Exception as e:
        log.warning(
            "[trace_id=%s] Processing failed (receive_count=%d): %s",
            trace_id,
            receive_count,
            e,
        )
        if should_delete_on_failure(msg):
            delete_message(queue_url, receipt, trace_id)
            log.warning(
                "[trace_id=%s] Max retries reached, message deleted to avoid poison pill",
                trace_id,
            )
        else:
            raise
