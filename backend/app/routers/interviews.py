import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.interview import Interview
from backend.app.models.interview_message import InterviewMessage
from backend.app.models.interview_evaluation import InterviewEvaluation
from backend.app.models.resume import Resume
from backend.app.models.answer import Answer
from backend.app.schemas.interview import (
    InterviewCreate,
    InterviewSummary,
    InterviewDetail,
    InterviewResults,
    InterviewMessageResponse,
    InterviewEvaluationResponse,
)
from backend.app.schemas.answer import AnswerSubmit, AnswerResponse
from backend.app.schemas.question import QuestionResponse
from backend.app.schemas.resume import ParsedResumeData
from backend.app.services.interview_service import InterviewService
from backend.app.services.report_service import ReportService
from backend.app.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Interviews"])

@router.post("/interviews", response_model=InterviewDetail)
def create_interview(
    data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a personalized mock interview session linked to candidate's resume.
    """
    resume = None
    parsed_resume_dict = None
    if data.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == data.resume_id,
            Resume.user_id == current_user.id
        ).first()
        if resume and resume.parsed_data:
            try:
                parsed_resume_dict = json.loads(resume.parsed_data)
            except Exception:
                pass

    interview = Interview(
        user_id=current_user.id,
        resume_id=resume.id if resume else None,
        job_role=data.job_role,
        experience_level=data.experience_level,
        interview_type=data.interview_type,
        difficulty=data.difficulty,
        total_questions=data.total_questions,
        status="created",
        completed=False,
        overall_score=None
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    return InterviewDetail(
        id=interview.id,
        user_id=interview.user_id,
        resume_id=interview.resume_id,
        job_role=interview.job_role,
        experience_level=interview.experience_level,
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        total_questions=interview.total_questions,
        status=interview.status,
        duration_seconds=interview.duration_seconds,
        completed=interview.completed,
        overall_score=interview.overall_score,
        created_at=interview.created_at,
        questions=[],
        answers=[],
        messages=[],
        evaluation=None,
        parsed_resume=ParsedResumeData(**parsed_resume_dict) if parsed_resume_dict else None
    )

@router.get("/interviews", response_model=List[InterviewSummary])
def get_user_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interviews = db.query(Interview).filter(
        Interview.user_id == current_user.id
    ).order_by(Interview.created_at.desc()).all()
    return interviews

@router.get("/interviews/{interview_id}", response_model=InterviewDetail)
def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    messages = db.query(InterviewMessage).filter(
        InterviewMessage.session_id == interview.id
    ).order_by(InterviewMessage.timestamp.asc()).all()

    evaluation = db.query(InterviewEvaluation).filter(
        InterviewEvaluation.session_id == interview.id
    ).first()

    parsed_resume_dict = None
    if interview.resume and interview.resume.parsed_data:
        try:
            parsed_resume_dict = json.loads(interview.resume.parsed_data)
        except Exception:
            pass

    def safe_json(val, default):
        try:
            return json.loads(val) if val else default
        except Exception:
            return default

    eval_response = None
    if evaluation:
        eval_response = InterviewEvaluationResponse(
            id=evaluation.id,
            session_id=evaluation.session_id,
            technical_score=evaluation.technical_score,
            communication_score=evaluation.communication_score,
            confidence_score=evaluation.confidence_score,
            problem_solving_score=evaluation.problem_solving_score,
            project_knowledge_score=evaluation.project_knowledge_score,
            overall_score=evaluation.overall_score,
            strengths=safe_json(evaluation.strengths, []),
            weaknesses=safe_json(evaluation.weaknesses, []),
            incorrect_answers=safe_json(evaluation.incorrect_answers, []),
            missed_opportunities=safe_json(evaluation.missed_opportunities, []),
            topics_to_study=safe_json(evaluation.topics_to_study, []),
            recommendations=safe_json(evaluation.recommendations, []),
            practice_questions=safe_json(evaluation.practice_questions, []),
            created_at=evaluation.created_at
        )

    msg_responses = [
        InterviewMessageResponse(
            id=m.id,
            session_id=m.session_id,
            speaker=m.speaker,
            message=m.message,
            timestamp=m.timestamp,
            question_number=m.question_number,
            topic=m.topic,
            audio_url=m.audio_url
        )
        for m in messages
    ]

    return InterviewDetail(
        id=interview.id,
        user_id=interview.user_id,
        resume_id=interview.resume_id,
        job_role=interview.job_role,
        experience_level=interview.experience_level,
        interview_type=interview.interview_type,
        difficulty=interview.difficulty,
        total_questions=interview.total_questions,
        status=interview.status,
        duration_seconds=interview.duration_seconds,
        completed=interview.completed,
        overall_score=interview.overall_score,
        created_at=interview.created_at,
        questions=[],
        answers=[],
        messages=msg_responses,
        evaluation=eval_response,
        parsed_resume=ParsedResumeData(**parsed_resume_dict) if parsed_resume_dict else None
    )

@router.post("/interviews/{interview_id}/complete", response_model=InterviewResults)
def complete_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually triggers end of interview and post-interview evaluation report.
    """
    return ReportService.generate_and_save_evaluation(db, interview_id, current_user.id)

@router.get("/interviews/{interview_id}/results", response_model=InterviewResults)
def get_interview_results(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get completed interview scorecard and comprehensive AI report.
    """
    return ReportService.get_existing_results(db, interview_id, current_user.id)

@router.get("/interviews/{interview_id}/transcript", response_model=List[InterviewMessageResponse])
def get_interview_transcript(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    messages = db.query(InterviewMessage).filter(
        InterviewMessage.session_id == interview.id
    ).order_by(InterviewMessage.timestamp.asc()).all()

    return messages

@router.post("/answers", response_model=AnswerResponse, tags=["Answers"])
def submit_answer(
    answer_data: AnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return InterviewService.submit_answer(db, current_user.id, answer_data)
