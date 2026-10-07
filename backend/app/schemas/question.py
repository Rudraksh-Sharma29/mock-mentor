from typing import Optional
from pydantic import BaseModel

class QuestionCreate(BaseModel):
    job_role: str
    category: str
    difficulty: str
    question_text: str
    expected_keywords: str
    model_answer: str

class QuestionResponse(BaseModel):
    id: int
    job_role: str
    category: str
    difficulty: str
    question_text: str
    expected_keywords: Optional[str] = None
    model_answer: Optional[str] = None

    class Config:
        from_attributes = True
