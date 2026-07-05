from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    overall_score: float
    content_score: Optional[float] = None
    formatting_score: Optional[float] = None
    ats_score: Optional[float] = None
    keyword_match_score: Optional[float] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    suggestions: List[str] = []
    missing_keywords: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeHistoryItem(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
