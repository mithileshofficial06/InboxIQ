from openai import OpenAI
from typing import List, Dict
from app.config import get_settings
from app.services.embeddings import generate_query_embedding
from app.db.pgvector import get_vector_store


async def rag_query(query: str, user_id: str, top_k: int = 20) -> Dict:
    """
    Execute the full RAG pipeline:
    1. Embed the user query
    2. Similarity search in pgvector
    3. Build augmented prompt with retrieved context
    4. Generate answer with NVIDIA NIM (Llama 3.3 70B)
    5. Return answer + source references
    """
    settings = get_settings()
    
    # Initialize OpenAI client with NVIDIA NIM endpoint
    client = OpenAI(
        base_url=settings.nvidia_base_url,
        api_key=settings.nvidia_api_key
    )

    # Step 1: Embed the query
    query_embedding = await generate_query_embedding(query)

    # Step 2: Retrieve relevant chunks
    store = await get_vector_store()
    chunks = await store.similarity_search(query_embedding, user_id, top_k)

    if not chunks:
        return {
            "answer": "I couldn't find any relevant emails matching your query. Try syncing your inbox first or rephrasing your question.",
            "sources": [],
            "query": query,
        }

    # Step 3: Build context from retrieved chunks
    context_parts = []
    for i, chunk in enumerate(chunks):
        context_parts.append(
            f"[Email {i+1}] From: {chunk['sender_email']} | Subject: {chunk['subject']} | Date: {chunk['date']}\n"
            f"{chunk['chunk_text']}\n"
        )

    context = "\n---\n".join(context_parts)

    # Step 4: Generate answer
    prompt = f"""You are InboxIQ, an AI assistant that answers questions about a user's Gmail inbox.
You have access to the following relevant email excerpts retrieved from the user's inbox.

IMPORTANT RULES:
- Only answer based on the provided email context below. Do NOT make up information.
- If the emails don't contain enough information to answer, say so honestly.
- Reference specific emails by their subject line and sender when relevant.
- Be concise but thorough.
- Format your response with markdown for readability.

--- RETRIEVED EMAILS ---
{context}
--- END EMAILS ---

User Question: {query}

Answer:"""

    response = client.chat.completions.create(
        model=settings.rag_model,
        messages=[
            {"role": "system", "content": "You are InboxIQ, an AI assistant that helps users understand their email inbox. Be helpful, accurate, and concise."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=2048,
    )

    # Step 5: Format sources
    sources = []
    seen_emails = set()
    for chunk in chunks[:10]:  # Top 10 sources
        if chunk["email_id"] not in seen_emails:
            sources.append({
                "email_id": chunk["email_id"],
                "chunk_text": chunk["chunk_text"][:200] + "..." if len(chunk["chunk_text"]) > 200 else chunk["chunk_text"],
                "similarity_score": chunk["similarity_score"],
                "subject": chunk["subject"],
                "sender_email": chunk["sender_email"],
                "date": chunk["date"],
            })
            seen_emails.add(chunk["email_id"])

    return {
        "answer": response.choices[0].message.content,
        "sources": sources,
        "query": query,
    }
