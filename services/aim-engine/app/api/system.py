"""Safe system endpoints for the AIM Engine service."""

from datetime import datetime, timezone
from time import monotonic

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

from app.core.service_info import SERVICE_NAME, SERVICE_PHASE, SERVICE_VERSION

router = APIRouter(tags=["system"])

_STARTED_AT_MONOTONIC = monotonic()


class AimEngineHealthResponse(BaseModel):
    """Safe health response for internal service monitoring."""

    service: str = Field(description="Stable service identifier.")
    status: str = Field(description="Health status.")
    timestamp: str = Field(description="UTC ISO-8601 timestamp.")
    uptime_seconds: float = Field(description="Process uptime in seconds.")
    phase: str = Field(description="Current implementation phase.")
    environment: str = Field(description="Runtime environment name.")


class AimEngineVersionResponse(BaseModel):
    """Safe version response for deployment verification."""

    service: str = Field(description="Stable service identifier.")
    version: str = Field(description="Application version.")
    phase: str = Field(description="Current implementation phase.")
    environment: str = Field(description="Runtime environment name.")


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@router.get("/health", response_model=AimEngineHealthResponse)
def get_health(request: Request) -> AimEngineHealthResponse:
    """Return safe AIM Engine health metadata.

    This endpoint must not expose secrets, database URLs, provider credentials,
    learner-internal model fields, or adaptive-learning internals.
    """
    settings = request.app.state.settings

    return AimEngineHealthResponse(
        service=SERVICE_NAME,
        status="ok",
        timestamp=_utc_now_iso(),
        uptime_seconds=round(monotonic() - _STARTED_AT_MONOTONIC, 3),
        phase=SERVICE_PHASE,
        environment=settings.env,
    )


@router.get("/version", response_model=AimEngineVersionResponse)
def get_version(request: Request) -> AimEngineVersionResponse:
    """Return safe AIM Engine version metadata."""
    settings = request.app.state.settings

    return AimEngineVersionResponse(
        service=SERVICE_NAME,
        version=SERVICE_VERSION,
        phase=SERVICE_PHASE,
        environment=settings.env,
    )
