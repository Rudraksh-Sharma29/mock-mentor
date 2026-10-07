from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class AnswerSubmit(BaseModel):
    interview_id: int
    question_id: int
    answer_text: str = Field(..., min_length=1)

class AnswerResponse(BaseModel):
    id: int
    interview_id: int
    question_id: int
    answer_text: str
    technical_score: float
    relevance_score: float
    clarity_score: float
    completeness_score: float
    overall_score: float
    feedback: str
    model_answer: Optional[str] = None
    expected_keywords: Optional[str] = None
    matched_keywords: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True
