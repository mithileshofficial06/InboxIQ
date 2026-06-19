import google.generativeai as genai
from typing import List
from app.config import get_settings


def _configure():
    """Configure the Gemini API."""
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)


async def generate_embedding(text: str) -> List[float]:
    """
    Generate a vector embedding for a single text using Gemini Embeddings API.
    Returns a list of floats (768 dimensions).
    """
    _configure()
    settings = get_settings()

    result = genai.embed_content(
        model=settings.embedding_model,
        content=text,
        task_type="retrieval_document",
    )

    return result["embedding"]


async def generate_query_embedding(text: str) -> List[float]:
    """
    Generate embedding for a search query (uses retrieval_query task type).
    """
    _configure()
    settings = get_settings()

    result = genai.embed_content(
        model=settings.embedding_model,
        content=text,
        task_type="retrieval_query",
    )

    return result["embedding"]


async def batch_embed(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts.
    Processes sequentially to respect rate limits.
    """
    embeddings = []
    for text in texts:
        embedding = await generate_embedding(text)
        embeddings.append(embedding)
    return embeddings
