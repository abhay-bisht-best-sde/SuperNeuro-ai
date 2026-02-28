import logging
import multiprocessing
import os
import tempfile
import uuid
from datetime import datetime, timezone
from functools import partial
from typing import List, Tuple

import fitz
from bson import ObjectId

from worker.asset_processing.extraction import extract_visual_elements
from worker.libs.cloudflare import download_pdf_from_r2, upload_image_to_r2
from worker.libs.mongodb import get_knowledge_base_collection, get_knowledge_base_images_collection
from worker.libs.openai.embeddings import embed_texts
from worker.libs.aws.publishers import publish_image_processing_message
from worker.libs.llamaindex.chunking import chunk_page_text
from worker.libs.pinecone import get_or_create_index, get_pdf_index_name
from worker.core.config import get_settings

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def _extract_and_chunk_page(
    page_idx: int,
    pdf_path: str,
    source_key: str,
    kb_id: str,
) -> List[Tuple[str, int, int]]:
    """Extract page text and chunk. Returns list of (text, page_idx, chunk_idx)."""
    doc = fitz.open(pdf_path)
    page = doc[page_idx]
    raw_text = page.get_text("text").strip()
    doc.close()

    chunks = chunk_page_text(raw_text, page_idx, source_key)
    if not chunks:
        return []

    return [(chunks[i][0], page_idx, i) for i in range(len(chunks))]


def _process_page_images(
    page_idx: int,
    pdf_path: str,
    kb_id: str,
    base_r2_prefix: str,
) -> List[dict]:
    """Step 1: Extract visuals. Step 2: Upload to R2. Step 3: Insert DB. Step 4: Return for queue publish."""
    doc = fitz.open(pdf_path)
    page = doc[page_idx]
    visuals = extract_visual_elements(page, page_idx)
    doc.close()

    coll = get_knowledge_base_images_collection()
    to_publish = []
    for label, pil_img in visuals:
        r2_key = f"{base_r2_prefix}/{label}.png"
        upload_image_to_r2(pil_img, r2_key)
        now = datetime.now(timezone.utc)
        rec = coll.insert_one(
            {
                "knowledgeBaseId": ObjectId(kb_id),
                "r2Key": r2_key,
                "pageNumber": page_idx,
                "indexingStatus": "PENDING",
                "createdAt": now,
                "updatedAt": now,
            }
        )
        img_id = str(rec.inserted_id)
        to_publish.append(
            {"imageId": img_id, "knowledgeBaseId": kb_id, "r2Key": r2_key}
        )
    return to_publish


def run_pdf_pipeline(payload: dict) -> dict:
    """
    Full PDF pipeline. payload: fileId, key, userId, fileName, fileSize.
    fileId = knowledgeBaseId (MongoDB ObjectId string).
    Step 1: Extract+chunk all pages in parallel. Step 2: Batch embed. Step 3: Batch upsert Pinecone.
    Step 4: Store embeddingIds. Step 5: Publish image messages.
    """
    trace = _trace_id()
    file_id = payload["fileId"]
    r2_key = payload["key"]
    base_r2_prefix = os.path.splitext(r2_key)[0]

    log.info("[trace_id=%s] PDF pipeline started: fileId=%s key=%s", trace, file_id, r2_key)

    get_knowledge_base_collection().update_one(
        {"_id": ObjectId(file_id)},
        {"$set": {"indexingStatus": "INDEXING", "updatedAt": datetime.now(timezone.utc)}},
    )

    pdf_bytes = download_pdf_from_r2(r2_key)
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        pdf_path = tmp.name

    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        doc.close()

        num_workers = min(4, max(1, total_pages // 2))
        worker_fn_chunk = partial(
            _extract_and_chunk_page,
            pdf_path=pdf_path,
            source_key=r2_key,
            kb_id=file_id,
        )
        worker_fn_images = partial(
            _process_page_images,
            pdf_path=pdf_path,
            kb_id=file_id,
            base_r2_prefix=base_r2_prefix,
        )

        with multiprocessing.Pool(processes=num_workers) as pool:
            chunk_results = pool.map(worker_fn_chunk, range(total_pages))
            image_results = pool.map(worker_fn_images, range(total_pages))

        all_chunks: List[Tuple[str, int, int]] = []
        for page_chunks in chunk_results:
            all_chunks.extend(page_chunks)

        embedding_ids: List[str] = []
        if all_chunks:
            texts = [c[0] for c in all_chunks]
            embeddings = embed_texts(texts)

            index = get_or_create_index(get_pdf_index_name())
            s = get_settings()
            batch_size = s.PINECONE_UPSERT_BATCH_SIZE

            vectors = []
            for i, ((text, page_idx, chunk_idx), emb) in enumerate(zip(all_chunks, embeddings)):
                vec_id = f"{file_id}::p{page_idx}::c{chunk_idx}"
                embedding_ids.append(vec_id)
                vectors.append(
                    {
                        "id": vec_id,
                        "values": emb,
                        "metadata": {
                            "kb_id": file_id,
                            "page": page_idx,
                            "text": text[:1000],
                        },
                    }
                )

            for i in range(0, len(vectors), batch_size):
                batch = vectors[i : i + batch_size]
                index.upsert(vectors=batch)

        all_to_publish = []
        for page_list in image_results:
            all_to_publish.extend(page_list)

        for item in all_to_publish:
            publish_image_processing_message(item)

        get_knowledge_base_collection().update_one(
            {"_id": ObjectId(file_id)},
            {
                "$set": {
                    "indexingStatus": "INDEXED",
                    "embeddingIds": embedding_ids,
                    "updatedAt": datetime.now(timezone.utc),
                }
            },
        )

        log.info(
            "[trace_id=%s] PDF pipeline done: %d text vectors, %d images published",
            trace,
            len(embedding_ids),
            len(all_to_publish),
        )
        return {
            "fileId": file_id,
            "pages": total_pages,
            "textVectors": len(embedding_ids),
            "imagesPublished": len(all_to_publish),
        }
    finally:
        os.unlink(pdf_path)
        log.info("[trace_id=%s] Temp PDF deleted", trace)
