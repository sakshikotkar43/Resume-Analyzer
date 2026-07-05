from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)

    job_description = Column(Text, nullable=True)

    overall_score = Column(Float, nullable=False)
    content_score = Column(Float, nullable=True)
    formatting_score = Column(Float, nullable=True)
    ats_score = Column(Float, nullable=True)
    keyword_match_score = Column(Float, nullable=True)

    strengths = Column(Text, nullable=True)          # stored as JSON string
    weaknesses = Column(Text, nullable=True)          # stored as JSON string
    suggestions = Column(Text, nullable=True)         # stored as JSON string
    missing_keywords = Column(Text, nullable=True)    # stored as JSON string
    raw_ai_response = Column(Text, nullable=True)     # full JSON, for debugging/audit

    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
