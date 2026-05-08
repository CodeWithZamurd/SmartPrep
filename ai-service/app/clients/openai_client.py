import os
from openai import OpenAI

_client = None


def client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY not set")
        _client = OpenAI(api_key=api_key)
    return _client


def chat_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def eval_model() -> str:
    return os.getenv("OPENAI_EVAL_MODEL", "gpt-4o-mini")


def whisper_model() -> str:
    return os.getenv("WHISPER_MODEL", "whisper-1")
