"""
Job Description matching API route.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import JDMatchRequest
from app.services.jd_matcher import match_jd

router = APIRouter(prefix="/api", tags=["JD Match"])


@router.post("/jd-match")
async def match_job_description(request: JDMatchRequest):
    """Compare resume against a job description."""
    try:
        return match_jd(request.resume_text, request.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JD matching error: {str(e)}")
