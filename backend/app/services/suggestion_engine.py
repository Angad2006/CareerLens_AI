"""
AI suggestion engine — generates actionable improvement recommendations.
"""
import re
from app.services.section_detector import detect_sections
from app.services.skills_extractor import extract_skills
from app.utils.text_cleaner import has_quantified_achievements, count_words


def generate_suggestions(text: str, target_industry: str = None) -> dict:
    """Generate prioritized improvement suggestions for the resume."""
    suggestions = []
    sections = detect_sections(text)
    skills = extract_skills(text, target_industry)
    achievements = has_quantified_achievements(text)
    word_count = count_words(text)

    # Check missing critical sections
    for section in sections["sections"]:
        if not section["detected"] and section["name"] in ["Experience", "Education", "Skills"]:
            suggestions.append({
                "category": "critical",
                "title": f"Add {section['name']} Section",
                "description": f"Your resume is missing a '{section['name']}' section. This is essential for ATS systems and recruiters.",
                "impact": "high"
            })

    # Check for summary/objective
    summary_found = any(s["detected"] for s in sections["sections"] if s["name"] == "Summary")
    if not summary_found:
        suggestions.append({
            "category": "important",
            "title": "Add Professional Summary",
            "description": "A 2-3 sentence professional summary at the top helps recruiters quickly understand your profile and improves ATS matching.",
            "impact": "high"
        })

    # Check quantified achievements
    if len(achievements) < 3:
        suggestions.append({
            "category": "critical",
            "title": "Add Measurable Achievements",
            "description": "Include numbers and metrics in your experience (e.g., 'Increased sales by 25%', 'Managed team of 8'). Only found {} quantified statements.".format(len(achievements)),
            "impact": "high"
        })

    # Skills gaps
    if len(skills["found_skills"]["technical"]) < 5:
        suggestions.append({
            "category": "important",
            "title": "Add More Technical Skills",
            "description": "Only {} technical skills detected. Add relevant technical skills to improve ATS matching.".format(len(skills["found_skills"]["technical"])),
            "impact": "high"
        })

    if not skills["found_skills"]["soft_skills"]:
        suggestions.append({
            "category": "nice_to_have",
            "title": "Include Soft Skills",
            "description": "Adding soft skills like leadership, communication, and teamwork shows well-roundedness.",
            "impact": "medium"
        })

    # Missing industry skills
    if skills["missing_skills"]["industry_specific"]:
        missing = ", ".join(skills["missing_skills"]["industry_specific"][:5])
        suggestions.append({
            "category": "important",
            "title": "Add Industry-Specific Keywords",
            "description": f"Consider adding these industry keywords: {missing}",
            "impact": "high"
        })

    # Resume length
    if word_count < 200:
        suggestions.append({
            "category": "critical",
            "title": "Resume Too Short",
            "description": f"Your resume has only {word_count} words. A well-detailed resume typically has 400-800 words.",
            "impact": "high"
        })
    elif word_count > 1500:
        suggestions.append({
            "category": "nice_to_have",
            "title": "Consider Shortening Resume",
            "description": f"At {word_count} words, your resume might be too long. Focus on the most relevant experiences.",
            "impact": "low"
        })

    # Contact info
    has_email = bool(re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text))
    has_linkedin = bool(re.search(r"linkedin", text, re.IGNORECASE))
    if not has_email:
        suggestions.append({
            "category": "critical",
            "title": "Add Email Address",
            "description": "No email address found. This is essential for recruiters to contact you.",
            "impact": "high"
        })
    if not has_linkedin:
        suggestions.append({
            "category": "nice_to_have",
            "title": "Add LinkedIn Profile",
            "description": "Including a LinkedIn URL adds credibility and gives recruiters more context.",
            "impact": "medium"
        })

    # Certifications
    cert_found = any(s["detected"] for s in sections["sections"] if s["name"] == "Certifications")
    if not cert_found:
        suggestions.append({
            "category": "nice_to_have",
            "title": "Add Certifications",
            "description": "Professional certifications boost credibility and ATS scores significantly.",
            "impact": "medium"
        })

    # Sort by priority
    priority_order = {"critical": 0, "important": 1, "nice_to_have": 2}
    suggestions.sort(key=lambda x: priority_order.get(x["category"], 3))

    # Overall improvement potential
    critical_count = sum(1 for s in suggestions if s["category"] == "critical")
    if critical_count >= 3:
        potential = "High — Significant improvements needed"
    elif critical_count >= 1:
        potential = "Moderate — Some important areas to address"
    else:
        potential = "Low — Resume is already well-optimized"

    return {
        "suggestions": suggestions,
        "overall_improvement_potential": potential
    }
