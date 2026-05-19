"""Compatibility exports for recommendation ORM models and schemas."""

from __future__ import annotations

from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.presentation.api.schemas.recommendations import RecommendationRead

__all__ = ["RecommendationLogORM", "RecommendationRead"]

