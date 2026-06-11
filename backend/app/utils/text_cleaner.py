"""
Text cleaning and preprocessing utilities for resume text.
"""
import re
import unicodedata


def clean_text(text: str) -> str:
    """Clean and normalize extracted resume text."""
    # Normalize unicode characters
    text = unicodedata.normalize("NFKD", text)

    # Replace common PDF artifacts
    text = text.replace("\x00", "")
    text = text.replace("\ufeff", "")

    # Normalize whitespace: collapse multiple spaces/tabs but preserve newlines
    text = re.sub(r"[^\S\n]+", " ", text)

    # Collapse 3+ consecutive newlines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Remove leading/trailing whitespace on each line
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)

    # Remove completely empty leading/trailing lines
    text = text.strip()

    return text


def extract_email(text: str) -> str:
    """Extract email address from text."""
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    match = re.search(pattern, text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    """Extract phone number from text."""
    pattern = r"[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,15}"
    match = re.search(pattern, text)
    return match.group(0).strip() if match else ""


def extract_links(text: str) -> list[str]:
    """Extract URLs from text."""
    pattern = r"https?://[^\s<>\"{}|\\^`\[\]]+"
    return re.findall(pattern, text)


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def has_quantified_achievements(text: str) -> list[str]:
    """Find sentences with numbers/metrics that suggest quantified achievements."""
    pattern = r"[^.]*\d+[%+$]?[^.]*\."
    matches = re.findall(pattern, text)
    # Filter out very short matches (likely dates or phone numbers)
    return [m.strip() for m in matches if len(m.strip()) > 30]


def estimate_reading_level(text: str) -> str:
    """Estimate the reading complexity of the resume."""
    words = text.split()
    if not words:
        return "Unknown"

    avg_word_length = sum(len(w) for w in words) / len(words)
    sentences = re.split(r"[.!?]+", text)
    avg_sentence_length = len(words) / max(len(sentences), 1)

    if avg_word_length > 6 and avg_sentence_length > 20:
        return "Advanced"
    elif avg_word_length > 5 and avg_sentence_length > 15:
        return "Professional"
    else:
        return "Standard"
