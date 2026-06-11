"""
Resume analysis API routes.
Full analysis, skills-only, ATS score, and career prediction endpoints.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalysisRequest, FullAnalysisResponse
from app.services.skills_extractor import extract_skills
from app.services.ats_scorer import calculate_ats_score
from app.services.career_predictor import predict_career_suitability, get_career_recommendations
from app.services.section_detector import detect_sections
from app.services.keyword_analyzer import analyze_keywords
from app.services.suggestion_engine import generate_suggestions
from app.services.nlp_engine import analyze_text, extract_contact_info

router = APIRouter(prefix="/api", tags=["Analysis"])


@router.post("/analyze")
async def full_analysis(request: AnalysisRequest):
    """Run complete resume analysis — skills, ATS, career, sections, suggestions."""
    try:
        text = request.resume_text
        industry = request.target_industry

        # Run all analysis services
        ats = calculate_ats_score(text, industry)
        skills = extract_skills(text, industry)
        keywords = analyze_keywords(text, industry)
        sections = detect_sections(text)
        career = predict_career_suitability(text, industry)
        suggestions = generate_suggestions(text, industry)
        recommendations = get_career_recommendations(text, industry)
        nlp = analyze_text(text)
        contact = extract_contact_info(text)

        # Build resume insights
        insights = {
            "word_count": nlp["word_count"],
            "sentence_count": nlp["sentence_count"],
            "vocabulary_richness": round(nlp["vocabulary_richness"], 3),
            "action_verbs_used": nlp["action_verbs"],
            "action_verb_count": len(nlp["action_verbs"]),
            "key_topics": nlp["noun_phrases"][:10],
            "contact_info": contact,
            "experience_level": career["experience_level"],
            "hiring_probability": career["hiring_probability"],
            "resume_strength": _calculate_strength(ats, skills, sections),
        }

        return {
            "ats_score": ats,
            "skills_analysis": skills,
            "keyword_analysis": keywords,
            "section_analysis": sections,
            "career_suitability": career,
            "suggestions": suggestions,
            "career_recommendations": recommendations,
            "resume_insights": insights,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@router.post("/analyze/skills")
async def skills_only(request: AnalysisRequest):
    """Extract skills only."""
    try:
        return extract_skills(request.resume_text, request.target_industry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/ats-score")
async def ats_score_only(request: AnalysisRequest):
    """Get ATS score only."""
    try:
        return calculate_ats_score(request.resume_text, request.target_industry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/career")
async def career_only(request: AnalysisRequest):
    """Get career suitability only."""
    try:
        return predict_career_suitability(request.resume_text, request.target_industry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _calculate_strength(ats: dict, skills: dict, sections: dict) -> str:
    """Calculate overall resume strength label."""
    score = ats.get("overall_score", 0)
    skill_count = (
        len(skills.get("found_skills", {}).get("technical", [])) +
        len(skills.get("found_skills", {}).get("soft_skills", []))
    )
    completeness = sections.get("completeness_score", 0)

    combined = (score * 0.4 + min(100, skill_count * 5) * 0.3 + completeness * 0.3)

    if combined >= 80:
        return "Excellent"
    elif combined >= 65:
        return "Strong"
    elif combined >= 45:
        return "Average"
    elif combined >= 30:
        return "Below Average"
    else:
        return "Needs Improvement"
