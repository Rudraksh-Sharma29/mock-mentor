from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # 'pdf', 'docx', 'txt'
    raw_text = Column(Text, nullable=False)
    parsed_data = Column(Text, nullable=False)  # JSON string containing candidate_name, skills, projects, experience, claims, topics
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="resumes")
    interviews = relationship("Interview", back_populates="resume", cascade="all, delete-orphan")
