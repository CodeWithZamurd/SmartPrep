import json
import random
from typing import List, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from ..clients.openai_client import client, chat_model, eval_model, whisper_model
from ..prompts.templates import (
    DOMAIN_LABELS,
    ANCHORS,
    system_question_gen,
    system_evaluator,
)

router = APIRouter()


class HistoryItem(BaseModel):
    question: str
    transcript: Optional[str] = None


class GenerateQuestionReq(BaseModel):
    domain: str = "software"
    difficulty: str = "medium"
    history: List[HistoryItem] = []


@router.post("/generate-question")
def generate_question(req: GenerateQuestionReq):
    domain_label = DOMAIN_LABELS.get(req.domain, DOMAIN_LABELS["software"])
    anchors = ANCHORS.get(req.domain, ANCHORS["software"])
    asked = {h.question.strip().lower() for h in req.history}
    pool = [a for a in anchors if a.strip().lower() not in asked]
    seed_anchor = random.choice(pool) if pool else random.choice(anchors)

    history_text = "\n".join(f"- {h.question}" for h in req.history) or "(none)"

    user_prompt = (
        f"Domain: {domain_label}\n"
        f"Difficulty: {req.difficulty}\n"
        f"Already asked:\n{history_text}\n\n"
        f"Use this anchor as inspiration (rewrite or follow up): \"{seed_anchor}\"\n"
        "Return JSON: {\"question\": \"...\"}"
    )

    resp = client().chat.completions.create(
        model=chat_model(),
        messages=[
            {"role": "system", "content": system_question_gen()},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    data = json.loads(resp.choices[0].message.content)
    return {"question": data["question"]}


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    contents = await file.read()
    if not contents:
        raise HTTPException(400, "Empty audio")
    # OpenAI SDK requires a file-like object with a name
    import io
    bio = io.BytesIO(contents)
    bio.name = file.filename or "audio.m4a"
    resp = client().audio.transcriptions.create(
        model=whisper_model(),
        file=bio,
    )
    return {"text": resp.text}


class EvaluateReq(BaseModel):
    question: str
    transcript: str
    domain: str = "software"
    difficulty: str = "medium"


@router.post("/evaluate-answer")
def evaluate_answer(req: EvaluateReq):
    domain_label = DOMAIN_LABELS.get(req.domain, DOMAIN_LABELS["software"])
    user_prompt = (
        f"Domain: {domain_label}\n"
        f"Current difficulty: {req.difficulty}\n"
        f"Question: {req.question}\n"
        f"Candidate answer (transcribed): {req.transcript}\n\n"
        "Return JSON with keys: technicalScore, clarityScore, confidenceScore, "
        "suggestion, nextDifficulty."
    )
    resp = client().chat.completions.create(
        model=eval_model(),
        messages=[
            {"role": "system", "content": system_evaluator()},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    data = json.loads(resp.choices[0].message.content)

    def clamp(x):
        try:
            v = float(x)
        except Exception:
            v = 0
        return max(0, min(100, int(round(v))))

    nd = str(data.get("nextDifficulty", req.difficulty)).lower()
    if nd not in {"easy", "medium", "hard"}:
        nd = req.difficulty

    return {
        "technicalScore": clamp(data.get("technicalScore", 0)),
        "clarityScore": clamp(data.get("clarityScore", 0)),
        "confidenceScore": clamp(data.get("confidenceScore", 0)),
        "suggestion": str(data.get("suggestion", ""))[:300],
        "nextDifficulty": nd,
    }
