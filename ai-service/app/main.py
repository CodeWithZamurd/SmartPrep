import os
import traceback
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Load .env explicitly from the ai-service folder (one above app/)
ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

from .routers import interview, practice, feedback, challenge, vision  # noqa: E402

app = FastAPI(title="SmartPrep AI Service")


@app.exception_handler(Exception)
async def unhandled_exception_handler(_req: Request, exc: Exception):
    """Return JSON with the actual error so the Node backend can surface it."""
    tb = traceback.format_exc()
    print("[ai-service] UNHANDLED:", tb, flush=True)
    return JSONResponse(
        status_code=500,
        content={"error": str(exc) or exc.__class__.__name__, "type": exc.__class__.__name__},
    )


@app.get("/health")
def health():
    return {
        "ok": True,
        "service": "smartprep-ai",
        "openai_key_set": bool(os.getenv("OPENAI_API_KEY")),
        "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    }


app.include_router(interview.router)
app.include_router(practice.router)
app.include_router(feedback.router)
app.include_router(challenge.router)
app.include_router(vision.router)
