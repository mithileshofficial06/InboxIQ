from fastapi import APIRouter
from app.models.schemas import ClassifyRequest, ClassifyResponse, BatchClassifyRequest
from app.services.classifier import classify_email, batch_classify

router = APIRouter(prefix="/ai/classify", tags=["classification"])


@router.post("/", response_model=ClassifyResponse)
async def classify_single(request: ClassifyRequest):
    """Classify a single email into one of 9 categories."""
    result = await classify_email(request.subject, request.snippet, request.sender_email)
    return ClassifyResponse(**result)


@router.post("/batch")
async def classify_batch(request: BatchClassifyRequest):
    """Classify a batch of emails."""
    results = await batch_classify([e.model_dump() for e in request.emails])
    return {"results": results}
