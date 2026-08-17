"""
Chunking decides what ever reaches the embedding model, so a body that silently
produces zero chunks is an email that can never be found by semantic search.
These cover the fallbacks and the size guarantees.
"""

from app.services.chunker import chunk_email, estimate_tokens, split_by_sentences

MAX = 1500


def test_empty_body_falls_back_to_subject():
    chunks = chunk_email("", subject="Your invoice is ready")

    assert len(chunks) == 1
    assert "Your invoice is ready" in chunks[0]["chunk_text"]


def test_whitespace_only_body_falls_back_to_subject():
    chunks = chunk_email("   \n\t  ", subject="Subject line")

    assert len(chunks) == 1
    assert "Subject line" in chunks[0]["chunk_text"]


def test_empty_body_and_no_subject_produces_nothing():
    assert chunk_email("", subject="") == []


def test_short_body_produces_a_single_chunk_including_the_subject():
    chunks = chunk_email("Thanks for your order.", subject="Order #123")

    assert len(chunks) == 1
    assert "Order #123" in chunks[0]["chunk_text"]
    assert "Thanks for your order." in chunks[0]["chunk_text"]


def test_chunks_are_indexed_sequentially():
    body = "\n\n".join(f"Paragraph {i} " + "word " * 100 for i in range(10))

    chunks = chunk_email(body, subject="Long")

    assert [c["chunk_index"] for c in chunks] == list(range(len(chunks)))


def test_long_body_splits_into_multiple_chunks():
    body = "\n\n".join("word " * 100 for _ in range(20))

    chunks = chunk_email(body, subject="Long")

    assert len(chunks) > 1


def test_reply_boundary_splits_into_separate_sections():
    body = (
        "Here is my reply to your question.\n"
        "On Mon, Jan 1 2026 at 10:00, Alice wrote:\n"
        "This was the original question."
    )

    chunks = chunk_email(body, subject="Re: Question")

    assert len(chunks) > 1


def test_original_message_marker_splits_sections():
    body = (
        "Latest response here.\n"
        "----- Original Message -----\n"
        "The earlier message body."
    )

    chunks = chunk_email(body, subject="Fwd")

    assert len(chunks) > 1


def test_oversized_single_paragraph_is_split_by_sentences():
    # One paragraph, no blank lines — only the sentence splitter can break this.
    body = " ".join(f"This is sentence number {i} in a very long paragraph." for i in range(200))

    chunks = chunk_email(body, subject="Wall of text")

    assert len(chunks) > 1


def test_later_chunks_carry_overlap_from_the_previous_chunk():
    body = "\n\n".join("word " * 100 for _ in range(20))

    chunks = chunk_email(body, subject="Long")

    assert chunks[0]["chunk_text"].startswith("Subject: Long")
    assert chunks[1]["chunk_text"].startswith("...")


def test_overlap_can_be_disabled():
    body = "\n\n".join("word " * 100 for _ in range(20))

    chunks = chunk_email(body, subject="Long", overlap_chars=0)

    assert not chunks[1]["chunk_text"].startswith("...")


def test_every_chunk_reports_a_positive_token_count():
    chunks = chunk_email("Some ordinary email body text.", subject="Hello")

    assert all(c["token_count"] >= 1 for c in chunks)


def test_no_chunk_is_empty_or_untrimmed():
    body = "\n\n".join("word " * 100 for _ in range(10))

    chunks = chunk_email(body, subject="Long")

    for chunk in chunks:
        text = chunk["chunk_text"]
        assert text
        assert text == text.strip()


def test_split_by_sentences_respects_the_char_limit():
    text = " ".join(f"Sentence {i} here." for i in range(100))

    parts = split_by_sentences(text, max_chars=200, overlap_chars=0)

    assert len(parts) > 1
    assert all(len(p) <= 200 for p in parts)


def test_estimate_tokens_never_returns_zero():
    assert estimate_tokens("") == 1
    assert estimate_tokens("a" * 400) == 100
