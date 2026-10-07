import os
import io
import json
from typing import Tuple, Dict, Any, List
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from pypdf import PdfReader
import docx

from backend.app.models.resume import Resume
from backend.app.services.gemini_service import GeminiService

class ResumeService:
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    @classmethod
    def extract_text_from_file(cls, filename: str, content: bytes) -> Tuple[str, str]:
        """
        Extracts raw readable text from PDF, DOCX, or TXT file bytes.
        """
        ext = filename.split('.')[-1].lower() if '.' in filename else ''
        text = ""

        if ext == 'pdf':
            try:
                reader = PdfReader(io.BytesIO(content))
                pages_text = []
                for page in reader.pages:
                    extracted = page.extract_text()
                    if extracted:
                        pages_text.append(extracted)
                text = "\n\n".join(pages_text)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to read PDF document: {str(e)}"
                )
        elif ext in ['docx', 'doc']:
            try:
                doc = docx.Document(io.BytesIO(content))
                paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                text = "\n".join(paragraphs)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to read DOCX document: {str(e)}"
                )
        elif ext == 'txt':
            try:
                text = content.decode('utf-8', errors='ignore')
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to read text file: {str(e)}"
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Please upload a PDF or DOCX resume."
            )

        text_clean = text.strip()
        if len(text_clean.split()) < 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded document contains insufficient readable text to be parsed as a resume."
            )

        return text_clean, ext

    @classmethod
    async def process_and_save_resume(
        cls,
        db: Session,
        user_id: int,
        file: UploadFile
    ) -> Resume:
        """
        Reads uploaded resume, extracts text, analyzes with Gemini Flash,
        and persists structured data in SQLite.
        """
        content = await file.read()
        if len(content) > cls.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds the 10 MB limit."
            )

        raw_text, file_type = cls.extract_text_from_file(file.filename, content)

        # Call Gemini Flash to extract structured profile, skills, projects, and claims
        parsed_dict = GeminiService.analyze_resume_text(raw_text, file.filename)

        resume = Resume(
            user_id=user_id,
            filename=file.filename,
            file_type=file_type,
            raw_text=raw_text,
            parsed_data=json.dumps(parsed_dict)
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume

    @staticmethod
    def get_resume_by_id(db: Session, resume_id: int, user_id: int) -> Resume:
        resume = db.query(Resume).filter(
            Resume.id == resume_id,
            Resume.user_id == user_id
        ).first()
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        return resume

    @staticmethod
    def list_user_resumes(db: Session, user_id: int) -> List[Resume]:
        return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).all()
