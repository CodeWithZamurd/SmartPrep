import json
from fastapi import APIRouter
from pydantic import BaseModel

from ..clients.openai_client import client, chat_model
from ..prompts.templates import DOMAIN_LABELS, system_challenge

router = APIRouter()


class ChallengeReq(BaseModel):
    domain: str = "software"


@router.post("/generate-challenge")
def generate_challenge(req: ChallengeReq):
    domain_label = DOMAIN_LABELS.get(req.domain, DOMAIN_LABELS["software"])
    user_prompt = (
        f"Domain: {domain_label}\n"
        "Generate one MCQ. Return JSON: {question, options:[a,b,c,d], correctIndex:0-3, explanation}"
    )
    resp = client().chat.completions.create(
        model=chat_model(),
        messages=[
            {"role": "system", "content": system_challenge()},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    data = json.loads(resp.choices[0].message.content)
    options = data.get("options", [])
    if not isinstance(options, list) or len(options) != 4:
        options = ["A", "B", "C", "D"]
    correct = data.get("correctIndex", 0)
    try:
        correct = max(0, min(3, int(correct)))
    except Exception:
        correct = 0
    return {
        "question": str(data.get("question", "")),
        "options": [str(o) for o in options],
        "correctIndex": correct,
        "explanation": str(data.get("explanation", ""))[:500],
    }
