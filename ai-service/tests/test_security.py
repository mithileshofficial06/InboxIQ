"""
The AI service trusts whatever user_id it is handed, so the shared service token
is the whole boundary keeping it a private backend component. Most important
case here is the fail-closed one: an unset token must refuse every request, not
quietly serve them unauthenticated.
"""

import pytest
from fastapi import HTTPException

from app.security import generate_service_token, require_service_token


class _Settings:
    """Minimal stand-in for the real Settings object."""

    def __init__(self, token):
        self.ai_service_token = token


@pytest.fixture
def configured_token(monkeypatch):
    """Patch get_settings rather than env vars — Settings is lru_cache'd."""

    def _configure(token):
        monkeypatch.setattr("app.security.get_settings", lambda: _Settings(token))

    return _configure


async def test_accepts_matching_token(configured_token):
    configured_token("the-shared-secret")

    assert await require_service_token("the-shared-secret") is None


async def test_rejects_wrong_token(configured_token):
    configured_token("the-shared-secret")

    with pytest.raises(HTTPException) as exc:
        await require_service_token("wrong-secret")

    assert exc.value.status_code == 401


async def test_rejects_missing_header(configured_token):
    configured_token("the-shared-secret")

    with pytest.raises(HTTPException) as exc:
        await require_service_token(None)

    assert exc.value.status_code == 401


async def test_rejects_empty_header(configured_token):
    configured_token("the-shared-secret")

    with pytest.raises(HTTPException) as exc:
        await require_service_token("")

    assert exc.value.status_code == 401


async def test_fails_closed_when_token_unconfigured(configured_token):
    configured_token("")

    with pytest.raises(HTTPException) as exc:
        await require_service_token("anything")

    # 503, not 401 — the service is misconfigured, and it refuses to serve
    # rather than running without authentication.
    assert exc.value.status_code == 503


async def test_rejects_token_that_is_a_prefix_of_the_real_one(configured_token):
    configured_token("the-shared-secret")

    with pytest.raises(HTTPException) as exc:
        await require_service_token("the-shared")

    assert exc.value.status_code == 401


def test_generate_service_token_is_random_and_substantial():
    tokens = {generate_service_token() for _ in range(20)}

    assert len(tokens) == 20
    assert all(len(t) >= 32 for t in tokens)
