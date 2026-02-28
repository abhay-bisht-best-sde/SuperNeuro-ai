import io
import logging
import uuid
from functools import lru_cache
from typing import Any

import boto3
from botocore.config import Config
from PIL import Image

from worker.core.config import get_settings

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def _get_r2_endpoint() -> str:
    s = get_settings()
    return f"https://{s.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com"


@lru_cache(maxsize=1)
def get_r2_client() -> Any:
    s = get_settings()
    return boto3.client(
        "s3",
        region_name="auto",
        endpoint_url=_get_r2_endpoint(),
        aws_access_key_id=s.CLOUDFLARE_R2_ACCESS_KEY_ID,
        aws_secret_access_key=s.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
    )


def get_r2_files_bucket_name() -> str:
    return get_settings().CLOUDFLARE_R2_FILES_BUCKET_NAME


def get_r2_images_bucket_name() -> str:
    return get_settings().CLOUDFLARE_R2_IMAGES_BUCKET_NAME


def download_pdf_from_r2(r2_key: str) -> bytes:
    """
    Step 1: Fetch PDF object from R2
    Step 2: Return raw bytes
    """
    trace = _trace_id()
    log.info("[trace_id=%s] Downloading PDF from R2 key=%s", trace, r2_key)
    client = get_r2_client()
    bucket = get_r2_files_bucket_name()
    resp = client.get_object(Bucket=bucket, Key=r2_key)
    data = resp["Body"].read()
    log.info("[trace_id=%s] Downloaded %d bytes from R2", trace, len(data))
    return data


def download_image_from_r2(r2_key: str) -> bytes:
    """
    Step 1: Fetch image object from R2
    Step 2: Return raw bytes
    """
    trace = _trace_id()
    log.info("[trace_id=%s] Downloading image from R2 key=%s", trace, r2_key)
    client = get_r2_client()
    bucket = get_r2_images_bucket_name()
    resp = client.get_object(Bucket=bucket, Key=r2_key)
    data = resp["Body"].read()
    log.info("[trace_id=%s] Downloaded %d bytes from R2", trace, len(data))
    return data


def upload_image_to_r2(pil_img: Image.Image, r2_key: str) -> None:
    """
    Step 1: Encode PIL image to PNG bytes
    Step 2: Upload to R2 bucket
    """
    trace = _trace_id()
    log.info("[trace_id=%s] Uploading image to R2 key=%s", trace, r2_key)
    buf = io.BytesIO()
    pil_img.save(buf, format="PNG")
    buf.seek(0)
    client = get_r2_client()
    bucket = get_r2_images_bucket_name()
    client.upload_fileobj(buf, bucket, r2_key)
    log.info("[trace_id=%s] Uploaded image to R2", trace)
