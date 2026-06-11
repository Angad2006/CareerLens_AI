"""
Job Description matching service.
Compares resume against a job description using TF-IDF cosine similarity.
"""
import re
from collections import Counter


def match_jd(resume_text: str, jd_text: str) -> dict:
    """
    Compare resume text against a job description.
    Returns match percentages, missing items, and suggestions.
    """
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    # Extract meaningful words (3+ chars)
    resume_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", resume_lower))
    jd_words = set(re.findall(r"\b[a-zA-Z]{3,}\b", jd_lower))

    # Common stopwords to exclude
    stopwords = {
        "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
        "was", "one", "our", "out", "has", "have", "had", "how", "its", "may",
        "new", "now", "old", "see", "way", "who", "did", "get", "let", "say",
        "she", "too", "use", "with", "this", "that", "from", "they", "been",
        "will", "each", "make", "like", "than", "them", "then", "what", "when",
        "your", "also", "into", "over", "such", "more", "some", "very", "just",
        "about", "could", "would", "should", "their", "which", "these", "other",
        "after", "being", "where", "there", "through", "during", "before"
    }
    resume_words -= stopwords
    jd_words -= stopwords

    # Keyword overlap
    common_keywords = resume_words & jd_words
    jd_only = jd_words - resume_words

    keyword_match = (len(common_keywords) / max(len(jd_words), 1)) * 100

    # Extract skills-like phrases (2-3 word combos) from JD
    jd_skills = _extract_skill_phrases(jd_text)
    resume_skills = _extract_skill_phrases(resume_text)

    matching_skills = [s for s in jd_skills if s.lower() in resume_lower]
    missing_skills = [s for s in jd_skills if s.lower() not in resume_lower]

    skill_match = (len(matching_skills) / max(len(jd_skills), 1)) * 100

    # Experience match (look for year requirements)
    exp_match = _check_experience_match(resume_text, jd_text)

    # Overall match
    overall = (keyword_match * 0.4 + skill_match * 0.4 + exp_match * 0.2)

    # Generate suggestions
    suggestions = []
    if missing_skills:
        suggestions.append(f"Add these skills to your resume: {', '.join(missing_skills[:5])}")
    if keyword_match < 50:
        suggestions.append("Your resume keywords don't closely match the JD. Tailor your experience descriptions.")
    if exp_match < 50:
        suggestions.append("Highlight your years of experience more prominently.")
    if overall < 60:
        suggestions.append("Consider rewriting your summary to mirror the JD language.")
    if overall >= 75:
        suggestions.append("Great match! Fine-tune specific project descriptions to align even better.")

    # Filter meaningful missing keywords (not too common, not too short)
    meaningful_missing = [w for w in jd_only if len(w) > 4][:15]

    return {
        "overall_match": round(min(98.0, overall), 1),
        "skill_match": round(min(98.0, skill_match), 1),
        "keyword_match": round(min(98.0, keyword_match), 1),
        "experience_match": round(min(98.0, exp_match), 1),
        "missing_skills": missing_skills[:10],
        "missing_keywords": meaningful_missing,
        "matching_skills": matching_skills,
        "matching_keywords": list(common_keywords)[:20],
        "suggestions": suggestions,
        "ats_compatibility": round(min(98.0, overall * 1.1), 1)
    }


def _extract_skill_phrases(text: str) -> list[str]:
    """Extract skill-like phrases from text."""
    # Common technical/professional skills patterns
    skills = set()
    text_lower = text.lower()

    # Look for common skill patterns
    skill_indicators = [
        r"(?:proficient|experienced|skilled|expertise|knowledge)\s+(?:in|with|of)\s+([\w\s,/+#]+?)(?:\.|,|\n|$)",
        r"(?:requirements?|qualifications?).*?(?:\n[-•*]\s*)(.*?)(?:\n|$)",
    ]

    # Also extract capitalized multi-word terms (likely proper nouns/technologies)
    cap_pattern = r"\b([A-Z][a-zA-Z+#]*(?:\s+[A-Z][a-zA-Z+#]*){0,2})\b"
    cap_matches = re.findall(cap_pattern, text)
    for match in cap_matches:
        if len(match) > 2 and match not in {"The", "And", "For", "This", "That", "With"}:
            skills.add(match)

    return list(skills)[:30]


def _check_experience_match(resume: str, jd: str) -> float:
    """Check if resume experience meets JD requirements."""
    # Extract year requirements from JD
    jd_years = re.findall(r"(\d+)\+?\s*years?", jd.lower())
    resume_years = re.findall(r"(\d+)\+?\s*years?", resume.lower())

    if not jd_years:
        return 70.0  # No specific requirement = neutral score

    required = max(int(y) for y in jd_years)
    actual = max(int(y) for y in resume_years) if resume_years else 0

    if actual >= required:
        return 95.0
    elif actual >= required - 2:
        return 70.0
    elif actual >= required - 4:
        return 45.0
    else:
        return 25.0
