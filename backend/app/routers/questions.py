from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.question import Question
from backend.app.schemas.question import QuestionResponse

router = APIRouter(prefix="/api/questions", tags=["Questions"])

@router.get("", response_model=List[QuestionResponse])
def get_questions(
    job_role: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    if job_role:
        query = query.filter(Question.job_role == job_role)
    if category:
        query = query.filter(Question.category == category)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    return query.all()
