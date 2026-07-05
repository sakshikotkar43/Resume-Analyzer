import json
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, get_db
from .resume_parser import extract_text
from .ai_analyzer import analyze_resume

# Create DB tables on startup (SQLite file is created automatically)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Analyzer")

# Allow requests from a frontend running on a different port (e.g. localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Resume Analyzer API is running"}


@app.post("/analyze", response_model=schemas.AnalysisResponse)
async def analyze(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    # 1. Read and parse the uploaded file
    file_bytes = await file.read()
    try:
        resume_text = extract_text(file.filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Save the resume to the database
    resume = models.Resume(filename=file.filename, raw_text=resume_text)
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # 3. Run AI analysis
    try:
        result = analyze_resume(resume_text, job_description)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {e}")

    # 4. Save the analysis to the database
    analysis = models.Analysis(
        resume_id=resume.id,
        job_description=job_description,
        overall_score=result.get("overall_score", 0),
        content_score=result.get("content_score"),
        formatting_score=result.get("formatting_score"),
        ats_score=result.get("ats_score"),
        keyword_match_score=result.get("keyword_match_score"),
        strengths=json.dumps(result.get("strengths", [])),
        weaknesses=json.dumps(result.get("weaknesses", [])),
        suggestions=json.dumps(result.get("suggestions", [])),
        missing_keywords=json.dumps(result.get("missing_keywords", [])),
        raw_ai_response=json.dumps(result),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return _to_response(analysis)


@app.get("/history", response_model=List[schemas.ResumeHistoryItem])
def get_history(db: Session = Depends(get_db)):
    resumes = db.query(models.Resume).order_by(models.Resume.uploaded_at.desc()).all()
    return resumes


@app.get("/analysis/{analysis_id}", response_model=schemas.AnalysisResponse)
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _to_response(analysis)


@app.get("/resume/{resume_id}/analyses", response_model=List[schemas.AnalysisResponse])
def get_analyses_for_resume(resume_id: int, db: Session = Depends(get_db)):
    analyses = (
        db.query(models.Analysis)
        .filter(models.Analysis.resume_id == resume_id)
        .order_by(models.Analysis.created_at.desc())
        .all()
    )
    return [_to_response(a) for a in analyses]


def _to_response(analysis: models.Analysis) -> dict:
    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "overall_score": analysis.overall_score,
        "content_score": analysis.content_score,
        "formatting_score": analysis.formatting_score,
        "ats_score": analysis.ats_score,
        "keyword_match_score": analysis.keyword_match_score,
        "strengths": json.loads(analysis.strengths or "[]"),
        "weaknesses": json.loads(analysis.weaknesses or "[]"),
        "suggestions": json.loads(analysis.suggestions or "[]"),
        "missing_keywords": json.loads(analysis.missing_keywords or "[]"),
        "created_at": analysis.created_at,
    }
