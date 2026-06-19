from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# --- Request Models ---

class EmailForProcessing(BaseModel):
    email_id: str
    subject: str
    snippet: str
    sender_email: str
    body_text: str


class BatchProcessRequest(BaseModel):
    user_id: str
    emails: list[EmailForProcessing]


class ClassifyRequest(BaseModel):
    subject: str
    snippet: str
    sender_email: str


class BatchClassifyRequest(BaseModel):
    emails: list[ClassifyRequest]


class EmbedRequest(BaseModel):
    email_id: str
    user_id: str
    body_text: str
    subject: str


class BatchEmbedRequest(BaseModel):
    user_id: str
    emails: list[EmbedRequest]


class RAGQueryRequest(BaseModel):
    query: str
    user_id: str
    top_k: int = 20


# --- Response Models ---

class ClassifyResponse(BaseModel):
    category: str
    sentiment: str
    sentiment_score: float


class ChunkData(BaseModel):
    chunk_text: str
    chunk_index: int
    token_count: int


class RAGSourceEmail(BaseModel):
    email_id: str
    chunk_text: str
    similarity_score: float
    subject: Optional[str] = None
    sender_email: Optional[str] = None
    date: Optional[str] = None


class RAGResponse(BaseModel):
    answer: str
    sources: list[RAGSourceEmail]
    query: str


class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: str
