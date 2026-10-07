from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.interview import Interview
from backend.app.models.question import Question
from backend.app.schemas.auth import UserResponse
from backend.app.schemas.interview import InterviewSummary
from backend.app.schemas.question import QuestionResponse
from backend.app.dependencies import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/dashboard")
def get_admin_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    total_users = db.query(User).count()
    total_interviews = db.query(Interview).count()
    total_questions = db.query(Question).count()
    
    avg_score_res = db.query(func.avg(Interview.overall_score)).filter(Interview.completed == True).scalar()
    avg_score = round(float(avg_score_res), 1) if avg_score_res is not None else 0.0

    completed_interviews = db.query(Interview).filter(Interview.completed == True).count()

    return {
        "total_users": total_users,
        "total_interviews": total_interviews,
        "completed_interviews": completed_interviews,
        "total_questions": total_questions,
        "average_interview_score": avg_score
    }

@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.get("/interviews", response_model=List[InterviewSummary])
def get_admin_interviews(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Interview).order_by(Interview.created_at.desc()).all()

@router.get("/questions", response_model=List[QuestionResponse])
def get_admin_questions(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Question).order_by(Question.id.asc()).all()
