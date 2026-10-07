import json
import asyncio
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal
from backend.app.utils.security import decode_access_token
from backend.app.models.user import User
from backend.app.models.interview import Interview
from backend.app.models.interview_message import InterviewMessage
from backend.app.models.resume import Resume
from backend.app.services.gemini_service import GeminiService
from backend.app.services.report_service import ReportService

router = APIRouter(tags=["Live WebSocket Interview"])

@router.websocket("/ws/interview/{session_id}")
async def interview_websocket_endpoint(
    websocket: WebSocket,
    session_id: int,
    token: str = Query(...)
):
    await websocket.accept()

    # Authenticate token
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        await websocket.send_json({"type": "error", "message": "Unauthorized: Invalid or expired token"})
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = int(payload["sub"])
    db: Session = SessionLocal()

    try:
        interview = db.query(Interview).filter(
            Interview.id == session_id,
            Interview.user_id == user_id
        ).first()

        if not interview:
            await websocket.send_json({"type": "error", "message": "Interview session not found"})
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Update status
        if interview.status == "created":
            interview.status = "in_progress"
            db.commit()

        # Load resume context
        resume_context = {}
        if interview.resume_id:
            resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
            if resume and resume.parsed_data:
                try:
                    resume_context = json.loads(resume.parsed_data)
                except Exception:
                    pass

        if not resume_context:
            resume_context = {
                "candidate_name": interview.user.name if interview.user else "Candidate",
                "skills": [interview.job_role, "Problem Solving"],
                "projects": [],
                "resume_claims": []
            }

        # Check existing messages
        existing_messages = db.query(InterviewMessage).filter(
            InterviewMessage.session_id == interview.id
        ).order_by(InterviewMessage.timestamp.asc()).all()

        # Send existing transcript history to client upon connect
        if existing_messages:
            history_payload = [
                {
                    "speaker": m.speaker,
                    "message": m.message,
                    "topic": m.topic,
                    "timestamp": m.timestamp.isoformat()
                }
                for m in existing_messages
            ]
            await websocket.send_json({
                "type": "history",
                "messages": history_payload
            })
        else:
            # First message: Mentor initiates with opening question
            first_turn = GeminiService.generate_interview_response(
                resume_context=resume_context,
                conversation_history=[],
                interview_type=interview.interview_type,
                difficulty=interview.difficulty,
                current_question_number=1,
                total_questions=interview.total_questions
            )

            mentor_msg = InterviewMessage(
                session_id=interview.id,
                speaker="mentor",
                message=first_turn.get("mentor_response", f"Hello {resume_context.get('candidate_name', 'there')}, welcome to your mock interview. Could you introduce yourself and walk me through your key technical project?"),
                question_number=1,
                topic=first_turn.get("topic", "Introduction & Project Overview")
            )
            db.add(mentor_msg)
            db.commit()
            db.refresh(mentor_msg)

            await websocket.send_json({
                "type": "mentor_message",
                "message": mentor_msg.message,
                "topic": mentor_msg.topic,
                "is_follow_up": False,
                "question_number": 1,
                "total_questions": interview.total_questions,
                "is_concluded": False,
                "timestamp": mentor_msg.timestamp.isoformat()
            })

        # Main message loop
        while True:
            data_raw = await websocket.receive_text()
            try:
                data = json.loads(data_raw)
            except Exception:
                data = {"type": "candidate_message", "message": data_raw}

            msg_type = data.get("type", "candidate_message")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            if msg_type in ["candidate_message", "speech_transcription"]:
                candidate_text = data.get("message", "").strip()
                if not candidate_text:
                    continue

                # Count questions asked so far
                all_msgs = db.query(InterviewMessage).filter(
                    InterviewMessage.session_id == interview.id
                ).order_by(InterviewMessage.timestamp.asc()).all()

                mentor_questions = [m for m in all_msgs if m.speaker == "mentor"]
                current_q_num = len(mentor_questions)

                # Save candidate message
                cand_msg = InterviewMessage(
                    session_id=interview.id,
                    speaker="candidate",
                    message=candidate_text,
                    question_number=current_q_num
                )
                db.add(cand_msg)
                db.commit()

                # Build updated conversation history
                conv_history = [
                    {"speaker": m.speaker, "message": m.message}
                    for m in all_msgs
                ]
                conv_history.append({"speaker": "candidate", "message": candidate_text})

                # Determine next question number
                next_q_num = current_q_num + 1

                # Inform client that AI is evaluating and reasoning
                await websocket.send_json({
                    "type": "mentor_thinking",
                    "status": "Analyzing response and preparing adaptive follow-up..."
                })

                # Generate mentor response
                next_turn = GeminiService.generate_interview_response(
                    resume_context=resume_context,
                    conversation_history=conv_history,
                    interview_type=interview.interview_type,
                    difficulty=interview.difficulty,
                    current_question_number=next_q_num,
                    total_questions=interview.total_questions
                )

                mentor_reply_text = next_turn.get("mentor_response", "Thank you for that response. Let's move on to the next topic.")
                is_concluded = bool(next_turn.get("is_concluded", False) or next_q_num > interview.total_questions)

                # Save mentor reply
                new_mentor_msg = InterviewMessage(
                    session_id=interview.id,
                    speaker="mentor",
                    message=mentor_reply_text,
                    question_number=next_q_num if not is_concluded else None,
                    topic=next_turn.get("topic", "Technical Deep Dive")
                )
                db.add(new_mentor_msg)
                db.commit()
                db.refresh(new_mentor_msg)

                await websocket.send_json({
                    "type": "mentor_message",
                    "message": mentor_reply_text,
                    "topic": new_mentor_msg.topic,
                    "is_follow_up": next_turn.get("is_follow_up", False),
                    "question_number": min(next_q_num, interview.total_questions),
                    "total_questions": interview.total_questions,
                    "is_concluded": is_concluded,
                    "timestamp": new_mentor_msg.timestamp.isoformat()
                })

                if is_concluded:
                    # Auto-generate evaluation
                    try:
                        ReportService.generate_and_save_evaluation(db, interview.id, user_id)
                    except Exception as e:
                        print(f"[WebSocket] Error auto-generating report: {e}")

                    await websocket.send_json({
                        "type": "interview_completed",
                        "interview_id": interview.id,
                        "results_url": f"/interview/{interview.id}/results"
                    })

            elif msg_type == "end_interview":
                # Explicit end request by user
                try:
                    ReportService.generate_and_save_evaluation(db, interview.id, user_id)
                except Exception as e:
                    print(f"[WebSocket] Error generating report on end_interview: {e}")

                await websocket.send_json({
                    "type": "interview_completed",
                    "interview_id": interview.id,
                    "results_url": f"/interview/{interview.id}/results"
                })
                break

    except WebSocketDisconnect:
        print(f"[WebSocket] Client disconnected from interview session {session_id}")
    except Exception as e:
        print(f"[WebSocket] Error in interview session {session_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "message": f"Server error: {str(e)}"})
        except Exception:
            pass
    finally:
        db.close()
