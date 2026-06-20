from openai import OpenAI
from typing import List
from app.config import get_settings


async def generate_embedding(text: str, input_type: str = "passage") -> List[float]:
    """
    Generate a vector embedding for a single text using NVIDIA NIM Embeddings API.
    Returns a list of floats (1024 dimensions for nv-embedqa-e5-v5).
    """
    settings = get_settings()
    
    # Initialize OpenAI client with NVIDIA NIM endpoint
    client = OpenAI(
        base_url=settings.nvidia_base_url,
        api_key=settings.nvidia_api_key
    )

    response = client.embeddings.create(
        model=settings.embedding_model,
        input=text,
        encoding_format="float",
        extra_body={"input_type": input_type}
    )

    return response.data[0].embedding


async def generate_query_embedding(text: str) -> List[float]:
    """
    Generate embedding for a search query.
    Uses the same model as document embeddings.
    """
    return await generate_embedding(text, input_type="query")


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
