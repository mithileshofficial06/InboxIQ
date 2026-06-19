from fastapi import APIRouter
from app.models.schemas import BatchProcessRequest
from app.services.chunker import chunk_email
from app.services.embeddings import generate_embedding
from app.services.classifier import classify_email
from app.db.pgvector import get_vector_store

router = APIRouter(prefix="/ai/process", tags=["processing"])


@router.post("/batch")
async def process_batch(request: BatchProcessRequest):
    """
    Full processing pipeline for a batch of emails:
    1. Classify each email (category + sentiment)
    2. Chunk each email body
    3. Generate embeddings for each chunk
    4. Store chunks and embeddings in pgvector
    5. Update email records with classification
    """
    results = []
    store = await get_vector_store()

    for email in request.emails:
        try:
            # Step 1: Classify
            classification = await classify_email(
                email.subject, email.snippet, email.sender_email
            )

            # Step 2: Update email with classification
            await store.update_email_classification(
                email_id=email.email_id,
                category=classification["category"],
                sentiment=classification["sentiment"],
                sentiment_score=classification["sentiment_score"],
            )

            # Step 3: Chunk the email body
            chunks = chunk_email(email.body_text, email.subject)

            # Step 4: Embed and store each chunk
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
                "category": classification["category"],
                "sentiment": classification["sentiment"],
                "chunks_created": chunk_count,
                "status": "success",
            })

        except Exception as e:
            print(f"[Process] Error processing email {email.email_id}: {e}")
            results.append({
                "email_id": email.email_id,
                "status": "error",
                "error": str(e),
            })

    return {
        "processed": len([r for r in results if r["status"] == "success"]),
        "failed": len([r for r in results if r["status"] == "error"]),
        "results": results,
    }
