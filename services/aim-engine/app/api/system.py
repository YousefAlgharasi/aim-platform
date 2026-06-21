"""Safe system endpoints for the AIM Engine service."""

from datetime import UTC, datetime
from time import monotonic

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
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
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


@router.get(
    "/health",
    response_model=AimEngineHealthResponse,
    responses={503: {"model": AimEngineHealthResponse}},
)
def get_health(request: Request) -> JSONResponse:
    """Return AIM Engine health metadata.

    Returns 200 OK with status=ok when the engine is ready to serve requests.
    Returns 503 Service Unavailable with status=unavailable when the engine
    cannot self-attest readiness.

    This endpoint must not expose secrets, database URLs, provider credentials,
    learner-internal model fields, or adaptive-learning internals.
    """
    settings = request.app.state.settings
    ready: bool = getattr(request.app.state, "_ready", True)

    body = AimEngineHealthResponse(
        service=SERVICE_NAME,
        status="ok" if ready else "unavailable",
        timestamp=_utc_now_iso(),
        uptime_seconds=round(monotonic() - _STARTED_AT_MONOTONIC, 3),
        phase=SERVICE_PHASE,
        environment=settings.env,
    )

    return JSONResponse(
        content=body.model_dump(),
        status_code=200 if ready else 503,
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
