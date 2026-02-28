from functools import lru_cache
from typing import Any

from pymongo import MongoClient

from worker.core.config import get_settings


@lru_cache(maxsize=1)
def get_mongo_client() -> MongoClient:
    s = get_settings()
    return MongoClient(s.DATABASE_URL)


def get_db() -> Any:
    return get_mongo_client().get_default_database()


def get_knowledge_base_collection() -> Any:
    return get_db()["KnowledgeBase"]


def get_knowledge_base_images_collection() -> Any:
    return get_db()["KnowledgeBaseImages"]
