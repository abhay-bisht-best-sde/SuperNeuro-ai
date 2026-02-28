import logging
import uuid

import cv2
import numpy as np
from PIL import Image

from worker.core.config import get_settings

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def is_meaningful_image(pil_img: Image.Image) -> bool:
    """
    Step 1: Check size thresholds
    Step 2: Check for pure black/white/blank
    Step 3: Check Laplacian variance (noise)
    Step 4: Check FFT low-freq ratio
    Step 5: Check unique color count
    """
    s = get_settings()
    w, h = pil_img.size
    if w < s.MIN_IMAGE_WIDTH or h < s.MIN_IMAGE_HEIGHT:
        return False

    rgb = pil_img.convert("RGB")
    arr = np.array(rgb, dtype=np.float32)

    if arr.mean() < 8:
        return False
    if arr.mean() > s.MAX_MEAN_BLANK and arr.std() < 10:
        return False
    if arr.std() < s.MIN_STD_UNIFORM:
        return False

    gray = np.array(rgb.convert("L"), dtype=np.uint8)
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if lap_var > s.MAX_LAPLACIAN_VAR:
        return False

    mag = np.abs(np.fft.fftshift(np.fft.fft2(gray.astype(np.float32))))
    hh, hw = mag.shape[0] // 4, mag.shape[1] // 4
    low_freq_ratio = mag[hh:-hh, hw:-hw].sum() / (mag.sum() + 1e-10)
    if low_freq_ratio < s.MIN_LOW_FREQ_RATIO:
        return False

    flat = arr.reshape(-1, 3).astype(np.uint8)
    sample = flat[
        np.random.choice(len(flat), min(10_000, len(flat)), replace=False)
    ]
    if len(np.unique(sample, axis=0)) < s.MIN_UNIQUE_COLORS:
        return False

    return True
