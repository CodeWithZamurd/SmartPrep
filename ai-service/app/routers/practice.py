from fastapi import APIRouter

router = APIRouter()


@router.get("/practice-ping")
def ping():
    return {"ok": True}
