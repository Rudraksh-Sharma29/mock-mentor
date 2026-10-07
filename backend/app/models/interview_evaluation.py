from datetime import datetime
from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class InterviewEvaluation(Base):
    __tablename__ = "interview_evaluations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("interviews.id"), unique=True, nullable=False)
    
    technical_score = Column(Float, nullable=False)
    communication_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    problem_solving_score = Column(Float, nullable=False)
    project_knowledge_score = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    
    strengths = Column(Text, nullable=False)              # JSON string list
    weaknesses = Column(Text, nullable=False)             # JSON string list
    incorrect_answers = Column(Text, nullable=True)       # JSON string list
    missed_opportunities = Column(Text, nullable=True)    # JSON string list
    topics_to_study = Column(Text, nullable=False)        # JSON string list
    recommendations = Column(Text, nullable=False)        # JSON string list
    practice_questions = Column(Text, nullable=True)      # JSON string list
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interview = relationship("Interview", back_populates="evaluation")
