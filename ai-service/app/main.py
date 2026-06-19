from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.pgvector import close_vector_store
from app.routes import classify, embed, rag, health, process


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print("🚀 InboxIQ AI Service starting...")
    yield
    print("🛑 Shutting down AI Service...")
    await close_vector_store()


app = FastAPI(
    title="InboxIQ AI Service",
    description="AI-powered email classification, embedding, and RAG pipeline",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router)
app.include_router(classify.router)
app.include_router(embed.router)
app.include_router(rag.router)
app.include_router(process.router)


@app.get("/")
async def root():
    return {
        "service": "InboxIQ AI Service",
        "version": "1.0.0",
        "docs": "/docs",
    }
