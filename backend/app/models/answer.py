from datetime import datetime
from sqlalchemy import Column, Integer, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    technical_score = Column(Float, nullable=False)
    relevance_score = Column(Float, nullable=False)
    clarity_score = Column(Float, nullable=False)
    completeness_score = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    feedback = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interview = relationship("Interview", back_populates="answers")
    question = relationship("Question", back_populates="answers")
