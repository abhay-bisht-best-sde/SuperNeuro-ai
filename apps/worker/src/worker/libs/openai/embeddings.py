import logging
import uuid
from typing import List

from worker.core.config import get_settings
from worker.libs.openai.client import get_openai_client

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def embed_texts(texts: List[str], client=None) -> List[List[float]]:
    """
    Step 1: Get embedding model from settings
    Step 2: Call OpenAI embeddings API (batched for large inputs)
    Step 3: Return embedding vectors
    """
    trace = _trace_id()
    s = get_settings()
    batch_size = s.EMBED_BATCH_SIZE
    c = client or get_openai_client()
    log.info("[trace_id=%s] Embedding %d text(s) in batches of %d", trace, len(texts), batch_size)
    result = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        resp = c.embeddings.create(model=s.OPENAI_EMBEDDING_MODEL, input=batch)
        result.extend([item.embedding for item in resp.data])
    log.info("[trace_id=%s] Embedding complete", trace)
    return result
