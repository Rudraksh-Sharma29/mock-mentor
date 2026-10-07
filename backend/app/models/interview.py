from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    job_role = Column(String, nullable=False)
    experience_level = Column(String, nullable=False)
    interview_type = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    total_questions = Column(Integer, default=5, nullable=False)
    selected_question_ids = Column(Text, nullable=True)  # Comma-separated list or initial pool
    strategy_config = Column(Text, nullable=True)        # JSON configuration of question distributions & topics
    status = Column(String, default="created", nullable=False)  # 'created', 'in_progress', 'completed'
    duration_seconds = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    overall_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="interviews")
    resume = relationship("Resume", back_populates="interviews")
    answers = relationship("Answer", back_populates="interview", cascade="all, delete-orphan")
    messages = relationship("InterviewMessage", back_populates="interview", cascade="all, delete-orphan")
    evaluation = relationship("InterviewEvaluation", back_populates="interview", uselist=False, cascade="all, delete-orphan")
