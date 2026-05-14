import base64
import json
import io
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException

from ..clients.openai_client import client, chat_model

router = APIRouter()


SYSTEM_PROMPT = (
    "You are an expert interview coach analyzing a candidate's body language from a "
    "single video frame captured during an AI mock interview. Look at the visible "
    "person and score four dimensions on a 0-100 scale where 100 is best:\n"
    "  - eyeContact: are they looking at the camera (or screen) vs away?\n"
    "  - facialSentiment: are they calm/engaged/positive vs tense/anxious/disengaged?\n"
    "  - fidgeting: 100 = perfectly still / composed, lower = visible fidgeting/restlessness.\n"
    "  - posture: 100 = upright/professional, lower = slouched/poor posture.\n"
    "If the frame is empty, blurry, very dark, has no visible face, or you cannot "
    "judge any dimension, set it to null and include a short note in 'reason'.\n"
    "Return STRICT JSON with keys: eyeContact, facialSentiment, fidgeting, posture, reason."
)


def _clamp(x):
    if x is None:
        return None
    try:
        v = float(x)
    except Exception:
        return None
    return max(0, min(100, int(round(v))))


def _empty():
    return {
        "eyeContact": None,
        "facialSentiment": None,
        "fidgeting": None,
        "posture": None,
        "reason": "no frame analyzed",
    }


@router.post("/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    contents = await file.read()
    if not contents:
        raise HTTPException(400, "Empty frame")

    # Guess mime
    mime = file.content_type or "image/jpeg"
    if mime not in ("image/jpeg", "image/png", "image/webp"):
        mime = "image/jpeg"

    b64 = base64.b64encode(contents).decode("ascii")
    data_url = f"data:{mime};base64,{b64}"

    try:
        resp = client().chat.completions.create(
            model=chat_model(),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Score the candidate's body language in this frame."},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=200,
        )
        raw = resp.choices[0].message.content or "{}"
        data = json.loads(raw)
    except Exception as e:
        return {**_empty(), "reason": f"vision call failed: {e.__class__.__name__}"}

    return {
        "eyeContact": _clamp(data.get("eyeContact")),
        "facialSentiment": _clamp(data.get("facialSentiment")),
        "fidgeting": _clamp(data.get("fidgeting")),
        "posture": _clamp(data.get("posture")),
        "reason": str(data.get("reason", ""))[:200],
    }
