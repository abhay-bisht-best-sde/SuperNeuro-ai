import io
import logging
import uuid
from datetime import datetime, timezone

from bson import ObjectId
from PIL import Image

from worker.libs.cloudflare import download_image_from_r2
from worker.libs.mongodb import get_knowledge_base_images_collection
from worker.libs.openai.embeddings import embed_texts
from worker.libs.openai.vision import describe_image_with_vision
from worker.libs.pinecone import get_image_index_name, get_or_create_index

log = logging.getLogger(__name__)


def _trace_id() -> str:
    return str(uuid.uuid4())[:8]


def _get_page_for_image(image_id: str) -> int:
    """Fetch pageNumber from KnowledgeBaseImages."""
    coll = get_knowledge_base_images_collection()
    doc = coll.find_one({"_id": ObjectId(image_id)}, {"pageNumber": 1})
    return doc.get("pageNumber", 0) if doc else 0


def _process_single_image(payload: dict) -> None:
    """Step 1: Update status. Step 2: Download. Step 3: Vision. Step 4: Embed. Step 5: Pinecone. Step 6: Update DB."""
    trace = _trace_id()
    image_id = payload["imageId"]
    kb_id = payload["knowledgeBaseId"]
    r2_key = payload["r2Key"]

    log.info("[trace_id=%s] Processing image imageId=%s", trace, image_id)

    # Step 1: Update status to INDEXING
    coll = get_knowledge_base_images_collection()
    coll.update_one(
        {"_id": ObjectId(image_id)},
        {"$set": {"indexingStatus": "INDEXING", "updatedAt": datetime.now(timezone.utc)}},
    )

    # Step 2: Download from R2
    img_bytes = download_image_from_r2(r2_key)
    pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    # Step 3: Vision model
    description = describe_image_with_vision(pil_img)

    # Step 4: Embed
    [embedding] = embed_texts([description])

    # Step 5: Upsert to Pinecone
    index = get_or_create_index(get_image_index_name())
    vec_id = f"{kb_id}::img::{image_id}"
    page_num = _get_page_for_image(image_id)
    index.upsert(
        vectors=[
            {
                "id": vec_id,
                "values": embedding,
                "metadata": {
                    "kb_id": kb_id,
                    "page": page_num,
                    "text": description[:1000],
                    "image_id": image_id,
                },
            }
        ]
    )

    # Step 6: Update DB
    get_knowledge_base_images_collection().update_one(
        {"_id": ObjectId(image_id)},
        {
            "$set": {
                "textSummary": description,
                "embeddingId": vec_id,
                "indexingStatus": "INDEXED",
                "updatedAt": datetime.now(timezone.utc),
            }
        },
    )
    log.info("[trace_id=%s] Image indexed: %s", trace, image_id)


def run_image_pipeline(payload: dict) -> dict:
    _process_single_image(payload)
    return {"imageId": payload["imageId"], "status": "INDEXED"}
