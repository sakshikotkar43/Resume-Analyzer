import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Fast, capable, and on Groq's generous free tier.
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are an expert resume reviewer and career coach with years of
experience in recruiting and applicant tracking systems (ATS).

You will be given a resume's raw text, and optionally a target job description.
Analyze the resume carefully and return ONLY a valid JSON object (no markdown
fences, no preamble, no extra commentary) with exactly this structure:

{
  "overall_score": <integer 0-100>,
  "content_score": <integer 0-100, quality of achievements/wording>,
  "formatting_score": <integer 0-100, structure/readability>,
  "ats_score": <integer 0-100, ATS parsing friendliness>,
  "keyword_match_score": <integer 0-100, or null if no job description given>,
  "strengths": [<3-5 short strings>],
  "weaknesses": [<3-5 short strings>],
  "suggestions": [<5-8 specific, actionable strings. Where useful, phrase as
     'Change: \"<original phrase>\" -> \"<improved phrase>\"'>],
  "missing_keywords": [<list of important keywords from the job description
     missing from the resume, or empty list if no job description given>]
}

Be specific and concrete, not generic. Reference actual phrases from the resume
where possible. Do not include anything outside the JSON object.
"""


def analyze_resume(resume_text: str, job_description: str | None = None) -> dict:
    user_content = f"RESUME TEXT:\n{resume_text}\n"
    if job_description:
        user_content += f"\nTARGET JOB DESCRIPTION:\n{job_description}\n"
    else:
        user_content += "\nNo job description was provided. Set keyword_match_score to null and missing_keywords to []."

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=2000,
        temperature=0.4,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
    )

    raw_text = response.choices[0].message.content.strip()
    return _safe_parse_json(raw_text)


def _safe_parse_json(raw_text: str) -> dict:
    """Strip any accidental markdown fences and parse JSON safely."""
    cleaned = re.sub(r"^```(json)?|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI response was not valid JSON: {e}\nRaw response: {raw_text[:500]}")
