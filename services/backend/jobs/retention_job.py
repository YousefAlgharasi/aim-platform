"""Compatibility wrapper for retention scheduler."""

from __future__ import annotations

from aim.infrastructure.scheduler.retention import (
    run_retention_review_job,
    start_retention_scheduler,
)

__all__ = ["run_retention_review_job", "start_retention_scheduler"]

