"""
Cover Letter Router.
Exposes endpoint to generate tailored cover letters.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import CoverLetterRequest, CoverLetterResponse
from app.services.cover_letter_generator import generate_cover_letter

router = APIRouter(prefix="/api", tags=["Cover Letter"])


@router.post("/generate-cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter_route(request: CoverLetterRequest):
    """
    Generate a tailored cover letter using candidate resume and job description.
    """
    try:
        res = generate_cover_letter(
            resume_text=request.resume_text,
            jd_text=request.job_description,
            company_name=request.company_name,
            job_title=request.job_title
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating cover letter: {str(e)}")
