"""FastAPI application factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from aim.infrastructure.config import get_settings
from aim.infrastructure.database.session import create_database_schema, engine
from aim.presentation.api.routers import goals, recommendations, reviews, sessions, student_state


@asynccontextmanager
async def lifespan(app: FastAPI):
    if engine.url.drivername.startswith("sqlite"):
        create_database_schema()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.api_title,
        description=settings.api_description,
        version=settings.api_version,
        lifespan=lifespan,
    )

    app.include_router(student_state.router)
    app.include_router(sessions.router)
    app.include_router(goals.router)
    app.include_router(reviews.router)
    app.include_router(recommendations.router)

    @app.get("/health", tags=["health"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

