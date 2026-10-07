from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class EducationItem(BaseModel):
    degree: Optional[str] = None
    university: Optional[str] = None
    cgpa_or_percentage: Optional[str] = None
    graduation_year: Optional[str] = None

class ProjectItem(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: List[str] = []
    candidate_role: Optional[str] = None
    key_contribution: Optional[str] = None
    interview_topics: List[str] = []
    possible_questions: List[str] = []

class ExperienceItem(BaseModel):
    organization: str
    role: str
    duration: Optional[str] = None
    responsibilities: List[str] = []
    technologies: List[str] = []
    achievements: List[str] = []

class CertificationItem(BaseModel):
    name: str
    issuer: Optional[str] = None
    skills: List[str] = []

class ResumeClaimItem(BaseModel):
    claim: str
    context: Optional[str] = None
    challenge_questions: List[str] = []

class ParsedResumeData(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    education: List[EducationItem] = []
    skills: List[str] = []
    projects: List[ProjectItem] = []
    experience: List[ExperienceItem] = []
    certifications: List[CertificationItem] = []
    resume_claims: List[ResumeClaimItem] = []
    suggested_roles: List[str] = []
    question_topics: List[str] = []

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str
    parsed_data: ParsedResumeData
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeSummary(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str
    candidate_name: Optional[str] = None
    skills_count: int = 0
    projects_count: int = 0
    created_at: datetime
