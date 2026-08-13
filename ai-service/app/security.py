"""
Service-to-service authentication for the AI service.

This service is a private backend component. It trusts the `user_id` in every
request body, which means anyone able to reach it can read or modify any user's
email data. It must therefore never be exposed to browsers or the public
internet — the Express backend is the only permitted caller, and it proves that
by presenting a shared secret.
"""

import hmac
import secrets
from typing import Optional

from fastapi import Header, HTTPException, status

from app.config import get_settings

SERVICE_TOKEN_HEADER = "X-Service-Token"


async def require_service_token(
    # Optional[...] rather than `str | None`: FastAPI evaluates this annotation
    # at runtime and the union syntax needs Python 3.10, while this service
    # targets 3.9+.
    x_service_token: Optional[str] = Header(default=None, alias=SERVICE_TOKEN_HEADER),
) -> None:
    """
    FastAPI dependency: reject any caller that cannot present the shared secret.

    Fails closed — if AI_SERVICE_TOKEN is unset the service refuses every request
    rather than silently running unauthenticated.
    """
    settings = get_settings()
    expected = settings.ai_service_token

    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI_SERVICE_TOKEN is not configured. The AI service refuses to "
                "serve requests unauthenticated."
            ),
        )

    if not x_service_token or not hmac.compare_digest(x_service_token, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing service token.",
        )


def generate_service_token() -> str:
    """Helper for operators: produce a suitable AI_SERVICE_TOKEN value."""
    return secrets.token_urlsafe(32)
