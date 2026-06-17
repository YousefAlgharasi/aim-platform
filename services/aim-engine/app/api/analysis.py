"""POST /aim/v1/analysis endpoint — P5-020.

This module adds the single analysis route to the AIM Engine service.

Caller rules (enforced here and at the transport layer):
- Only the Backend NestJS adapter may call this endpoint.
- Flutter, Admin Dashboard, and any other client must never reach this route.
- The endpoint is bound to the internal service network only (enforced at the
  infrastructure level; this module enforces at the application level via the
  service-token guard).

Security rules:
- The service token is verified on every request before any processing.
- The token is never logged, never echoed in a response, and never exposed in
  error messages.
- No secrets, database credentials, or provider keys are referenced here.

Pipeline delegation:
- P5-020 owns the route and the service-token guard.
- P5-023 owns the pipeline entrypoint that this route will call.
- Until P5-023 is implemented the route returns an accepted stub response so
  the endpoint shape and auth can be verified independently.

Audit surface (P5-006 / aim-engine-api-map.md):
- Logged metadata only: timestamp, X-Request-Id, backend_request_id,
  student_id, session_id, status, pipeline duration.
- Raw request and response bodies are never logged.
- The service token is never logged.
"""

from __future__ import annotations

import logging
import secrets
from datetime import UTC, datetime
from time import monotonic

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import AimEngineSettings, get_settings

# Import the Phase 5 schemas produced in P5-021 and P5-022.
# These live in services/aim-engine/app/schemas/ (copies aligned to the
# aim-engine package; the canonical contracts are in packages/shared-contracts).
from app.schemas.aim_analysis_request import AimAnalysisRequest
from app.schemas.aim_analysis_response import AimAnalysisResponse, AimResponseCategories

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/aim/v1", tags=["aim-analysis"])


# ---------------------------------------------------------------------------
# Service-token dependency
# ---------------------------------------------------------------------------


def _verify_service_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    settings: AimEngineSettings = Depends(get_settings),
) -> None:
    """Verify the backend service token.

    Returns normally when the token is valid.
    Raises HTTP 401 when the Authorization header is missing or malformed.
    Raises HTTP 401 when the token does not match using constant-time compare.

    The token value is never included in any log message or response body.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "UNAUTHORIZED",
                "message": "Authentication is required.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not secrets.compare_digest(
        credentials.credentials.encode(), settings.service_token.encode()
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_INVALID",
                "message": "Authentication is invalid.",
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# Analysis endpoint
# ---------------------------------------------------------------------------


@router.post(
    "/analysis",
    response_model=AimAnalysisResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(_verify_service_token)],
    summary="Submit a structured AIM analysis request",
    description=(
        "Backend-internal endpoint for POST /aim/v1/analysis. "
        "Accepts a validated AimAnalysisRequest and returns an AimAnalysisResponse. "
        "Requires backend service token. "
        "Not accessible to clients, Flutter, or the Admin Dashboard."
    ),
    responses={
        200: {"description": "Analysis completed; structured AIM decisions returned."},
        400: {"description": "Request body fails schema validation."},
        401: {"description": "Missing or invalid service token."},
        409: {"description": "Idempotency conflict — same backend_request_id, different payload."},
        500: {"description": "Unexpected engine fault; safe failure shape returned."},
    },
)
async def post_analysis(
    request: Request,
    body: AimAnalysisRequest,
    x_request_id: str | None = Header(default=None, alias="X-Request-Id"),
    x_backend_version: str | None = Header(default=None, alias="X-Backend-Version"),
    x_contract_version: str | None = Header(default=None, alias="X-Contract-Version"),
    settings: AimEngineSettings = Depends(get_settings),
) -> JSONResponse:
    """Process a backend AIM analysis request.

    P5-020 implements the route, auth guard, audit logging, and response
    envelope.  P5-023 will implement the pipeline entrypoint this route
    delegates to; until then a stub empty-categories response is returned so
    the endpoint shape and token auth can be verified in isolation.

    Audit metadata logged (never the raw body or the token):
    - timestamp, X-Request-Id, backend_request_id, student_id, session_id,
      status, pipeline_duration_ms.
    """
    started = monotonic()

    # Audit log — metadata only, per aim-engine-api-map.md audit surface rules.
    logger.info(
        "aim_analysis_request",
        extra={
            "x_request_id": x_request_id,
            "backend_request_id": body.backend_request_id,
            "student_id": body.session.student_id,
            "session_id": body.session.session_id,
            "attempt_count": len(body.attempts),
            "contract_version": body.session.contract_version,
            "x_backend_version": x_backend_version,
            "x_contract_version": x_contract_version,
        },
    )

    # -----------------------------------------------------------------------
    # Pipeline delegation (P5-023 entrypoint).
    # Until P5-023 is implemented, return a valid stub response with empty
    # categories so the endpoint contract can be exercised.
    # -----------------------------------------------------------------------
    pipeline = getattr(request.app.state, "aim_pipeline", None)

    if pipeline is not None:
        # P5-023 has injected a real pipeline — delegate to it.
        response: AimAnalysisResponse = await pipeline.run(body)
    else:
        # Stub: empty categories, correct envelope correlation.
        response = AimAnalysisResponse(
            backend_request_id=body.backend_request_id,
            contract_version=body.session.contract_version,
            student_id=body.session.student_id,
            session_id=body.session.session_id,
            generated_at=datetime.now(UTC),
            categories=AimResponseCategories(),
        )

    duration_ms = round((monotonic() - started) * 1000, 1)

    logger.info(
        "aim_analysis_response",
        extra={
            "x_request_id": x_request_id,
            "backend_request_id": body.backend_request_id,
            "student_id": body.session.student_id,
            "session_id": body.session.session_id,
            "status": 200,
            "pipeline_duration_ms": duration_ms,
        },
    )

    return JSONResponse(
        content=response.model_dump(mode="json", by_alias=True),
        status_code=status.HTTP_200_OK,
        headers={
            "X-Request-Id": x_request_id or "",
            "X-Contract-Version": body.session.contract_version,
            "Cache-Control": "no-store",
        },
    )
