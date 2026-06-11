"""
NLP engine — spaCy-based text analysis for resumes.
Handles entity extraction, tokenization, and text statistics.
"""
import re


# Global NLP model reference (loaded lazily)
_nlp = None


def get_nlp():
    """Lazy-load spaCy model to avoid startup delay."""
    global _nlp
    if _nlp is None:
        import spacy
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Model not downloaded yet - use blank
            print("⚠ spaCy model 'en_core_web_sm' not found. Using blank model.")
            print("  Run: python -m spacy download en_core_web_sm")
            _nlp = spacy.blank("en")
    return _nlp


def analyze_text(text: str) -> dict:
    """
    Perform NLP analysis on resume text.
    Returns entities, statistics, and linguistic features.
    """
    nlp = get_nlp()

    # Limit text length for spaCy processing (performance)
    doc = nlp(text[:100000])

    # Extract named entities
    entities = {}
    for ent in doc.ents:
        label = ent.label_
        if label not in entities:
            entities[label] = []
        if ent.text not in entities[label] and len(entities[label]) < 20:
            entities[label].append(ent.text)

    # Text statistics
    words = [token.text for token in doc if not token.is_punct and not token.is_space]
    sentences = list(doc.sents)

    # Noun phrases (key topics)
    noun_phrases = []
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) >= 2 and len(chunk.text) < 50:
            noun_phrases.append(chunk.text)

    # Action verbs (strong resume language)
    action_verbs = set()
    strong_verbs = {
        "achieved", "accomplished", "built", "created", "designed", "developed",
        "directed", "established", "executed", "generated", "implemented",
        "improved", "increased", "launched", "led", "managed", "optimized",
        "orchestrated", "pioneered", "reduced", "revamped", "spearheaded",
        "streamlined", "supervised", "transformed", "delivered", "drove",
        "engineered", "facilitated", "founded", "initiated", "maximized",
        "mentored", "negotiated", "overhauled", "planned", "produced",
        "resolved", "restructured", "saved", "scaled", "secured"
    }
    for token in doc:
        if token.pos_ == "VERB" and token.lemma_.lower() in strong_verbs:
            action_verbs.add(token.lemma_.lower())

    return {
        "entities": entities,
        "word_count": len(words),
        "sentence_count": len(sentences),
        "avg_sentence_length": len(words) / max(len(sentences), 1),
        "noun_phrases": list(set(noun_phrases))[:30],
        "action_verbs": list(action_verbs),
        "unique_words": len(set(w.lower() for w in words)),
        "vocabulary_richness": len(set(w.lower() for w in words)) / max(len(words), 1)
    }


def extract_contact_info(text: str) -> dict:
    """Extract contact information from resume text."""
    contact = {
        "email": "",
        "phone": "",
        "linkedin": "",
        "github": "",
        "website": "",
        "location": ""
    }

    # Email
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    if email_match:
        contact["email"] = email_match.group(0)

    # Phone
    phone_match = re.search(r"[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,15}", text)
    if phone_match:
        contact["phone"] = phone_match.group(0).strip()

    # LinkedIn
    linkedin_match = re.search(r"linkedin\.com/in/[\w-]+", text, re.IGNORECASE)
    if linkedin_match:
        contact["linkedin"] = linkedin_match.group(0)

    # GitHub
    github_match = re.search(r"github\.com/[\w-]+", text, re.IGNORECASE)
    if github_match:
        contact["github"] = github_match.group(0)

    # Website
    website_match = re.search(r"https?://(?!.*(?:linkedin|github))[\w./\-]+", text)
    if website_match:
        contact["website"] = website_match.group(0)

    return contact
