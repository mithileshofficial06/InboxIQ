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

    # NVIDIA NIM API (Meta Llama 3.3 70B)
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", os.getenv("GEMINI_API_KEY", ""))
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    
    # Model config
    llm_model: str = "meta/llama-3.3-70b-instruct"  # NVIDIA NIM model
    embedding_model: str = "nvidia/nv-embedqa-e5-v5"  # NVIDIA embedding model
    embedding_dimension: int = 1024  # NV-Embed-v2 dimension

    # Classification config
    classification_model: str = "meta/llama-3.3-70b-instruct"

    # RAG config
    rag_model: str = "meta/llama-3.3-70b-instruct"
    rag_top_k: int = 20
    rag_max_context_tokens: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
