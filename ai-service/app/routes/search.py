from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.embeddings import generate_query_embedding
from app.db.pgvector import get_vector_store
from typing import Optional

router = APIRouter(prefix="/ai/search", tags=["search"])


class SemanticSearchRequest(BaseModel):
    query: str
    user_id: str
    top_k: int = 20
    category: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class SearchResult(BaseModel):
    email_id: str
    chunk_text: str
    similarity_score: float
    subject: Optional[str] = None
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None
    received_at: Optional[str] = None
    category: Optional[str] = None
    sentiment: Optional[str] = None


class SemanticSearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
    total_found: int


@router.post("/semantic", response_model=SemanticSearchResponse)
async def semantic_search(request: SemanticSearchRequest):
    """
    Perform semantic search across user's emails using vector similarity.
    
    Returns top-k most relevant email chunks with metadata.
    """
    try:
        # Generate embedding for the query
        query_embedding = await generate_query_embedding(request.query)
        
        # Get vector store
        store = await get_vector_store()
        
        # Perform similarity search
        results = await store.similarity_search(
            user_id=request.user_id,
            query_embedding=query_embedding,
            top_k=request.top_k,
            category=request.category,
            date_from=request.date_from,
            date_to=request.date_to,
        )
        
        # Format results
        formatted_results = [
            SearchResult(
                email_id=r["email_id"],
                chunk_text=r["chunk_text"],
                similarity_score=round(r["similarity"], 4),
                subject=r.get("subject"),
                sender_name=r.get("sender_name"),
                sender_email=r.get("sender_email"),
                received_at=r.get("received_at"),
                category=r.get("category"),
                sentiment=r.get("sentiment"),
            )
            for r in results
        ]
        
        return {
            "query": request.query,
            "results": formatted_results,
            "total_found": len(formatted_results),
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")
