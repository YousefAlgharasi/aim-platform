"""Compatibility wrapper for recommendation repositories."""

from __future__ import annotations

from aim.infrastructure.repositories.recommendations import (
    SQLRecommendationContextProvider,
    SQLRecommendationLogger,
)

__all__ = ["SQLRecommendationContextProvider", "SQLRecommendationLogger"]

