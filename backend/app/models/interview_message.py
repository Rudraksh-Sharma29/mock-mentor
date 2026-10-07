from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class InterviewMessage(Base):
    __tablename__ = "interview_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    speaker = Column(String, nullable=False)  # 'mentor' or 'candidate'
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    question_number = Column(Integer, nullable=True)
    topic = Column(String, nullable=True)
    audio_url = Column(String, nullable=True)

    interview = relationship("Interview", back_populates="messages")
