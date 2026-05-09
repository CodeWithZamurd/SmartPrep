import json
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from ..clients.openai_client import client, eval_model
from ..prompts.templates import domain_label, system_feedback

router = APIRouter()


class Turn(BaseModel):
    question: str
    transcript: Optional[str] = ""
    technicalScore: Optional[float] = 0
    clarityScore: Optional[float] = 0
    confidenceScore: Optional[float] = 0
    suggestion: Optional[str] = ""
    eyeContactPct: Optional[float] = None


class FeedbackReq(BaseModel):
    domain: str = "web"
    turns: List[Turn]


def _clamp(x, default=0):
    try:
        v = float(x)
    except Exception:
        v = default
    return max(0, min(100, int(round(v))))


def _empty():
    return {
        "summary": "No turns to evaluate.",
        "tips": [],
        "overallTechnical": 0,
        "overallClarity": 0,
        "overallConfidence": 0,
        "overallVoice": 0,
        "overallBodyLanguage": 0,
        "voiceMetrics": {"fillerWords": 0, "pacing": 0, "clarity": 0, "toneConfidence": 0},
        "bodyMetrics": {"eyeContact": 0, "facialSentiment": 0, "fidgeting": 0, "posture": 0},
        "suggestions": {"technical": "", "voice": "", "bodyLanguage": ""},
    }


@router.post("/generate-feedback")
def generate_feedback(req: FeedbackReq):
    if not req.turns:
        return _empty()

    label = domain_label(req.domain)

    avg = lambda key: round(
        sum(getattr(t, key) or 0 for t in req.turns) / len(req.turns)
    )
    overall_tech = avg("technicalScore")
    overall_clar = avg("clarityScore")
    overall_conf = avg("confidenceScore")

    eyes = [t.eyeContactPct for t in req.turns if t.eyeContactPct is not None]
    has_video = bool(eyes)
    avg_eye = round(sum(eyes) / len(eyes)) if eyes else 80

    transcript_block = "\n\n".join(
        f"Q{i+1}: {t.question}\nA{i+1}: {t.transcript}\n"
        f"Scores: tech={t.technicalScore}, clarity={t.clarityScore}, confidence={t.confidenceScore}"
        for i, t in enumerate(req.turns)
    )

    user_prompt = (
        f"Domain: {label}\n"
        f"Overall (computed): tech={overall_tech}, clarity={overall_clar}, confidence={overall_conf}\n"
        f"Average measured eye-contact %: {avg_eye if has_video else 'unavailable (no webcam)'}\n\n"
        f"Transcript:\n{transcript_block}\n\n"
        "Return JSON with keys exactly:\n"
        "summary (string),\n"
        "tips (array of 3 short strings),\n"
        "voiceMetrics: {fillerWords, pacing, clarity, toneConfidence} (each 0-100),\n"
        "bodyMetrics: {eyeContact, facialSentiment, fidgeting, posture} (each 0-100; "
        "if no video, return neutral 80 defaults),\n"
        "suggestions: {technical, voice, bodyLanguage} (1-2 sentence personalized advice each).\n"
    )

    try:
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
    except Exception:
        data = {}

    tips = data.get("tips") or []
    if not isinstance(tips, list):
        tips = []

    vm = data.get("voiceMetrics") or {}
    voice_metrics = {
        "fillerWords": _clamp(vm.get("fillerWords"), default=overall_clar),
        "pacing": _clamp(vm.get("pacing"), default=80),
        "clarity": _clamp(vm.get("clarity"), default=overall_clar),
        "toneConfidence": _clamp(vm.get("toneConfidence"), default=overall_conf),
    }
    overall_voice = round(
        (voice_metrics["fillerWords"] + voice_metrics["pacing"]
         + voice_metrics["clarity"] + voice_metrics["toneConfidence"]) / 4
    )

    bm = data.get("bodyMetrics") or {}
    if has_video:
        body_metrics = {
            "eyeContact": _clamp(bm.get("eyeContact"), default=avg_eye),
            "facialSentiment": _clamp(bm.get("facialSentiment"), default=80),
            "fidgeting": _clamp(bm.get("fidgeting"), default=80),
            "posture": _clamp(bm.get("posture"), default=80),
        }
    else:
        body_metrics = {"eyeContact": 0, "facialSentiment": 0, "fidgeting": 0, "posture": 0}
    overall_body = (
        round(sum(body_metrics.values()) / 4) if has_video else 0
    )

    sg = data.get("suggestions") or {}
    suggestions = {
        "technical": str(sg.get("technical", ""))[:600],
        "voice": str(sg.get("voice", ""))[:600],
        "bodyLanguage": str(sg.get("bodyLanguage", ""))[:600],
    }

    return {
        "summary": str(data.get("summary", ""))[:1500],
        "tips": [str(t)[:200] for t in tips][:3],
        "overallTechnical": overall_tech,
        "overallClarity": overall_clar,
        "overallConfidence": overall_conf,
        "overallVoice": overall_voice,
        "overallBodyLanguage": overall_body,
        "voiceMetrics": voice_metrics,
        "bodyMetrics": body_metrics,
        "suggestions": suggestions,
    }
