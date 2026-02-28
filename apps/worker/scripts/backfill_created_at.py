"""
Backfill createdAt and updatedAt for KnowledgeBaseImages records that have null values.

Run from worker root: uv run python scripts/backfill_created_at.py
Requires: DATABASE_URL (or .env with DATABASE_URL)
"""

import logging
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

log = logging.getLogger(__name__)


def _get_collection(name: str):
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL is required")
    return MongoClient(url).get_default_database()[name]


def backfill_images() -> int:
    coll = _get_collection("KnowledgeBaseImages")
    now = datetime.now(timezone.utc)
    result = coll.update_many(
        {"$or": [{"createdAt": {"$exists": False}}, {"createdAt": None}]},
        {"$set": {"createdAt": now, "updatedAt": now}},
    )
    return result.modified_count


def backfill_knowledge_base() -> int:
    coll = _get_collection("KnowledgeBase")
    now = datetime.now(timezone.utc)
    result = coll.update_many(
        {"$or": [{"createdAt": {"$exists": False}}, {"createdAt": None}]},
        {"$set": {"createdAt": now, "updatedAt": now}},
    )
    return result.modified_count


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    img_count = backfill_images()
    kb_count = backfill_knowledge_base()
    log.info("Backfill complete: %d KnowledgeBaseImages, %d KnowledgeBase", img_count, kb_count)


if __name__ == "__main__":
    main()
