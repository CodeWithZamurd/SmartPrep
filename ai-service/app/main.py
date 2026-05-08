import os
from dotenv import load_dotenv
from fastapi import FastAPI
from .routers import interview, practice, feedback, challenge

load_dotenv()

app = FastAPI(title="SmartPrep AI Service")


@app.get("/health")
def health():
    return {"ok": True, "service": "smartprep-ai"}


app.include_router(interview.router)
app.include_router(practice.router)
app.include_router(feedback.router)
app.include_router(challenge.router)
