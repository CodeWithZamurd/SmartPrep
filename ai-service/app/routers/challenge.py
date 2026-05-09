import json
from datetime import date
from fastapi import APIRouter
from pydantic import BaseModel

from ..clients.openai_client import client, chat_model
from ..prompts.templates import domain_label, system_challenge

router = APIRouter()


class ChallengeReq(BaseModel):
    domain: str = "ai"


def _build(domain: str):
    label = domain_label(domain)
    today = date.today().isoformat()
    user_prompt = (
        f"Domain: {label}\n"
        f"Today's date: {today}\n"
        "Generate today's daily AI Challenge as JSON with keys: question, answer, explanation. "
        "The question should test a real-world concept. The answer should be a concise model "
        "answer (2-4 sentences). The explanation should go deeper (4-8 sentences) and may "
        "include short bullet-style insights when helpful."
    )
    resp = client().chat.completions.create(
        model=chat_model(),
        messages=[
            {"role": "system", "content": system_challenge()},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.6,
    )
    data = json.loads(resp.choices[0].message.content)
    return {
        "question": str(data.get("question", ""))[:600],
        "answer": str(data.get("answer", ""))[:1500],
        "explanation": str(data.get("explanation", ""))[:3000],
    }


@router.post("/generate-challenge")
def generate_challenge(req: ChallengeReq):
    return _build(req.domain)


@router.get("/generate-challenge")
def generate_challenge_get(domain: str = "ai"):
    return _build(domain)
