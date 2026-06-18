"""Top-level API router for AIM Engine."""

from fastapi import APIRouter

from app.api.analysis import router as analysis_router
from app.api.system import router as system_router

api_router = APIRouter()
api_router.include_router(system_router)
# P5-020: POST /aim/v1/analysis — backend-internal, service-token protected.
api_router.include_router(analysis_router)
