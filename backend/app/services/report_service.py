import json
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.interview import Interview
from backend.app.models.interview_message import InterviewMessage
from backend.app.models.interview_evaluation import InterviewEvaluation
from backend.app.models.resume import Resume
from backend.app.models.answer import Answer
from backend.app.schemas.interview import InterviewResults, InterviewMessageResponse
from backend.app.services.gemini_service import GeminiService

class ReportService:
    @classmethod
    def generate_and_save_evaluation(
        cls,
        db: Session,
        interview_id: int,
        user_id: int
    ) -> InterviewResults:
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == user_id
        ).first()

        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found"
            )

        # Retrieve messages
        messages = db.query(InterviewMessage).filter(
            InterviewMessage.session_id == interview.id
        ).order_by(InterviewMessage.timestamp.asc()).all()

        transcript_list = []
        if messages:
            transcript_list = [
                {"speaker": m.speaker, "message": m.message, "topic": m.topic or ""}
                for m in messages
            ]
        else:
            # Check if there are answers from Phase 1
            answers = db.query(Answer).filter(Answer.interview_id == interview.id).all()
            if answers:
                for idx, a in enumerate(answers, 1):
                    q_text = a.question.question_text if a.question else f"Question {idx}"
                    category = a.question.category if a.question else interview.job_role
                    transcript_list.append({"speaker": "mentor", "message": q_text, "topic": category})
                    transcript_list.append({"speaker": "candidate", "message": a.answer_text, "topic": ""})

        if not transcript_list:
            transcript_list = [
                {"speaker": "mentor", "message": f"Welcome to your {interview.job_role} interview session.", "topic": "Introduction"},
                {"speaker": "candidate", "message": "Interview session completed.", "topic": ""}
            ]

        # Retrieve resume context if linked
        resume_context = {}
        if interview.resume_id:
            resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
            if resume and resume.parsed_data:
                try:
                    resume_context = json.loads(resume.parsed_data)
                except Exception:
                    resume_context = {}

        if not resume_context:
            resume_context = {
                "candidate_name": interview.user.name if interview.user else "Candidate",
                "skills": [interview.job_role, "Problem Solving", "System Design"],
                "projects": [],
                "resume_claims": []
            }

        # Generate evaluation report with Gemini Flash
        eval_data = GeminiService.generate_evaluation_report(
            resume_context=resume_context,
            transcript=transcript_list,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty
        )

        overall_score = float(eval_data.get("overall_score", 75.0))
        technical_score = float(eval_data.get("technical_score", 75.0))
        communication_score = float(eval_data.get("communication_score", 75.0))
        confidence_score = float(eval_data.get("confidence_score", 70.0))
        problem_solving_score = float(eval_data.get("problem_solving_score", 75.0))
        project_knowledge_score = float(eval_data.get("project_knowledge_score", 75.0))

        # Upsert evaluation record
        evaluation = db.query(InterviewEvaluation).filter(
            InterviewEvaluation.session_id == interview.id
        ).first()

        if not evaluation:
            evaluation = InterviewEvaluation(
                session_id=interview.id,
                technical_score=technical_score,
                communication_score=communication_score,
                confidence_score=confidence_score,
                problem_solving_score=problem_solving_score,
                project_knowledge_score=project_knowledge_score,
                overall_score=overall_score,
                strengths=json.dumps(eval_data.get("strengths", [])),
                weaknesses=json.dumps(eval_data.get("weaknesses", [])),
                incorrect_answers=json.dumps(eval_data.get("incorrect_answers", [])),
                missed_opportunities=json.dumps(eval_data.get("missed_opportunities", [])),
                topics_to_study=json.dumps(eval_data.get("topics_to_study", [])),
                recommendations=json.dumps(eval_data.get("recommendations", [])),
                practice_questions=json.dumps(eval_data.get("practice_questions", []))
            )
            db.add(evaluation)
        else:
            evaluation.technical_score = technical_score
            evaluation.communication_score = communication_score
            evaluation.confidence_score = confidence_score
            evaluation.problem_solving_score = problem_solving_score
            evaluation.project_knowledge_score = project_knowledge_score
            evaluation.overall_score = overall_score
            evaluation.strengths = json.dumps(eval_data.get("strengths", []))
            evaluation.weaknesses = json.dumps(eval_data.get("weaknesses", []))
            evaluation.incorrect_answers = json.dumps(eval_data.get("incorrect_answers", []))
            evaluation.missed_opportunities = json.dumps(eval_data.get("missed_opportunities", []))
            evaluation.topics_to_study = json.dumps(eval_data.get("topics_to_study", []))
            evaluation.recommendations = json.dumps(eval_data.get("recommendations", []))
            evaluation.practice_questions = json.dumps(eval_data.get("practice_questions", []))

        interview.completed = True
        interview.status = "completed"
        interview.overall_score = overall_score
        db.commit()
        db.refresh(interview)
        db.refresh(evaluation)

        formatted_messages = [
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

        return InterviewResults(
            interview_id=interview.id,
            job_role=interview.job_role,
            experience_level=interview.experience_level,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            total_questions=interview.total_questions,
            completed=True,
            overall_score=overall_score,
            technical_score=technical_score,
            communication_score=communication_score,
            confidence_score=confidence_score,
            problem_solving_score=problem_solving_score,
            project_knowledge_score=project_knowledge_score,
            strengths=eval_data.get("strengths", []),
            weaknesses=eval_data.get("weaknesses", []),
            incorrect_answers=eval_data.get("incorrect_answers", []),
            missed_opportunities=eval_data.get("missed_opportunities", []),
            topics_to_study=eval_data.get("topics_to_study", []),
            recommendations=eval_data.get("recommendations", []),
            practice_questions=eval_data.get("practice_questions", []),
            transcript=formatted_messages
        )

    @classmethod
    def get_existing_results(
        cls,
        db: Session,
        interview_id: int,
        user_id: int
    ) -> InterviewResults:
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == user_id
        ).first()

        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found"
            )

        evaluation = db.query(InterviewEvaluation).filter(
            InterviewEvaluation.session_id == interview.id
        ).first()

        if not evaluation:
            # If evaluation not generated yet, generate it now
            return cls.generate_and_save_evaluation(db, interview_id, user_id)

        messages = db.query(InterviewMessage).filter(
            InterviewMessage.session_id == interview.id
        ).order_by(InterviewMessage.timestamp.asc()).all()

        def safe_json(val, default):
            try:
                return json.loads(val) if val else default
            except Exception:
                return default

        formatted_messages = [
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

        return InterviewResults(
            interview_id=interview.id,
            job_role=interview.job_role,
            experience_level=interview.experience_level,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            total_questions=interview.total_questions,
            completed=interview.completed,
            overall_score=evaluation.overall_score,
            technical_score=evaluation.technical_score,
            communication_score=evaluation.communication_score,
            confidence_score=evaluation.confidence_score,
            problem_solving_score=evaluation.problem_solving_score,
            project_knowledge_score=evaluation.project_knowledge_score,
            strengths=safe_json(evaluation.strengths, []),
            weaknesses=safe_json(evaluation.weaknesses, []),
            incorrect_answers=safe_json(evaluation.incorrect_answers, []),
            missed_opportunities=safe_json(evaluation.missed_opportunities, []),
            topics_to_study=safe_json(evaluation.topics_to_study, []),
            recommendations=safe_json(evaluation.recommendations, []),
            practice_questions=safe_json(evaluation.practice_questions, []),
            transcript=formatted_messages
        )
