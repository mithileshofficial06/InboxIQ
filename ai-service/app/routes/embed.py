from fastapi import APIRouter
from app.models.schemas import EmbedRequest, BatchEmbedRequest
from app.services.chunker import chunk_email
from app.services.embeddings import generate_embedding, generate_query_embedding
from app.db.pgvector import get_vector_store
from pydantic import BaseModel

router = APIRouter(prefix="/ai/embed", tags=["embeddings"])


class QueryEmbedRequest(BaseModel):
    query: str


class QueryEmbedResponse(BaseModel):
    query: str
    embedding: list[float]
    dimension: int


@router.post("/")
async def embed_single(request: EmbedRequest):
    """Chunk and embed a single email."""
    # Chunk the email
    chunks = chunk_email(request.body_text, request.subject)

    store = await get_vector_store()
    chunk_ids = []

    for chunk_data in chunks:
        # Store chunk
        chunk_id = await store.store_chunk(
            email_id=request.email_id,
            user_id=request.user_id,
            chunk_text=chunk_data["chunk_text"],
            chunk_index=chunk_data["chunk_index"],
            token_count=chunk_data["token_count"],
        )

        # Generate and store embedding
        embedding = await generate_embedding(chunk_data["chunk_text"])
        await store.store_embedding(chunk_id, request.user_id, embedding)
        chunk_ids.append(chunk_id)

    return {
        "email_id": request.email_id,
        "chunks_created": len(chunk_ids),
        "chunk_ids": chunk_ids,
    }


@router.post("/batch")
async def embed_batch(request: BatchEmbedRequest):
    """Chunk and embed a batch of emails."""
    results = []

    for email in request.emails:
        try:
            chunks = chunk_email(email.body_text, email.subject)
            store = await get_vector_store()
            chunk_count = 0

            for chunk_data in chunks:
                chunk_id = await store.store_chunk(
                    email_id=email.email_id,
                    user_id=request.user_id,
                    chunk_text=chunk_data["chunk_text"],
                    chunk_index=chunk_data["chunk_index"],
                    token_count=chunk_data["token_count"],
                )

                embedding = await generate_embedding(chunk_data["chunk_text"])
                await store.store_embedding(chunk_id, request.user_id, embedding)
                chunk_count += 1

            results.append({
                "email_id": email.email_id,
                "chunks_created": chunk_count,
                "status": "success",
            })
        except Exception as e:
            results.append({
                "email_id": email.email_id,
                "chunks_created": 0,
                "status": "error",
                "error": str(e),
            })

    return {"results": results}


@router.post("/query", response_model=QueryEmbedResponse)
async def embed_query(request: QueryEmbedRequest):
    """Generate embedding for a search query."""
    embedding = await generate_query_embedding(request.query)
    
    return {
        "query": request.query,
        "embedding": embedding,
        "dimension": len(embedding),
    }
