"""
Career prediction and suitability analysis service.
Uses TF-IDF and cosine similarity to match resumes against industry profiles.
"""
import json
import re
from pathlib import Path
from app.services.skills_extractor import extract_skills


# Load industries data
_industries_data = None


def _get_industries() -> dict:
    global _industries_data
    if _industries_data is None:
        path = Path(__file__).parent.parent / "data" / "industries.json"
        with open(path, "r", encoding="utf-8") as f:
            _industries_data = json.load(f)
    return _industries_data


def predict_career_suitability(text: str, target_industry: str = None) -> dict:
    """
    Predict career suitability by comparing resume text against industry profiles.

    Uses keyword overlap and skill matching to determine best-fit industries.
    Returns top matches, career paths, experience level, and hiring probability.
    """
    industries = _get_industries()["industries"]
    text_lower = text.lower()

    target_key = _normalize_key(target_industry) if target_industry else None
    target_profile = industries.get(target_key) if target_key in industries else None

    # Score each industry
    industry_scores = []

    for key, profile in industries.items():
        score = 0
        matching_skills = []

        # Check for key skills match
        for skill in profile["key_skills"]:
            if skill.lower() in text_lower:
                score += 10
                matching_skills.append(skill)

        # Check for role keywords
        for role in profile["typical_roles"]:
            role_words = role.lower().split()
            if any(word in text_lower for word in role_words if len(word) > 3):
                score += 3

        # Check description keywords
        desc_words = profile["description"].lower().split()
        for word in desc_words:
            if len(word) > 4 and word in text_lower:
                score += 1

        # Boost if it's the target industry AND they actually have some skills
        if target_industry and key == target_key:
            if len(matching_skills) >= 2:
                score += 15
            else:
                score = max(0, score - 10)  # Penalize mismatch

        # Don't show 100 percent match ever (cap at 98.0)
        match_pct = min(98.0, (score / 60) * 100)

        industry_scores.append({
            "industry": profile["name"],
            "match_percentage": round(match_pct, 1),
            "matching_skills": matching_skills,
            "description": profile["description"]
        })

    # Sort by match percentage to find the absolute best matching industry
    industry_scores.sort(key=lambda x: x["match_percentage"], reverse=True)
    best_match = industry_scores[0] if industry_scores else None

    # Reassemble top_matches ensuring target industry is ALWAYS placed first if selected
    top_matches = []
    if target_industry and target_profile:
        target_card = None
        for card in industry_scores:
            if card["industry"] == target_profile["name"]:
                target_card = card
                break
        if target_card:
            other_cards = [c for c in industry_scores if c["industry"] != target_profile["name"]]
            top_matches = [target_card] + other_cards[:4]
    
    if not top_matches:
        top_matches = industry_scores[:5]

    # Determine experience level from text
    experience_level = _estimate_experience_level(text)

    # Career paths from top industry
    career_paths = []
    if top_matches:
        top_key = _find_key_by_name(industries, top_matches[0]["industry"])
        if top_key:
            career_paths = industries[top_key].get("typical_roles", [])[:5]

    # Determine hiring probability and target industry insights
    hiring_prob = "Moderate"
    reasoning_text = ""

    if target_industry and target_profile:
        target_name = target_profile["name"]
        target_skills_all = target_profile.get("key_skills", [])
        target_matches = [s for s in target_skills_all if s.lower() in text_lower]
        target_missing = [s for s in target_skills_all if s.lower() not in text_lower]
        target_card = top_matches[0]

        if len(target_matches) == 0:
            hiring_prob = "Critical Mismatch"
            best_text = f" However, based on your actual skills, your profile is strongly suited for '{best_match['industry']}' ({best_match['match_percentage']}% Match)." if best_match and best_match["industry"] != target_name else ""
            reasoning_text = (
                f"⚠ CRITICAL MISMATCH: You selected '{target_name}' as your target industry, "
                f"but your resume lacks any technical alignment (Domain Score: {target_card['match_percentage']}%). "
                f"It is completely missing foundational competencies such as {', '.join(target_missing[:3])}.{best_text} "
                f"We suggest aligning your career direction to your strengths or updating your resume projects."
            )
        elif len(target_matches) < 2:
            hiring_prob = "Low Alignment"
            best_text = f" However, based on your actual skills, your profile is strongly suited for '{best_match['industry']}' ({best_match['match_percentage']}% Match)." if best_match and best_match["industry"] != target_name else ""
            reasoning_text = (
                f"⚠ WEAK ALIGNMENT: Your profile has very poor compatibility with the '{target_name}' industry (Domain Score: {target_card['match_percentage']}%). "
                f"You lack critical key skills like {', '.join(target_missing[:4])}.{best_text} "
                f"We suggest completing projects in '{target_name}' to establish credibility."
            )
        else:
            top_score = target_card["match_percentage"]
            if top_score >= 75:
                hiring_prob = "High"
            elif top_score >= 50:
                hiring_prob = "Moderate"
            else:
                hiring_prob = "Fair"
            reasoning_text = (
                f"✓ GOOD ALIGNMENT: Your profile matches the '{target_name}' industry standards well. "
                f"You have key matching skills like {', '.join(target_matches[:3])}. "
                f"Highlight achievements using these tools in your experience section."
            )
    else:
        top_score = top_matches[0]["match_percentage"] if top_matches else 0
        if top_score >= 75:
            hiring_prob = "High"
        elif top_score >= 50:
            hiring_prob = "Moderate"
        elif top_score >= 30:
            hiring_prob = "Fair"
        else:
            hiring_prob = "Low"
        reasoning_text = "Your skills profile and experience show general suitability across several tech sectors. Highlight more specific tools to align with a particular target industry."

    return {
        "top_matches": top_matches,
        "career_paths": career_paths,
        "experience_level": experience_level,
        "hiring_probability": hiring_prob,
        "reasoning": reasoning_text
    }


def get_career_recommendations(text: str, target_industry: str = None) -> dict:
    """
    Generate career recommendations — roles, certifications, courses, tools to learn.
    """
    industries = _get_industries()["industries"]
    suitability = predict_career_suitability(text, target_industry)

    best_roles = []
    certifications = []
    courses = []
    technologies = []
    transitions = []

    # Use top 3 matching industries for recommendations
    for match in suitability["top_matches"][:3]:
        key = _find_key_by_name(industries, match["industry"])
        if key and key in industries:
            profile = industries[key]
            best_roles.extend(profile.get("typical_roles", [])[:3])
            certifications.extend(profile.get("certifications", []))
            courses.extend(profile.get("courses", []))

            # Technologies not in resume
            text_lower = text.lower()
            for skill in profile.get("key_skills", []):
                if skill.lower() not in text_lower:
                    technologies.append(skill)

    # Career transition suggestions
    if suitability["top_matches"]:
        primary = suitability["top_matches"][0]["industry"]
        for match in suitability["top_matches"][1:3]:
            if match["match_percentage"] >= 30:
                transitions.append(f"{primary} → {match['industry']}")

    return {
        "best_roles": list(dict.fromkeys(best_roles))[:8],  # Deduplicate, keep order
        "certifications": list(dict.fromkeys(certifications))[:8],
        "courses": list(dict.fromkeys(courses))[:8],
        "technologies_to_learn": list(dict.fromkeys(technologies))[:10],
        "career_transitions": transitions[:5]
    }


def _estimate_experience_level(text: str) -> str:
    """Estimate experience level from resume text."""
    text_lower = text.lower()

    # Look for year mentions
    year_patterns = [
        r"(\d+)\+?\s*years?\s*(?:of\s*)?experience",
        r"experience\s*[:|-]?\s*(\d+)\+?\s*years?",
    ]

    max_years = 0
    for pattern in year_patterns:
        matches = re.findall(pattern, text_lower)
        for m in matches:
            years = int(m)
            max_years = max(max_years, years)

    # Count number of job positions
    position_keywords = ["worked at", "employed at", "position:", "role:", "company:"]
    position_count = sum(1 for kw in position_keywords if kw in text_lower)

    # Also count date ranges
    date_ranges = re.findall(
        r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|"
        r"april|may|june|july|august|september|october|november|december)"
        r"\s*\d{4}\s*[-–—to]+\s*(?:present|\d{4}|current)",
        text_lower
    )
    position_count = max(position_count, len(date_ranges))

    if max_years >= 10 or position_count >= 5:
        return "Senior (10+ years)"
    elif max_years >= 5 or position_count >= 3:
        return "Mid-Level (5-10 years)"
    elif max_years >= 2 or position_count >= 2:
        return "Junior (2-5 years)"
    elif max_years >= 1 or position_count >= 1:
        return "Entry Level (1-2 years)"
    else:
        return "Fresher / Entry Level"


def _normalize_key(industry: str) -> str:
    """Normalize industry name to key format."""
    mapping = {
        "technology": "technology", "software": "technology",
        "data science": "data_science", "ai/ml": "ai_ml", "ai": "ai_ml",
        "marketing": "marketing", "sales": "sales", "finance": "finance",
        "healthcare": "healthcare", "pharma": "pharma", "hr": "hr",
        "consulting": "consulting", "cybersecurity": "cybersecurity",
        "product management": "product_management", "ui/ux": "ui_ux",
        "operations": "operations", "customer support": "customer_support",
        "ecommerce": "ecommerce", "e-commerce": "ecommerce",
        "manufacturing": "manufacturing", "business analyst": "business_analyst"
    }
    return mapping.get(industry.lower().strip(), industry.lower().replace(" ", "_"))


def _find_key_by_name(industries: dict, name: str) -> str:
    """Find industry key by display name."""
    for key, profile in industries.items():
        if profile["name"] == name:
            return key
    return None
