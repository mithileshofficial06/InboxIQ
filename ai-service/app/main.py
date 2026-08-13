from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI
from app.db.pgvector import close_vector_store
from app.routes import classify, embed, rag, health, process, search
from app.security import require_service_token


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

# No CORS middleware by design.
#
# This service is only ever called server-to-server by the Express backend, which
# authenticates with a shared secret. Browsers must not reach it directly — the
# absence of CORS headers is part of that boundary, not an oversight. Bind it to
# localhost (or a private network) in every environment.

# Health is intentionally open so orchestrators can probe it.
app.include_router(health.router)

# Every AI route handles email content and trusts the caller-supplied user_id,
# so all of them sit behind the service token.
_protected = [Depends(require_service_token)]
app.include_router(classify.router, dependencies=_protected)
app.include_router(embed.router, dependencies=_protected)
app.include_router(rag.router, dependencies=_protected)
app.include_router(process.router, dependencies=_protected)
app.include_router(search.router, dependencies=_protected)


@app.get("/")
async def root():
    return {
        "service": "InboxIQ AI Service",
        "version": "1.0.0",
        "docs": "/docs",
    }
