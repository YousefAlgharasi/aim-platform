from fastapi import FastAPI
from backend.routers.student_state import router as student_state_router

app = FastAPI(title="AIM Backend", version="1.0.0")

app.include_router(student_state_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
