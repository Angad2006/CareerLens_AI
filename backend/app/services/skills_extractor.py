"""
Skills extraction and categorization service.
Detects technical skills, soft skills, tools, and industry-specific skills.
"""
import json
import re
from pathlib import Path

# Load skills database
_skills_db = None


def _get_skills_db() -> dict:
    global _skills_db
    if _skills_db is None:
        db_path = Path(__file__).parent.parent / "data" / "skills_db.json"
        with open(db_path, "r", encoding="utf-8") as f:
            _skills_db = json.load(f)
    return _skills_db


def _find_skills_in_text(text: str, skills_list: list[str]) -> list[str]:
    """Find which skills from a list appear in the text (case-insensitive)."""
    text_lower = text.lower()
    found = []
    for skill in skills_list:
        # Use word boundary matching for short skills to avoid false positives
        if len(skill) <= 3:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, text_lower):
                found.append(skill)
        else:
            if skill.lower() in text_lower:
                found.append(skill)
    return found


def extract_skills(text: str, target_industry: str = None) -> dict:
    """
    Extract and categorize skills from resume text.

    Returns:
        dict with found_skills, missing_skills, recommended_skills, and match percentage.
    """
    db = _get_skills_db()

    # Find skills in each category
    found_technical = _find_skills_in_text(text, db["technical"])
    found_soft = _find_skills_in_text(text, db["soft_skills"])
    found_tools = _find_skills_in_text(text, db["tools"])

    # Industry-specific skills
    found_industry = []
    missing_industry = []
    industry_key = _normalize_industry_key(target_industry) if target_industry else None

    if industry_key and industry_key in db.get("industry_specific", {}):
        industry_skills = db["industry_specific"][industry_key]
        found_industry = _find_skills_in_text(text, industry_skills)
        missing_industry = [s for s in industry_skills if s not in found_industry]

    # Calculate what's missing for the target industry
    all_found = set(s.lower() for s in found_technical + found_soft + found_tools + found_industry)

    # Recommended skills based on what's popular but missing
    top_technical = db["technical"][:40]  # Top 40 most common technical skills
    recommended = [s for s in top_technical if s.lower() not in all_found][:10]

    # Calculate match percentage
    total_relevant = len(found_technical) + len(found_soft) + len(found_tools) + len(found_industry)
    # Baseline: a decent resume has 15-30 skills
    skill_match = min(98.0, (total_relevant / 25) * 100)

    # Scale down heavily if they target an industry but have zero industry-specific skills
    if industry_key and industry_key in db.get("industry_specific", {}):
        industry_skills = db["industry_specific"][industry_key]
        if len(industry_skills) > 0:
            if len(found_industry) == 0:
                skill_match = min(skill_match, 25.0)
            elif len(found_industry) < 2:
                skill_match = min(skill_match, 45.0)

    return {
        "found_skills": {
            "technical": found_technical,
            "soft_skills": found_soft,
            "tools": found_tools,
            "industry_specific": found_industry
        },
        "missing_skills": {
            "technical": [],  # Populated based on industry
            "soft_skills": [],
            "tools": [],
            "industry_specific": missing_industry
        },
        "recommended_skills": recommended,
        "skill_match_percentage": round(skill_match, 1)
    }


def _normalize_industry_key(industry: str) -> str:
    """Normalize industry name to match keys in skills_db.json."""
    mapping = {
        "technology": "technology",
        "software": "technology",
        "software development": "technology",
        "it": "technology",
        "data science": "data_science",
        "data analytics": "data_science",
        "ai/ml": "ai_ml",
        "ai": "ai_ml",
        "machine learning": "ai_ml",
        "artificial intelligence": "ai_ml",
        "marketing": "marketing",
        "sales": "sales",
        "finance": "finance",
        "banking": "finance",
        "healthcare": "healthcare",
        "pharma": "pharma",
        "pharmaceutical": "pharma",
        "hr": "hr",
        "human resources": "hr",
        "consulting": "consulting",
        "management consulting": "consulting",
        "cybersecurity": "cybersecurity",
        "security": "cybersecurity",
        "product management": "product_management",
        "product": "product_management",
        "ui/ux": "ui_ux",
        "ux": "ui_ux",
        "design": "ui_ux",
        "operations": "operations",
        "supply chain": "operations",
        "customer support": "customer_support",
        "support": "customer_support",
        "ecommerce": "ecommerce",
        "e-commerce": "ecommerce",
        "manufacturing": "manufacturing",
        "business analyst": "consulting"
    }
    return mapping.get(industry.lower().strip(), industry.lower().replace(" ", "_"))
