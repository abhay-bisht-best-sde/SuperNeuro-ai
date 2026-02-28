import logging
import uuid
from typing import List, Tuple

from llama_index.core import Document
from llama_index.core.node_parser import SentenceSplitter

from worker.core.config import get_settings

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def chunk_page_text(
    raw_text: str, page_idx: int, source_key: str
) -> List[Tuple[str, dict]]:
    """
    Step 1: Create LlamaIndex Document with metadata
    Step 2: Split into chunks with SentenceSplitter
    Step 3: Return list of (text, metadata)
    """
    if not raw_text.strip():
        return []
    trace = _trace_id()
    s = get_settings()
    log.info("[trace_id=%s] Chunking page %d text (len=%d)", trace, page_idx, len(raw_text))
    doc = Document(
        text=raw_text.strip(),
        metadata={"source": source_key, "page": page_idx},
    )
    splitter = SentenceSplitter(
        chunk_size=s.CHUNK_SIZE,
        chunk_overlap=s.CHUNK_OVERLAP,
    )
    nodes = splitter.get_nodes_from_documents([doc], show_progress=False)
    result = [(n.text, n.metadata) for n in nodes]
    log.info("[trace_id=%s] Chunked into %d nodes", trace, len(result))
    return result
