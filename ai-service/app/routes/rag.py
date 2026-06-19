from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import RAGQueryRequest, RAGResponse
from app.services.rag_pipeline import rag_query

router = APIRouter(prefix="/ai/rag", tags=["rag"])


@router.post("/query", response_model=RAGResponse)
async def query_rag(request: RAGQueryRequest):
    """
    Execute a RAG query over the user's email embeddings.
    Returns a grounded answer with source email references.
    """
    result = await rag_query(
        query=request.query,
        user_id=request.user_id,
        top_k=request.top_k,
    )

    return RAGResponse(
        answer=result["answer"],
        sources=result["sources"],
        query=result["query"],
    )
