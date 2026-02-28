import base64
import io
import logging
import uuid
from typing import Optional

from openai import OpenAI
from PIL import Image

from worker.core.config import get_settings
from worker.libs.openai.client import get_openai_client

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def _pil_to_base64(pil_img: Image.Image, fmt: str = "PNG") -> str:
    buf = io.BytesIO()
    pil_img.save(buf, format=fmt)
    return base64.b64encode(buf.getvalue()).decode()


def describe_image_with_vision(
    pil_img: Image.Image, openai_client: Optional[OpenAI] = None
) -> str:
    """
    Step 1: Encode image to base64
    Step 2: Call vision model to extract text and describe content
    Step 3: Return combined text block
    """
    trace = _trace_id()
    s = get_settings()
    client = openai_client or get_openai_client()
    log.info("[trace_id=%s] Describing image with vision model", trace)
    b64 = _pil_to_base64(pil_img)
    prompt = (
        "You are a document understanding assistant. "
        "This image was extracted from a PDF. "
        "1. Extract ALL text visible in the image verbatim. "
        "2. Describe what the chart, diagram, figure, or image shows in 2–4 sentences. "
        "Return a single plain-text block with both parts, separated by a blank line. "
        "Do not use markdown."
    )
    response = client.chat.completions.create(
        model=s.OPENAI_VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{b64}",
                            "detail": "high",
                        },
                    },
                ],
            }
        ],
        max_tokens=800,
    )
    result = response.choices[0].message.content.strip()
    log.info("[trace_id=%s] Vision description complete", trace)
    return result
