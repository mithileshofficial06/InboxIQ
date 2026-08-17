"""
Classification has two paths: the LLM, and a keyword fallback that must catch
every way the LLM call can fail. The fallback is what keeps sync working when
NVIDIA is unreachable or returns something unparseable.
"""

import json

import pytest

from app.services import classifier
from app.services.classifier import CATEGORIES, _keyword_classify, classify_email


class _FakeMessage:
    def __init__(self, content):
        self.content = content


class _FakeChoice:
    def __init__(self, content):
        self.message = _FakeMessage(content)


class _FakeResponse:
    def __init__(self, content):
        self.choices = [_FakeChoice(content)]


def _fake_openai(content=None, error=None):
    """Build a stand-in OpenAI client class returning canned content (or raising)."""

    class _Completions:
        def create(self, **kwargs):
            if error is not None:
                raise error
            return _FakeResponse(content)

    class _Chat:
        completions = _Completions()

    class _Client:
        def __init__(self, *args, **kwargs):
            self.chat = _Chat()

    return _Client


@pytest.fixture
def patch_openai(monkeypatch):
    def _patch(content=None, error=None):
        monkeypatch.setattr(classifier, "OpenAI", _fake_openai(content, error))

    return _patch


# --- LLM path ---


async def test_parses_a_valid_json_response(patch_openai):
    patch_openai(
        json.dumps(
            {"category": "Bills & Invoices", "sentiment": "neutral", "sentiment_score": 0.0}
        )
    )

    result = await classify_email("Your invoice", "Amount due", "billing@example.com")

    assert result["category"] == "Bills & Invoices"
    assert result["sentiment"] == "neutral"
    assert result["sentiment_score"] == 0.0


async def test_strips_markdown_fenced_json(patch_openai):
    payload = json.dumps(
        {"category": "Newsletters", "sentiment": "positive", "sentiment_score": 0.5}
    )
    patch_openai(f"```json\n{payload}\n```")

    result = await classify_email("Weekly digest", "Top stories", "news@example.com")

    assert result["category"] == "Newsletters"
    assert result["sentiment_score"] == 0.5


async def test_unknown_category_falls_back_to_real_people(patch_openai):
    patch_openai(
        json.dumps({"category": "Totally Made Up", "sentiment": "neutral", "sentiment_score": 0.0})
    )

    result = await classify_email("Hi", "Hello there", "friend@example.com")

    assert result["category"] == "Real People"


async def test_missing_sentiment_fields_get_defaults(patch_openai):
    patch_openai(json.dumps({"category": "Promotions"}))

    result = await classify_email("50% off", "Sale ends soon", "deals@example.com")

    assert result["category"] == "Promotions"
    assert result["sentiment"] == "neutral"
    assert result["sentiment_score"] == 0.0


async def test_result_category_is_always_a_known_category(patch_openai):
    patch_openai(json.dumps({"category": "Job Applications", "sentiment": "neutral"}))

    result = await classify_email("Interview", "Schedule", "hr@example.com")

    assert result["category"] in CATEGORIES


# --- Fallback path ---


async def test_falls_back_to_keywords_when_the_llm_raises(patch_openai):
    patch_openai(error=RuntimeError("NVIDIA unreachable"))

    result = await classify_email(
        "Your invoice is attached", "Payment due next week", "billing@example.com"
    )

    assert result["category"] == "Bills & Invoices"


async def test_falls_back_when_the_llm_returns_unparseable_text(patch_openai):
    patch_openai("I'm sorry, I can't help with that.")

    result = await classify_email(
        "Flight booking confirmed", "Your itinerary", "travel@example.com"
    )

    assert result["category"] == "Travel & Bookings"


# --- Keyword heuristics ---


@pytest.mark.parametrize(
    "subject,snippet,expected",
    [
        ("Your invoice", "amount due now", "Bills & Invoices"),
        ("Interview scheduled", "for the position", "Job Applications"),
        ("Your order shipped", "tracking number inside", "Orders & Deliveries"),
        ("Your OTP", "security code is 1234", "OTPs & Notifications"),
        ("Weekly newsletter", "unsubscribe anytime", "Newsletters"),
        ("Assignment due", "for this semester course", "Academic"),
        ("Flash sale", "discount coupon inside", "Promotions"),
        ("Booking confirmed", "your flight itinerary", "Travel & Bookings"),
    ],
)
def test_keyword_classify_matches_each_category(subject, snippet, expected):
    result = _keyword_classify(subject, snippet, "sender@example.com")

    assert result["category"] == expected


def test_keyword_classify_defaults_to_real_people():
    result = _keyword_classify("Lunch tomorrow?", "See you at noon", "friend@example.com")

    assert result["category"] == "Real People"


@pytest.mark.parametrize(
    "sender",
    [
        "noreply@example.com",
        "no-reply@example.com",
        "notifications@example.com",
        "mailer@example.com",
        "donotreply@example.com",
    ],
)
def test_noreply_senders_are_treated_as_notifications(sender):
    result = _keyword_classify("Update", "Something happened", sender)

    assert result["category"] == "OTPs & Notifications"


def test_noreply_heuristic_does_not_override_a_keyword_match():
    result = _keyword_classify("Your invoice", "amount due", "noreply@billing.example.com")

    assert result["category"] == "Bills & Invoices"


def test_keyword_classify_is_case_insensitive():
    result = _keyword_classify("YOUR INVOICE", "AMOUNT DUE", "billing@example.com")

    assert result["category"] == "Bills & Invoices"


def test_keyword_classify_returns_neutral_sentiment():
    result = _keyword_classify("Anything", "at all", "someone@example.com")

    assert result["sentiment"] == "neutral"
    assert result["sentiment_score"] == 0.0
