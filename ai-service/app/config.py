import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # General
    app_name: str = "InboxIQ AI Service"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Database (use environment variable, fallback to localhost)
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:password@localhost:5432/postgres"
    )

    # Gemini API
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    # Embedding config
    embedding_model: str = "models/text-embedding-004"
    embedding_dimension: int = 768

    # Classification config
    classification_model: str = "models/gemini-2.0-flash"

    # RAG config
    rag_model: str = "models/gemini-2.0-flash"
    rag_top_k: int = 20
    rag_max_context_tokens: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
