"""Application entrypoint for the AIM Engine service skeleton."""

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import AimEngineSettings, get_settings
from app.core.service_info import SERVICE_PHASE, SERVICE_VERSION
from app.pipeline.aim_analysis_pipeline import AimAnalysisPipelineEntrypoint  # P5-023


def create_app(settings: AimEngineSettings | None = None) -> FastAPI:
    """Create and configure the FastAPI application.

    P1-026 intentionally creates only the service shell. Health/version endpoints
    are added separately in P1-027.
    """
    resolved_settings = settings or get_settings()

    app = FastAPI(
        title=resolved_settings.app_name,
        version=SERVICE_VERSION,
        description=(
            "AIM Engine service skeleton. Adaptive-learning algorithms are intentionally "
            "not implemented in P1-026."
        ),
        docs_url="/docs" if resolved_settings.enable_docs else None,
        redoc_url="/redoc" if resolved_settings.enable_docs else None,
        openapi_url="/openapi.json" if resolved_settings.enable_docs else None,
    )

    app.state.service_phase = SERVICE_PHASE
    app.state.settings = resolved_settings
    # P5-023: inject the analysis pipeline entrypoint so the P5-020 route
    # can delegate to it via app.state.aim_pipeline.
    app.state.aim_pipeline = AimAnalysisPipelineEntrypoint()
    app.include_router(api_router)

    return app


app = create_app()
