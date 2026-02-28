import io
import logging
import uuid
from typing import Tuple

import fitz
import numpy as np
from PIL import Image

from worker.asset_processing.image_quality import is_meaningful_image

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def _render_page_pil(page: fitz.Page, scale: float = 2.0) -> Image.Image:
    mat = fitz.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    return Image.frombytes("RGB", [pix.width, pix.height], pix.samples)


def _extract_embedded_images(
    page: fitz.Page, page_idx: int
) -> list[Tuple[str, Image.Image]]:
    results = []
    doc = page.parent
    for img_idx, img_info in enumerate(page.get_images(full=True)):
        xref = img_info[0]
        try:
            base_img = doc.extract_image(xref)
            img_bytes = base_img["image"]
            pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")
            label = f"page{page_idx}_embedded_{img_idx}"
            results.append((label, pil))
        except Exception:
            pass
    return results


def _extract_rendered_regions(
    page_pil: Image.Image, page_idx: int, min_region_height: int = 120
) -> list[Tuple[str, Image.Image]]:
    gray = np.array(page_pil.convert("L"))
    row_has_content = (gray < 230).any(axis=1)

    regions = []
    in_block = False
    start = 0
    for i, active in enumerate(row_has_content):
        if active and not in_block:
            in_block, start = True, i
        elif not active and in_block:
            in_block = False
            if (i - start) > min_region_height:
                y1 = max(0, start - 15)
                y2 = min(page_pil.height, i + 15)
                regions.append(
                    (
                        f"page{page_idx}_region_{start}",
                        page_pil.crop((0, y1, page_pil.width, y2)),
                    )
                )
    if in_block and (len(row_has_content) - start) > min_region_height:
        y1 = max(0, start - 15)
        regions.append(
            (
                f"page{page_idx}_region_{start}",
                page_pil.crop((0, y1, page_pil.width, page_pil.height)),
            )
        )
    return regions


def extract_visual_elements(
    page: fitz.Page, page_idx: int
) -> list[Tuple[str, Image.Image]]:
    """
    Step 1: Extract embedded PDF image objects
    Step 2: Render page and extract contiguous non-white blocks
    Step 3: Filter by quality
    """
    trace = _trace_id()
    log.info("[trace_id=%s] Extracting visuals from page %d", trace, page_idx)
    embedded = _extract_embedded_images(page, page_idx)
    page_pil = _render_page_pil(page, scale=2.0)
    rendered = _extract_rendered_regions(page_pil, page_idx)
    all_candidates = embedded + rendered
    result = [(label, img) for label, img in all_candidates if is_meaningful_image(img)]
    log.info("[trace_id=%s] Extracted %d meaningful visuals", trace, len(result))
    return result
