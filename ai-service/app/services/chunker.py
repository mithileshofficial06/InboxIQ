import re
from typing import List, Dict


def chunk_email(
    body_text: str,
    subject: str = "",
    max_chunk_chars: int = 1500,
    overlap_chars: int = 200,
) -> List[Dict]:
    """
    Splits an email body into semantically meaningful chunks.
    
    Strategy:
    1. First, try to split by reply boundaries (On ... wrote:, > quotes)
    2. Then split long sections by paragraphs
    3. Finally, split by character limit with overlap
    
    Returns list of {chunk_text, chunk_index, token_count}
    """
    if not body_text or not body_text.strip():
        # If no body, use subject + snippet
        if subject:
            return [{
                "chunk_text": f"Subject: {subject}",
                "chunk_index": 0,
                "token_count": estimate_tokens(subject),
            }]
        return []

    # Prepend subject for context
    full_text = f"Subject: {subject}\n\n{body_text}" if subject else body_text

    # Step 1: Split by reply boundaries
    reply_patterns = [
        r'\n[-]{3,}\s*(?:Original Message|Forwarded message)',  # --- Original Message ---
        r'\nOn .+? wrote:',  # On Mon, Jan 1 ... wrote:
        r'\n>{2,}',  # Multiple quote levels
        r'\nFrom: .+?\nSent: .+?\nTo:',  # Outlook style
    ]

    sections = [full_text]
    for pattern in reply_patterns:
        new_sections = []
        for section in sections:
            parts = re.split(pattern, section, flags=re.IGNORECASE)
            new_sections.extend(parts)
        sections = new_sections

    # Step 2: Further split long sections by paragraphs
    chunks = []
    for section in sections:
        section = section.strip()
        if not section:
            continue

        if len(section) <= max_chunk_chars:
            chunks.append(section)
        else:
            # Split by double newlines (paragraphs)
            paragraphs = re.split(r'\n\s*\n', section)
            current_chunk = ""

            for para in paragraphs:
                para = para.strip()
                if not para:
                    continue

                if len(current_chunk) + len(para) + 2 <= max_chunk_chars:
                    current_chunk = f"{current_chunk}\n\n{para}" if current_chunk else para
                else:
                    if current_chunk:
                        chunks.append(current_chunk)
                    
                    # If single paragraph is too long, split by sentences
                    if len(para) > max_chunk_chars:
                        sentence_chunks = split_by_sentences(para, max_chunk_chars, overlap_chars)
                        chunks.extend(sentence_chunks)
                        current_chunk = ""
                    else:
                        current_chunk = para

            if current_chunk:
                chunks.append(current_chunk)

    # Step 3: Build final chunk objects with overlap
    result = []
    for i, chunk_text in enumerate(chunks):
        # Add overlap from previous chunk for context continuity
        if i > 0 and overlap_chars > 0:
            prev_chunk = chunks[i - 1]
            overlap = prev_chunk[-overlap_chars:] if len(prev_chunk) > overlap_chars else prev_chunk
            chunk_text = f"...{overlap}\n\n{chunk_text}"

        result.append({
            "chunk_text": chunk_text.strip(),
            "chunk_index": i,
            "token_count": estimate_tokens(chunk_text),
        })

    # If no chunks produced, create one from subject
    if not result and subject:
        result.append({
            "chunk_text": f"Subject: {subject}",
            "chunk_index": 0,
            "token_count": estimate_tokens(subject),
        })

    return result


def split_by_sentences(text: str, max_chars: int, overlap_chars: int) -> List[str]:
    """Split text by sentences when paragraphs are too long."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) + 1 <= max_chars:
            current = f"{current} {sentence}" if current else sentence
        else:
            if current:
                chunks.append(current)
            current = sentence

    if current:
        chunks.append(current)

    return chunks


def estimate_tokens(text: str) -> int:
    """Rough token count estimate (1 token ≈ 4 chars for English)."""
    return max(1, len(text) // 4)
