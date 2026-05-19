"""
T-08: Retention System with Personalized Forgetting Rate

Implements the forgetting curve:

    Retention(t) = InitialMastery * e^(-lambda * t)

The project stores mastery and retention as 0-100 percentages, so the review
threshold is 70.0 rather than 0.70.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Protocol, Sequence


REVIEW_THRESHOLD = 70.0
DEFAULT_GRAMMAR_LAMBDA = 0.10
DEFAULT_VOCABULARY_LAMBDA = 0.20
DEFAULT_OTHER_LAMBDA = 0.15


@dataclass(frozen=True)
class RetentionSkillState:
    student_id: int
    skill_id: str
    mastery: float
    retention: float
    retention_lambda: float | None
    last_reviewed_at: datetime | None
    category: str | None = None
    retention_history: Sequence[dict[str, Any]] | None = None


@dataclass(frozen=True)
class RetentionResult:
    student_id: int
    skill_id: str
    retention: float
    retention_lambda: float
    days_since_review: float
    is_due: bool


class RetentionRepository(Protocol):
    def get_skill_state(
        self,
        student_id: int,
        skill_id: str,
    ) -> RetentionSkillState | None: ...

    def get_student_skill_states(
        self,
        student_id: int,
    ) -> Sequence[RetentionSkillState]: ...

    def update_retention(
        self,
        student_id: int,
        skill_id: str,
        retention: float,
        is_due: bool,
    ) -> None: ...

    def update_lambda(
        self,
        student_id: int,
        skill_id: str,
        retention_lambda: float,
        retention_history: Sequence[dict[str, Any]],
    ) -> None: ...


class RetentionTracker:
    """
    Calculates retention, review due status, and personalized lambda values.
    """

    def __init__(
        self,
        repository: RetentionRepository,
        *,
        now: datetime | None = None,
    ) -> None:
        self._repo = repository
        self._now = now

    def calculate_current_retention(
        self,
        student_id: int,
        skill_id: str,
    ) -> RetentionResult:
        state = self._repo.get_skill_state(student_id, skill_id)
        if state is None:
            raise KeyError(
                f"No retention state for student {student_id}, skill '{skill_id}'"
            )

        retention_lambda = self._lambda_for_state(state)
        days = self._days_since_review(state.last_reviewed_at)
        initial_mastery = self._clamp_percent(state.mastery)
        retention = round(initial_mastery * math.exp(-retention_lambda * days), 2)
        retention = self._clamp_percent(retention)
        is_due = retention < REVIEW_THRESHOLD

        self._repo.update_retention(student_id, skill_id, retention, is_due)

        return RetentionResult(
            student_id=student_id,
            skill_id=skill_id,
            retention=retention,
            retention_lambda=retention_lambda,
            days_since_review=round(days, 4),
            is_due=is_due,
        )

    def get_skills_due_for_review(self, student_id: int) -> list[RetentionResult]:
        due = []
        for state in self._repo.get_student_skill_states(student_id):
            result = self.calculate_current_retention(student_id, state.skill_id)
            if result.is_due:
                due.append(result)
        return sorted(due, key=lambda r: r.retention)

    def update_lambda(
        self,
        student_id: int,
        skill_id: str,
        new_mastery_reading: float,
        *,
        reading_time: datetime | None = None,
    ) -> float:
        state = self._repo.get_skill_state(student_id, skill_id)
        if state is None:
            raise KeyError(
                f"No retention state for student {student_id}, skill '{skill_id}'"
            )

        reading_time = reading_time or self._current_time()
        history = list(state.retention_history or [])
        history.append(
            {
                "timestamp": reading_time.isoformat(),
                "mastery": self._clamp_percent(new_mastery_reading),
            }
        )

        if len(history) >= 3:
            retention_lambda = self._fit_lambda(history)
        else:
            retention_lambda = self._lambda_for_state(state)

        self._repo.update_lambda(
            student_id,
            skill_id,
            retention_lambda,
            history,
        )
        return retention_lambda

    def _lambda_for_state(self, state: RetentionSkillState) -> float:
        if state.retention_lambda is not None and state.retention_lambda > 0:
            return state.retention_lambda
        return self.default_lambda_for_category(state.category)

    @staticmethod
    def default_lambda_for_category(category: str | None) -> float:
        if category and category.lower() == "grammar":
            return DEFAULT_GRAMMAR_LAMBDA
        if category and category.lower() == "vocabulary":
            return DEFAULT_VOCABULARY_LAMBDA
        return DEFAULT_OTHER_LAMBDA

    def _fit_lambda(self, history: Sequence[dict[str, Any]]) -> float:
        points = []
        parsed = sorted(
            (
                (datetime.fromisoformat(str(item["timestamp"])), float(item["mastery"]))
                for item in history
                if float(item.get("mastery", 0.0)) > 0.0
            ),
            key=lambda item: item[0],
        )
        if len(parsed) < 3:
            return DEFAULT_OTHER_LAMBDA

        start_time, initial_mastery = parsed[0]
        if initial_mastery <= 0.0:
            return DEFAULT_OTHER_LAMBDA

        for timestamp, mastery in parsed[1:]:
            days = (timestamp - start_time).total_seconds() / 86400.0
            if days <= 0 or mastery <= 0.0:
                continue
            # ln(M_t / M_0) = -lambda * t
            points.append((days, math.log(mastery / initial_mastery)))

        if not points:
            return DEFAULT_OTHER_LAMBDA

        denominator = sum(days * days for days, _ in points)
        if denominator == 0.0:
            return DEFAULT_OTHER_LAMBDA

        slope = sum(days * ln_ratio for days, ln_ratio in points) / denominator
        fitted_lambda = max(0.001, -slope)
        return round(fitted_lambda, 4)

    def _days_since_review(self, last_reviewed_at: datetime | None) -> float:
        if last_reviewed_at is None:
            return 0.0
        seconds = max(0.0, (self._current_time() - last_reviewed_at).total_seconds())
        return seconds / 86400.0

    def _current_time(self) -> datetime:
        return self._now or datetime.utcnow()

    @staticmethod
    def _clamp_percent(value: float) -> float:
        return max(0.0, min(100.0, float(value)))
