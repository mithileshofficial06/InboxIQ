import psycopg
from pgvector.psycopg import register_vector
from typing import List, Dict, Optional
from contextlib import asynccontextmanager
from app.config import get_settings


class PgVectorStore:
    """PostgreSQL + pgvector operations for embedding storage and similarity search."""

    def __init__(self):
        self.conn = None

    async def connect(self):
        """Establish database connection and register pgvector type."""
        settings = get_settings()
        self.conn = await psycopg.AsyncConnection.connect(
            settings.database_url,
            autocommit=True,
        )
        await register_vector(self.conn)

    async def close(self):
        """Close database connection."""
        if self.conn:
            await self.conn.close()
            self.conn = None

    async def store_chunk(self, email_id: str, user_id: str, chunk_text: str, chunk_index: int, token_count: int) -> str:
        """Store an email chunk and return its ID."""
        async with self.conn.cursor() as cur:
            await cur.execute(
                """INSERT INTO email_chunks (email_id, user_id, chunk_text, chunk_index, token_count)
                   VALUES (%s, %s, %s, %s, %s)
                   RETURNING id""",
                (email_id, user_id, chunk_text, chunk_index, token_count),
            )
            result = await cur.fetchone()
            return str(result[0])

    async def store_embedding(self, chunk_id: str, user_id: str, embedding: List[float]):
        """Store a vector embedding for a chunk."""
        async with self.conn.cursor() as cur:
            await cur.execute(
                """INSERT INTO embeddings (chunk_id, user_id, embedding)
                   VALUES (%s, %s, %s::vector)""",
                (chunk_id, user_id, str(embedding)),
            )

    async def similarity_search(
        self,
        query_embedding: List[float],
        user_id: str,
        top_k: int = 20,
        category: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
    ) -> List[Dict]:
        """
        Find the top-k most similar email chunks using pgvector HNSW index.
        Returns chunks with similarity scores and email metadata.
        Supports filtering by category and date range.
        """
        # Build dynamic WHERE clause
        where_conditions = ["emb.user_id = %s"]
        params = [user_id]
        
        if category:
            where_conditions.append("e.category = %s")
            params.append(category)
        
        if date_from:
            where_conditions.append("e.received_at >= %s")
            params.append(date_from)
        
        if date_to:
            where_conditions.append("e.received_at <= %s")
            params.append(date_to)
        
        where_clause = " AND ".join(where_conditions)
        
        async with self.conn.cursor() as cur:
            query = f"""
                SELECT 
                    ec.id as chunk_id,
                    ec.email_id,
                    ec.chunk_text,
                    ec.chunk_index,
                    e.subject,
                    e.sender_name,
                    e.sender_email,
                    e.received_at,
                    e.category,
                    e.sentiment,
                    1 - (emb.embedding <=> %s::vector) as similarity
                FROM embeddings emb
                JOIN email_chunks ec ON emb.chunk_id = ec.id
                JOIN emails e ON ec.email_id = e.id
                WHERE {where_clause}
                ORDER BY emb.embedding <=> %s::vector
                LIMIT %s
            """
            
            # Parameters: [user_id, ...filters, query_embedding, query_embedding, top_k]
            all_params = params + [str(query_embedding), str(query_embedding), top_k]
            
            await cur.execute(query, all_params)
            rows = await cur.fetchall()

            results = []
            for row in rows:
                results.append({
                    "chunk_id": str(row[0]),
                    "email_id": str(row[1]),
                    "chunk_text": row[2],
                    "chunk_index": row[3],
                    "subject": row[4],
                    "sender_name": row[5],
                    "sender_email": row[6],
                    "received_at": str(row[7]) if row[7] else None,
                    "category": row[8],
                    "sentiment": row[9],
                    "similarity": float(row[10]),
                })

            return results

    async def update_email_classification(
        self, email_id: str, category: str, sentiment: str, sentiment_score: float
    ):
        """Update email with classification results."""
        async with self.conn.cursor() as cur:
            await cur.execute(
                """UPDATE emails 
                   SET category = %s, sentiment = %s, sentiment_score = %s, is_processed = true
                   WHERE id = %s""",
                (category, sentiment, sentiment_score, email_id),
            )


# Singleton
_store: Optional[PgVectorStore] = None


async def get_vector_store() -> PgVectorStore:
    """Get or create the pgvector store singleton."""
    global _store
    if _store is None:
        _store = PgVectorStore()
        await _store.connect()
    return _store


async def close_vector_store():
    """Close the pgvector store connection."""
    global _store
    if _store:
        await _store.close()
        _store = None
