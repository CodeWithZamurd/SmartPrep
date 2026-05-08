import json
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from ..clients.openai_client import client, eval_model
from ..prompts.templates import DOMAIN_LABELS, system_feedback

router = APIRouter()


class Turn(BaseModel):
    question: str
    transcript: Optional[str] = ""
    technicalScore: Optional[float] = 0
    clarityScore: Optional[float] = 0
    confidenceScore: Optional[float] = 0
    suggestion: Optional[str] = ""


class FeedbackReq(BaseModel):
    domain: str = "software"
    turns: List[Turn]


@router.post("/generate-feedback")
def generate_feedback(req: FeedbackReq):
    domain_label = DOMAIN_LABELS.get(req.domain, DOMAIN_LABELS["software"])
    if not req.turns:
        return {"summary": "No turns to evaluate.", "tips": [], "overallTechnical": 0,
                "overallClarity": 0, "overallConfidence": 0}

    avg = lambda key: round(sum(getattr(t, key) or 0 for t in req.turns) / len(req.turns))
    overall_tech = avg("technicalScore")
    overall_clar = avg("clarityScore")
    overall_conf = avg("confidenceScore")

    transcript_block = "\n\n".join(
        f"Q{i+1}: {t.question}\nA{i+1}: {t.transcript}\n"
        f"Scores: tech={t.technicalScore}, clarity={t.clarityScore}, confidence={t.confidenceScore}"
        for i, t in enumerate(req.turns)
    )

    user_prompt = (
        f"Domain: {domain_label}\n"
        f"Overall: tech={overall_tech}, clarity={overall_clar}, confidence={overall_conf}\n\n"
        f"Transcript:\n{transcript_block}\n\n"
        'Return JSON: {"summary": "...", "tips": ["...", "...", "..."]}'
    )

    resp = client().chat.completions.create(
        model=eval_model(),
        messages=[
            {"role": "system", "content": system_feedback()},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.4,
    )
    data = json.loads(resp.choices[0].message.content)
    tips = data.get("tips", [])
    if not isinstance(tips, list):
        tips = []
    return {
        "summary": str(data.get("summary", ""))[:1500],
        "tips": [str(t)[:200] for t in tips][:3],
        "overallTechnical": overall_tech,
        "overallClarity": overall_clar,
        "overallConfidence": overall_conf,
    }
