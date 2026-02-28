from functools import lru_cache

from openai import OpenAI

from worker.core.config import get_settings


@lru_cache(maxsize=1)
def get_openai_client() -> OpenAI:
    s = get_settings()
    return OpenAI(api_key=s.OPENAI_API_KEY)
