import json
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.resume import Resume
from backend.app.schemas.resume import ResumeResponse, ResumeSummary, ParsedResumeData
from backend.app.services.resume_service import ResumeService
from backend.app.dependencies import get_current_user

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a resume in PDF or DOCX format. The file is parsed and analyzed
    by Gemini Flash to extract candidate profile, skills, projects, and claims.
    """
    resume = await ResumeService.process_and_save_resume(db, current_user.id, file)
    parsed_json = json.loads(resume.parsed_data)
    
    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        filename=resume.filename,
        file_type=resume.file_type,
        parsed_data=ParsedResumeData(**parsed_json),
        created_at=resume.created_at
    )

@router.get("", response_model=List[ResumeSummary])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all uploaded resumes for the authenticated user.
    """
    resumes = ResumeService.list_user_resumes(db, current_user.id)
    summaries = []
    for r in resumes:
        name = None
        skills_cnt = 0
        projects_cnt = 0
        try:
            p = json.loads(r.parsed_data)
            name = p.get("candidate_name")
            skills_cnt = len(p.get("skills", []))
            projects_cnt = len(p.get("projects", []))
        except Exception:
            pass

        summaries.append(ResumeSummary(
            id=r.id,
            user_id=r.user_id,
            filename=r.filename,
            file_type=r.file_type,
            candidate_name=name,
            skills_count=skills_cnt,
            projects_count=projects_cnt,
            created_at=r.created_at
        ))
    return summaries

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed extracted resume profile and challenge topics.
    """
    resume = ResumeService.get_resume_by_id(db, resume_id, current_user.id)
    parsed_json = json.loads(resume.parsed_data)

    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        filename=resume.filename,
        file_type=resume.file_type,
        parsed_data=ParsedResumeData(**parsed_json),
        created_at=resume.created_at
    )
