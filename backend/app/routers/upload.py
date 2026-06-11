"""
Resume upload API route.
Handles file upload, validation, and text extraction.
"""
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.services.parser import parse_resume
from app.utils.text_cleaner import clean_text, count_words

router = APIRouter(prefix="/api", tags=["Upload"])


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume file (PDF/DOCX) and extract text.
    Returns extracted text, word count, and file metadata.
    """
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Read and validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )

    # Save file temporarily
    file_id = str(uuid.uuid4())[:8]
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(contents)

    try:
        # Parse the resume
        result = parse_resume(file_path)
        cleaned_text = clean_text(result["text"])

        return {
            "success": True,
            "filename": file.filename,
            "file_id": file_id,
            "extracted_text": cleaned_text,
            "word_count": count_words(cleaned_text),
            "page_count": result["page_count"]
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)
