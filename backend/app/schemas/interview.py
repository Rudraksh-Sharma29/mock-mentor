from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field
from backend.app.schemas.question import QuestionResponse
from backend.app.schemas.answer import AnswerResponse
from backend.app.schemas.resume import ParsedResumeData

class InterviewCreate(BaseModel):
    job_role: str = Field(default="Software Developer")
    experience_level: str = Field(default="Intermediate")
    interview_type: str = Field(default="Technical + Project-Based")  # 'Technical', 'HR', 'Technical + HR', 'Project-Based', 'Internship', 'Placement'
    difficulty: str = Field(default="Medium")                         # 'Easy', 'Medium', 'Hard'
    total_questions: int = Field(default=5, ge=1, le=15)
    resume_id: Optional[int] = None
    focus_topics: Optional[List[str]] = None
    duration_minutes: Optional[int] = Field(default=15, ge=5, le=60)

class InterviewMessageResponse(BaseModel):
    id: int
    session_id: int
    speaker: str  # 'mentor' or 'candidate'
    message: str
    timestamp: datetime
    question_number: Optional[int] = None
    topic: Optional[str] = None
    audio_url: Optional[str] = None

    class Config:
        from_attributes = True

class InterviewEvaluationResponse(BaseModel):
    id: int
    session_id: int
    technical_score: float
    communication_score: float
    confidence_score: float
    problem_solving_score: float
    project_knowledge_score: float
    overall_score: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    incorrect_answers: List[str] = []
    missed_opportunities: List[str] = []
    topics_to_study: List[str] = []
    recommendations: List[str] = []
    practice_questions: List[Dict[str, Any]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewSummary(BaseModel):
    id: int
    user_id: int
    resume_id: Optional[int] = None
    job_role: str
    experience_level: str
    interview_type: str
    difficulty: str
    total_questions: int
    status: str = "completed"
    completed: bool
    overall_score: Optional[float] = None
    duration_seconds: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionScoreDetail(BaseModel):
    question_id: int
    question_text: str
    score: float
    technical_score: float
    relevance_score: float
    clarity_score: float
    completeness_score: float
    feedback: str
    candidate_answer: str
    model_answer: str

class InterviewDetail(BaseModel):
    id: int
    user_id: int
    resume_id: Optional[int] = None
    job_role: str
    experience_level: str
    interview_type: str
    difficulty: str
    total_questions: int
    status: str
    duration_seconds: int = 0
    completed: bool
    overall_score: Optional[float] = None
    created_at: datetime
    questions: List[QuestionResponse] = []
    answers: List[AnswerResponse] = []
    messages: List[InterviewMessageResponse] = []
    evaluation: Optional[InterviewEvaluationResponse] = None
    parsed_resume: Optional[ParsedResumeData] = None

    class Config:
        from_attributes = True

class InterviewResults(BaseModel):
    interview_id: int
    job_role: str
    experience_level: str
    interview_type: str
    difficulty: str
    total_questions: int
    completed: bool
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    problem_solving_score: float
    project_knowledge_score: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    incorrect_answers: List[str] = []
    missed_opportunities: List[str] = []
    topics_to_study: List[str] = []
    recommendations: List[str] = []
    practice_questions: List[Dict[str, Any]] = []
    transcript: List[InterviewMessageResponse] = []
