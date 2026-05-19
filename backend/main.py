"""
AIM backend FastAPI application entrypoint.

Run locally with:
    uvicorn backend.main:app --reload
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from backend.db import engine
from backend.models.question_attempt import Base as QuestionAttemptBase
from backend.models.student_state import Base as StudentStateBase
from backend.routers.goals import router as goals_router
from backend.routers.recommendations import router as recommendations_router
from backend.routers.reviews import router as reviews_router
from backend.routers.sessions import router as sessions_router
from backend.routers.student_state import router as student_state_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    if engine.url.drivername.startswith("sqlite"):
        StudentStateBase.metadata.create_all(bind=engine)
        QuestionAttemptBase.metadata.create_all(bind=engine)
        _ensure_sqlite_dev_columns()
    yield


def _ensure_sqlite_dev_columns() -> None:
    """
    SQLite create_all does not alter existing dev tables. This keeps local
    aim_dev.db files usable as new learning-state columns are added.
    """
    required = {
        "hesitation_index": "FLOAT NOT NULL DEFAULT 0",
        "retention_lambda": "FLOAT NOT NULL DEFAULT 0.15",
        "review_due": "BOOLEAN NOT NULL DEFAULT 0",
        "retention_history": "JSON NOT NULL DEFAULT '[]'",
    }
    with engine.begin() as conn:
        rows = conn.execute(text("PRAGMA table_info(student_skill_states)")).mappings()
        existing = {row["name"] for row in rows}
        for column_name, definition in required.items():
            if column_name not in existing:
                conn.execute(
                    text(
                        f"ALTER TABLE student_skill_states "
                        f"ADD COLUMN {column_name} {definition}"
                    )
                )


app = FastAPI(
    title="AIM Backend",
    description="Adaptive Intelligence Module API",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(student_state_router)
app.include_router(sessions_router)
app.include_router(goals_router)
app.include_router(reviews_router)
app.include_router(recommendations_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
