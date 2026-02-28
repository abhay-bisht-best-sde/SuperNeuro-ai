import os
from functools import lru_cache
from typing import Any
from urllib.parse import urlparse

import boto3
from botocore.config import Config

from worker.core.config import get_settings


def _endpoint_from_queue_url(queue_url: str) -> tuple[str, str]:
    """Extract region and endpoint from queue URL. Returns (region, endpoint_url)."""
    parsed = urlparse(queue_url)
    parts = parsed.netloc.split(".")
    region = parts[1] if len(parts) >= 2 else ""
    endpoint = f"{parsed.scheme}://{parsed.netloc}"
    return region, endpoint


def _get_queue_url() -> str:
    """Queue URL from settings or env (for cases where .env path differs at runtime)."""
    s = get_settings()
    return (
        s.AWS_SQS_PDF_INDEXING_QUEUE_URL
        or s.AWS_SQS_IMAGE_PROCESSING_QUEUE_URL
        or os.environ.get("AWS_SQS_PDF_INDEXING_QUEUE_URL", "")
        or os.environ.get("AWS_SQS_IMAGE_PROCESSING_QUEUE_URL", "")
    )


@lru_cache(maxsize=1)
def get_sqs_client() -> Any:
    s = get_settings()
    queue_url = _get_queue_url()
    if queue_url:
        region, endpoint_url = _endpoint_from_queue_url(queue_url)
    else:
        region = s.AWS_REGION or os.environ.get("AWS_REGION", "")
        endpoint_url = None
    region = region or s.AWS_REGION or os.environ.get("AWS_REGION", "")
    if not region:
        raise ValueError(
            "SQS requires AWS_REGION or a queue URL (AWS_SQS_PDF_INDEXING_QUEUE_URL / "
            "AWS_SQS_IMAGE_PROCESSING_QUEUE_URL) to derive the region"
        )
    kwargs: dict[str, Any] = {
        "region_name": region,
        "aws_access_key_id": s.AWS_ACCESS_KEY_ID,
        "aws_secret_access_key": s.AWS_SECRET_ACCESS_KEY,
        "config": Config(
            retries={"mode": "standard", "max_attempts": 3},
            signature_version="s3v4",
        ),
    }
    if endpoint_url:
        kwargs["endpoint_url"] = endpoint_url
    return boto3.client("sqs", **kwargs)
