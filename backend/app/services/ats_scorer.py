"""
ATS (Applicant Tracking System) scoring engine.
Evaluates resume quality across multiple dimensions.
"""
import re
from app.services.skills_extractor import extract_skills
from app.services.section_detector import detect_sections
from app.utils.text_cleaner import has_quantified_achievements, count_words


def calculate_ats_score(text: str, target_industry: str = None) -> dict:
    """
    Calculate comprehensive ATS score (0-100) based on multiple factors:
    - Keywords presence (25%)
    - Skills coverage (25%)
    - Section completeness (20%)
    - Formatting quality (15%)
    - Quantified achievements (15%)
    """
    scores = {}

    # ─── 1. Keywords Score (25%) ───────────────────────────
    keywords_score = _evaluate_keywords(text, target_industry)
    scores["keyword_score"] = round(keywords_score, 1)

    # ─── 2. Skills Score (25%) ─────────────────────────────
    skills_result = extract_skills(text, target_industry)
    total_skills = (
        len(skills_result["found_skills"]["technical"]) +
        len(skills_result["found_skills"]["soft_skills"]) +
        len(skills_result["found_skills"]["tools"]) +
        len(skills_result["found_skills"]["industry_specific"])
    )
    # Scoring: 0-5 skills = poor, 6-10 = fair, 11-20 = good, 21+ = excellent
    if total_skills >= 20:
        skills_score = 95
    elif total_skills >= 15:
        skills_score = 85
    elif total_skills >= 10:
        skills_score = 70
    elif total_skills >= 5:
        skills_score = 55
    else:
        skills_score = 30
    scores["skills_score"] = round(skills_score, 1)

    # ─── 3. Section Completeness (20%) ─────────────────────
    sections_result = detect_sections(text)
    section_score = sections_result["completeness_score"]
    scores["section_score"] = round(section_score, 1)

    # ─── 4. Formatting Quality (15%) ──────────────────────
    formatting_score = _evaluate_formatting(text)
    scores["formatting_score"] = round(formatting_score, 1)

    # ─── 5. Quantified Achievements (15%) ─────────────────
    achievements = has_quantified_achievements(text)
    if len(achievements) >= 8:
        achievement_score = 95
    elif len(achievements) >= 5:
        achievement_score = 80
    elif len(achievements) >= 3:
        achievement_score = 65
    elif len(achievements) >= 1:
        achievement_score = 45
    else:
        achievement_score = 20
    scores["achievement_score"] = round(achievement_score, 1)

    # ─── Overall Score ─────────────────────────────────────
    overall = (
        keywords_score * 0.25 +
        skills_score * 0.25 +
        section_score * 0.20 +
        formatting_score * 0.15 +
        achievement_score * 0.15
    )

    # Force cap overall ATS Score if there is a severe mismatch with the selected target industry
    if target_industry:
        try:
            import json
            from pathlib import Path
            path = Path(__file__).parent.parent / "data" / "industries.json"
            with open(path, "r", encoding="utf-8") as f:
                industries_data = json.load(f)
            from app.services.career_predictor import _normalize_key
            target_key = _normalize_key(target_industry)
            profile = industries_data["industries"].get(target_key)
            if profile:
                target_skills = profile.get("key_skills", [])
                text_lower = text.lower()
                matches = [s for s in target_skills if s.lower() in text_lower]
                if len(matches) == 0:
                    overall = min(overall, 38.0)  # Severe mismatch = cap at 38%
                elif len(matches) < 2:
                    overall = min(overall, 48.0)  # Weak alignment = cap at 48%
        except Exception:
            pass

    return {
        "overall_score": round(min(98.0, overall), 1),
        "keyword_score": scores["keyword_score"],
        "skills_score": scores["skills_score"],
        "section_score": scores["section_score"],
        "formatting_score": scores["formatting_score"],
        "achievement_score": scores["achievement_score"],
        "breakdown": {
            "Keywords (25%)": scores["keyword_score"],
            "Skills (25%)": scores["skills_score"],
            "Sections (20%)": scores["section_score"],
            "Formatting (15%)": scores["formatting_score"],
            "Achievements (15%)": scores["achievement_score"]
        }
    }


def _evaluate_keywords(text: str, industry: str = None) -> float:
    """Evaluate presence of important ATS keywords."""
    text_lower = text.lower()

    # Universal action keywords that ATS systems look for
    action_keywords = [
        "achieved", "improved", "developed", "managed", "led", "created",
        "implemented", "designed", "analyzed", "increased", "reduced",
        "delivered", "collaborated", "optimized", "executed", "built",
        "launched", "coordinated", "supervised", "trained", "mentored",
        "negotiated", "generated", "streamlined", "established"
    ]

    found_count = sum(1 for kw in action_keywords if kw in text_lower)
    score = min(100, (found_count / 12) * 100)  # 12+ action words = 100

    return score


def _evaluate_formatting(text: str) -> float:
    """Evaluate resume formatting quality."""
    score = 100.0

    word_count = count_words(text)

    # Length check (ideal: 300-800 words for 1 page, 800-1500 for 2 pages)
    if word_count < 150:
        score -= 30  # Too short
    elif word_count < 300:
        score -= 15  # A bit short
    elif word_count > 2000:
        score -= 15  # Might be too long

    # Check for bullet points (good formatting indicator)
    bullet_patterns = [r"[•●▪▸►]", r"^\s*[-*]\s", r"^\s*\d+[.)]\s"]
    has_bullets = any(re.search(p, text, re.MULTILINE) for p in bullet_patterns)
    if not has_bullets:
        score -= 15

    # Check for consistent structure (paragraphs vs. wall of text)
    lines = text.split("\n")
    non_empty_lines = [l for l in lines if l.strip()]
    if len(non_empty_lines) < 10:
        score -= 20  # Very little structure

    # Check for email (contact info present)
    if not re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text):
        score -= 10

    # Check for all-caps overuse
    caps_lines = [l for l in non_empty_lines if l.isupper() and len(l) > 10]
    if len(caps_lines) > 5:
        score -= 10

    return max(0, score)
