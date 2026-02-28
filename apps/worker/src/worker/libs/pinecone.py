from functools import lru_cache
from typing import Any

from pinecone import Pinecone, ServerlessSpec

from worker.core.config import get_settings


@lru_cache(maxsize=1)
def get_pinecone_client() -> Pinecone:
    s = get_settings()
    return Pinecone(api_key=s.PINECONE_API_KEY)


def get_pdf_index_name() -> str:
    return get_settings().PINECONE_PDF_INDEX_NAME


def get_image_index_name() -> str:
    return get_settings().PINECONE_IMG_TEXT_INDEX_NAME


def get_or_create_index(name: str, dimension: int | None = None) -> Any:
    s = get_settings()
    dim = dimension or s.EMBED_DIM
    pc = get_pinecone_client()
    existing = [i.name for i in pc.list_indexes()]
    if name not in existing:
        pc.create_index(
            name=name,
            dimension=dim,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    return pc.Index(name)
