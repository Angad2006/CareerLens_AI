"""
Pydantic models for API request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional


# ─── Upload ───────────────────────────────────────────────
class ResumeUploadResponse(BaseModel):
    """Response after uploading and parsing a resume."""
    success: bool
    filename: str
    file_id: str
    extracted_text: str
    word_count: int
    page_count: int = 1


# ─── Analysis Request ────────────────────────────────────
class AnalysisRequest(BaseModel):
    """Request body for full resume analysis."""
    resume_text: str = Field(..., min_length=50, description="Extracted resume text")
    target_industry: Optional[str] = Field(None, description="Target industry/domain")
    target_roles: Optional[list[str]] = Field(default_factory=list, description="Target job roles")


# ─── Skills ───────────────────────────────────────────────
class SkillCategory(BaseModel):
    technical: list[str] = []
    soft_skills: list[str] = []
    tools: list[str] = []
    industry_specific: list[str] = []


class SkillsAnalysis(BaseModel):
    found_skills: SkillCategory
    missing_skills: SkillCategory
    recommended_skills: list[str] = []
    skill_match_percentage: float = 0.0


# ─── ATS ──────────────────────────────────────────────────
class ATSKeywordResult(BaseModel):
    present_keywords: list[str] = []
    missing_keywords: list[str] = []
    keyword_density: dict[str, float] = {}
    optimization_score: float = 0.0


class ATSScore(BaseModel):
    overall_score: float = 0.0
    keyword_score: float = 0.0
    skills_score: float = 0.0
    section_score: float = 0.0
    formatting_score: float = 0.0
    achievement_score: float = 0.0
    breakdown: dict[str, float] = {}


# ─── Sections ─────────────────────────────────────────────
class ResumeSection(BaseModel):
    name: str
    detected: bool = False
    content: str = ""
    quality_score: float = 0.0


class SectionAnalysis(BaseModel):
    sections: list[ResumeSection] = []
    completeness_score: float = 0.0


# ─── Career ──────────────────────────────────────────────
class CareerMatch(BaseModel):
    industry: str
    match_percentage: float
    matching_skills: list[str] = []
    description: str = ""


class CareerSuitability(BaseModel):
    top_matches: list[CareerMatch] = []
    career_paths: list[str] = []
    experience_level: str = "Entry Level"
    hiring_probability: str = "Moderate"


# ─── Suggestions ──────────────────────────────────────────
class Suggestion(BaseModel):
    category: str  # "critical", "important", "nice_to_have"
    title: str
    description: str
    impact: str  # "high", "medium", "low"


class SuggestionsResult(BaseModel):
    suggestions: list[Suggestion] = []
    overall_improvement_potential: str = "Moderate"


# ─── Career Recommendations ──────────────────────────────
class CareerRecommendation(BaseModel):
    best_roles: list[str] = []
    certifications: list[str] = []
    courses: list[str] = []
    technologies_to_learn: list[str] = []
    career_transitions: list[str] = []


# ─── Full Analysis Response ──────────────────────────────
class FullAnalysisResponse(BaseModel):
    """Complete analysis result returned to the frontend."""
    ats_score: ATSScore
    skills_analysis: SkillsAnalysis
    keyword_analysis: ATSKeywordResult
    section_analysis: SectionAnalysis
    career_suitability: CareerSuitability
    suggestions: SuggestionsResult
    career_recommendations: CareerRecommendation
    resume_insights: dict = {}


# ─── JD Match ────────────────────────────────────────────
class JDMatchRequest(BaseModel):
    resume_text: str = Field(..., min_length=50)
    job_description: str = Field(..., min_length=50)


class JDMatchResponse(BaseModel):
    overall_match: float = 0.0
    skill_match: float = 0.0
    keyword_match: float = 0.0
    experience_match: float = 0.0
    missing_skills: list[str] = []
    missing_keywords: list[str] = []
    matching_skills: list[str] = []
    matching_keywords: list[str] = []
    suggestions: list[str] = []
    ats_compatibility: float = 0.0


# ─── Cover Letter ────────────────────────────────────────
class CoverLetterRequest(BaseModel):
    resume_text: str = Field(..., min_length=50)
    job_description: str = Field(..., min_length=50)
    company_name: Optional[str] = None
    job_title: Optional[str] = None


class CoverLetterResponse(BaseModel):
    candidate_name: str
    company_name: str
    job_title: str
    cover_letter: str
