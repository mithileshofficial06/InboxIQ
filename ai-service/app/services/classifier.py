import google.generativeai as genai
import json
import re
from app.config import get_settings

# Category definitions
CATEGORIES = [
    "Bills & Invoices",
    "Job Applications",
    "Orders & Deliveries",
    "OTPs & Notifications",
    "Newsletters",
    "Real People",
    "Academic",
    "Promotions",
    "Travel & Bookings",
]

# Keyword-based fallback heuristics
KEYWORD_RULES = {
    "Bills & Invoices": ["invoice", "payment", "receipt", "billing", "statement", "due date", "amount due"],
    "Job Applications": ["application", "interview", "position", "hiring", "resume", "job", "offer letter", "candidacy", "recruitment"],
    "Orders & Deliveries": ["order", "shipped", "delivered", "tracking", "dispatch", "package", "delivery"],
    "OTPs & Notifications": ["otp", "verification code", "one-time", "security code", "2fa", "confirm your", "verify your"],
    "Newsletters": ["newsletter", "unsubscribe", "weekly digest", "daily update", "roundup"],
    "Academic": ["course", "assignment", "grade", "semester", "university", "professor", "lecture", "exam"],
    "Promotions": ["sale", "discount", "off", "deal", "offer", "promo", "coupon", "limited time"],
    "Travel & Bookings": ["booking", "reservation", "flight", "hotel", "itinerary", "travel", "check-in", "boarding"],
}


async def classify_email(subject: str, snippet: str, sender_email: str) -> dict:
    """
    Classify an email into one of 9 categories using Gemini LLM.
    Falls back to keyword heuristics if LLM fails.
    
    Returns: {category, sentiment, sentiment_score}
    """
    try:
        return await _llm_classify(subject, snippet, sender_email)
    except Exception as e:
        print(f"[Classifier] LLM classification failed: {e}, using fallback")
        return _keyword_classify(subject, snippet, sender_email)


async def _llm_classify(subject: str, snippet: str, sender_email: str) -> dict:
    """Use Gemini LLM for classification + sentiment."""
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)

    model = genai.GenerativeModel(settings.classification_model)

    prompt = f"""Analyze this email and provide classification and sentiment analysis.

Email Details:
- Subject: {subject}
- Preview: {snippet}
- Sender: {sender_email}

Classify into EXACTLY ONE of these categories:
{json.dumps(CATEGORIES)}

Also analyze the sentiment as: positive, negative, or neutral.
Give a sentiment score from -1.0 (very negative) to 1.0 (very positive).

Respond in valid JSON format ONLY, no other text:
{{"category": "category name", "sentiment": "positive|negative|neutral", "sentiment_score": 0.0}}"""

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )

    # Parse JSON response
    text = response.text.strip()
    # Handle potential markdown code blocks
    if text.startswith("```"):
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)

    result = json.loads(text)

    # Validate category
    if result.get("category") not in CATEGORIES:
        result["category"] = "Real People"  # Default fallback

    return {
        "category": result["category"],
        "sentiment": result.get("sentiment", "neutral"),
        "sentiment_score": float(result.get("sentiment_score", 0.0)),
    }


def _keyword_classify(subject: str, snippet: str, sender_email: str) -> dict:
    """Fallback keyword-based classification."""
    text = f"{subject} {snippet}".lower()
    sender = sender_email.lower()

    # Check each category's keywords
    best_category = "Real People"
    best_score = 0

    for category, keywords in KEYWORD_RULES.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > best_score:
            best_score = score
            best_category = category

    # Check if sender looks like a notification/noreply
    if any(x in sender for x in ["noreply", "no-reply", "notifications", "mailer", "donotreply"]):
        if best_category == "Real People":
            best_category = "OTPs & Notifications"

    return {
        "category": best_category,
        "sentiment": "neutral",
        "sentiment_score": 0.0,
    }


async def batch_classify(emails: list) -> list:
    """Classify a batch of emails."""
    results = []
    for email in emails:
        result = await classify_email(
            email.get("subject", ""),
            email.get("snippet", ""),
            email.get("sender_email", ""),
        )
        results.append(result)
    return results
