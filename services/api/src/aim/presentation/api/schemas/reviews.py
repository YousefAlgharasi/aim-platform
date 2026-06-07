"""Review API schemas."""

from __future__ import annotations

from pydantic import BaseModel


class DueReviewRead(BaseModel):
    student_id: int
    skill_id: str
    retention: float
    retention_lambda: float
    days_since_review: float
    is_due: bool

