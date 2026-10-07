import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from typing import List, Dict, Any
from backend.app.models.interview import Interview
from backend.app.models.question import Question
from backend.app.models.answer import Answer
from backend.app.schemas.interview import InterviewCreate, InterviewResults, QuestionScoreDetail
from backend.app.schemas.answer import AnswerSubmit
from backend.app.services.evaluation_service import EvaluationService

class InterviewService:
    @staticmethod
    def create_interview(db: Session, user_id: int, data: InterviewCreate) -> Interview:
        query = db.query(Question)

        # 1. Filter by job role
        role_questions = query.filter(func.lower(Question.job_role) == data.job_role.lower()).all()

        # 2. Filter by category/interview_type if not 'Mixed'
        matched_pool = []
        if data.interview_type.lower() != 'mixed':
            matched_pool = [q for q in role_questions if q.category.lower() == data.interview_type.lower()]
        
        if not matched_pool:
            matched_pool = role_questions

        # 3. Filter by difficulty
        diff_pool = [q for q in matched_pool if q.difficulty.lower() == data.difficulty.lower()]
        
        selected_questions = []
        target_count = data.total_questions

        if len(diff_pool) >= target_count:
            selected_questions = random.sample(diff_pool, target_count)
        else:
            selected_questions.extend(diff_pool)
            remaining_needed = target_count - len(selected_questions)
            remaining_pool = [q for q in matched_pool if q not in selected_questions]
            if len(remaining_pool) >= remaining_needed:
                selected_questions.extend(random.sample(remaining_pool, remaining_needed))
            else:
                selected_questions.extend(remaining_pool)
                # If still need more, pick from general question bank
                all_questions = db.query(Question).all()
                other_pool = [q for q in all_questions if q not in selected_questions]
                if other_pool:
                    extra = min(len(other_pool), target_count - len(selected_questions))
                    selected_questions.extend(random.sample(other_pool, extra))

        if not selected_questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions available in the question bank. Please run seed_questions.py."
            )

        q_ids = ",".join(str(q.id) for q in selected_questions)

        interview = Interview(
            user_id=user_id,
            job_role=data.job_role,
            experience_level=data.experience_level,
            interview_type=data.interview_type,
            difficulty=data.difficulty,
            total_questions=len(selected_questions),
            selected_question_ids=q_ids,
            completed=False,
            overall_score=None
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)
        return interview

    @staticmethod
    def get_interview_questions(db: Session, interview: Interview) -> List[Question]:
        if not interview.selected_question_ids:
            return []
        ids = [int(x) for x in interview.selected_question_ids.split(",") if x.strip()]
        questions_map = {q.id: q for q in db.query(Question).filter(Question.id.in_(ids)).all()}
        return [questions_map[qid] for qid in ids if qid in questions_map]

    @staticmethod
    def submit_answer(db: Session, user_id: int, answer_data: AnswerSubmit) -> Dict[str, Any]:
        interview = db.query(Interview).filter(
            Interview.id == answer_data.interview_id,
            Interview.user_id == user_id
        ).first()

        if not interview:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

        question = db.query(Question).filter(Question.id == answer_data.question_id).first()
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

        # Verify question belongs to this interview's selected questions
        if interview.selected_question_ids:
            valid_ids = [int(x) for x in interview.selected_question_ids.split(",") if x.strip()]
            if question.id not in valid_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This question is not part of the active interview."
                )

        # Check if already answered
        existing_answer = db.query(Answer).filter(
            Answer.interview_id == interview.id,
            Answer.question_id == question.id
        ).first()

        if existing_answer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This question has already been answered for this interview."
            )

        # Automated Rule-Based Evaluation
        eval_result = EvaluationService.evaluate(
            question_text=question.question_text,
            candidate_answer=answer_data.answer_text,
            expected_keywords_str=question.expected_keywords,
            model_answer=question.model_answer
        )

        answer = Answer(
            interview_id=interview.id,
            question_id=question.id,
            answer_text=answer_data.answer_text.strip(),
            technical_score=eval_result["technical_score"],
            relevance_score=eval_result["relevance_score"],
            clarity_score=eval_result["clarity_score"],
            completeness_score=eval_result["completeness_score"],
            overall_score=eval_result["overall_score"],
            feedback=eval_result["feedback"]
        )
        db.add(answer)
        db.commit()
        db.refresh(answer)

        # If all questions answered, mark completed and set overall_score
        total_answers = db.query(Answer).filter(Answer.interview_id == interview.id).count()
        if total_answers >= interview.total_questions:
            all_answers = db.query(Answer).filter(Answer.interview_id == interview.id).all()
            avg_score = sum(a.overall_score for a in all_answers) / max(1, len(all_answers))
            interview.completed = True
            interview.overall_score = round(avg_score, 1)
            db.commit()
            db.refresh(interview)

        return {
            "id": answer.id,
            "interview_id": answer.interview_id,
            "question_id": answer.question_id,
            "answer_text": answer.answer_text,
            "technical_score": answer.technical_score,
            "relevance_score": answer.relevance_score,
            "clarity_score": answer.clarity_score,
            "completeness_score": answer.completeness_score,
            "overall_score": answer.overall_score,
            "feedback": answer.feedback,
            "model_answer": question.model_answer,
            "expected_keywords": question.expected_keywords,
            "matched_keywords": eval_result.get("matched_keywords", []),
            "created_at": answer.created_at
        }

    @staticmethod
    def get_interview_results(db: Session, interview_id: int, user_id: int) -> InterviewResults:
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == user_id
        ).first()

        if not interview:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

        answers = db.query(Answer).filter(Answer.interview_id == interview.id).all()
        if not answers:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No answers submitted for this interview yet.")

        q_map = {q.id: q for q in db.query(Question).all()}

        avg_technical = sum(a.technical_score for a in answers) / len(answers)
        avg_relevance = sum(a.relevance_score for a in answers) / len(answers)
        avg_clarity = sum(a.clarity_score for a in answers) / len(answers)
        avg_completeness = sum(a.completeness_score for a in answers) / len(answers)
        overall = sum(a.overall_score for a in answers) / len(answers)

        question_details = []
        for a in answers:
            q = q_map.get(a.question_id)
            q_text = q.question_text if q else "Question text unavailable"
            model_ans = q.model_answer if q else ""
            question_details.append(QuestionScoreDetail(
                question_id=a.question_id,
                question_text=q_text,
                score=a.overall_score,
                technical_score=a.technical_score,
                relevance_score=a.relevance_score,
                clarity_score=a.clarity_score,
                completeness_score=a.completeness_score,
                feedback=a.feedback,
                candidate_answer=a.answer_text,
                model_answer=model_ans
            ))

        strengths = []
        areas_to_improve = []

        if avg_technical >= 75:
            strengths.append("Demonstrated solid command of core technical concepts and domain terminology.")
        else:
            areas_to_improve.append("Include more specific technical terms and core underlying keywords in your answers.")

        if avg_clarity >= 75:
            strengths.append("Articulated responses with clear structure, capitalization, and punctuation.")
        else:
            areas_to_improve.append("Work on phrasing answers into complete, well-formed sentences.")

        if avg_relevance >= 75:
            strengths.append("Maintained strong relevance and accurately addressed the prompt requirements.")
        else:
            areas_to_improve.append("Focus directly on the exact core questions asked without generic filler.")

        if avg_completeness >= 75:
            strengths.append("Provided thorough, detailed explanations with sufficient technical depth.")
        else:
            areas_to_improve.append("Expand on key concepts with more elaboration, architecture nuance, or trade-offs.")

        if not strengths:
            strengths.append("Successfully attempted all interview questions under test conditions.")
        if not areas_to_improve:
            areas_to_improve.append("Continue practicing with advanced mock interview scenarios.")

        return InterviewResults(
            interview_id=interview.id,
            job_role=interview.job_role,
            experience_level=interview.experience_level,
            interview_type=interview.interview_type,
            difficulty=interview.difficulty,
            total_questions=interview.total_questions,
            completed=interview.completed,
            overall_score=round(overall, 1),
            average_technical_score=round(avg_technical, 1),
            average_relevance_score=round(avg_relevance, 1),
            average_clarity_score=round(avg_clarity, 1),
            average_completeness_score=round(avg_completeness, 1),
            question_scores=question_details,
            strengths=strengths,
            areas_to_improve=areas_to_improve
        )
