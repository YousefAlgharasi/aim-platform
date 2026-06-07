"""Compatibility entrypoint for `uvicorn backend.main:app --reload`."""

from __future__ import annotations

from aim.presentation.api.app import app

__all__ = ["app"]

