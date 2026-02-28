from functools import lru_cache
from pathlib import Path

from dotenv import find_dotenv, load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict


def _get_env_path() -> str:
    """Resolve .env path: search upward from this file, then cwd, then code/."""
    env_path = find_dotenv() or find_dotenv(usecwd=True)
    if env_path:
        return env_path
    return str(Path(__file__).resolve().parent.parent.parent.parent / ".env")


load_dotenv(_get_env_path())


class Settings(BaseSettings):
    """Application settings loaded from .env."""

    model_config = SettingsConfigDict(
        env_file=_get_env_path(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # AWS
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = ""
    AWS_SQS_PDF_INDEXING_QUEUE_URL: str = ""
    AWS_SQS_IMAGE_PROCESSING_QUEUE_URL: str = ""

    # Cloudflare R2
    CLOUDFLARE_ACCOUNT_ID: str = ""
    CLOUDFLARE_R2_ACCESS_KEY_ID: str = ""
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: str = ""
    CLOUDFLARE_R2_FILES_BUCKET_NAME: str = ""
    CLOUDFLARE_R2_IMAGES_BUCKET_NAME: str = ""

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_VISION_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_PDF_INDEX_NAME: str = ""
    PINECONE_IMG_TEXT_INDEX_NAME: str = ""

    # MongoDB
    DATABASE_URL: str = ""

    # Asset processing constants (moved from asset_processing/config)
    MIN_IMAGE_WIDTH: int = 400
    MIN_IMAGE_HEIGHT: int = 400
    MIN_UNIQUE_COLORS: int = 100
    MAX_LAPLACIAN_VAR: int = 600
    MIN_LOW_FREQ_RATIO: float = 0.38
    MAX_MEAN_BLANK: int = 245
    MIN_STD_UNIFORM: int = 15
    CHUNK_SIZE: int = 1024
    CHUNK_OVERLAP: int = 150
    EMBED_DIM: int = 1536
    IMAGE_BATCH_SIZE: int = 5
    EMBED_BATCH_SIZE: int = 100
    PINECONE_UPSERT_BATCH_SIZE: int = 100


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
