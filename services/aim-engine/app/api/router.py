"""Top-level API router for AIM Engine."""

from fastapi import APIRouter

from app.api.system import router as system_router

api_router = APIRouter()
api_router.include_router(system_router)
