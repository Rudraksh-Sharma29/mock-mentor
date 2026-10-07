from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_role = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)  # Technical, Behavioral, Aptitude
    difficulty = Column(String, index=True, nullable=False)  # Easy, Medium, Hard
    question_text = Column(Text, nullable=False)
    expected_keywords = Column(Text, nullable=False)  # comma-separated string
    model_answer = Column(Text, nullable=False)

    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
