"""Performance and behavior analysis for AIM question attempts."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Protocol, Sequence


@dataclass(frozen=True)
class AttemptRecord:
    """Immutable snapshot of one question attempt without ORM dependencies."""

    student_id: int
    skill_id: str
    question_id: str
    session_id: str
    is_correct: bool
    response_time: float
    attempts: int
    difficulty: int
    hint_used: bool
    skip: bool
    answer_changed: bool
    time_of_day: str
    session_position: int


class AttemptRepository(Protocol):
    """Persistence contract required by the pure performance analyzer."""

    def get_attempts(
        self,
        student_id: int,
        skill_id: str,
        limit: int | None = None,
    ) -> Sequence[AttemptRecord]: ...

    def save_attempts(self, attempts: Sequence[AttemptRecord]) -> None: ...

    def update_skill_state(
        self,
        student_id: int,
        skill_id: str,
        *,
        accuracy: float,
        avg_speed: float,
        retry_rate: float,
        hint_usage_rate: float,
        skip_rate: float,
        hesitation_index: float,
        difficulty_performance: float,
        consistency: float,
    ) -> None: ...


@dataclass(frozen=True)
class PerformanceMetrics:
    """Session and historical behavior metrics for a student-skill pair."""

    student_id: int
    skill_id: str
    accuracy: float
    avg_speed: float
    retry_rate: float
    hint_usage_rate: float
    skip_rate: float
    hesitation_index: float
    difficulty_performance: float
    consistency: float


class PerformanceAnalyzer:
    """Records and analyzes attempts while keeping speed behavioral only."""

    CONSISTENCY_WINDOW = 10

    def __init__(self, repo: AttemptRepository) -> None:
        self._repo = repo

    def record_attempt(self, attempt: AttemptRecord) -> None:
        """Persist a single attempt."""
        self._repo.save_attempts([attempt])

    def record_session_attempts(self, attempts: Sequence[AttemptRecord]) -> None:
        """Persist a session and refresh stored behavior metrics per skill."""
        if not attempts:
            return

        self._repo.save_attempts(attempts)

        # Refresh metrics in student_skill_states for every unique skill touched.
        skills_touched = {(attempt.student_id, attempt.skill_id) for attempt in attempts}
        for student_id, skill_id in skills_touched:
            metrics = self.calculate_all_metrics(student_id, skill_id)
            update_values = {
                "accuracy": metrics.accuracy,
                "avg_speed": metrics.avg_speed,
                "retry_rate": metrics.retry_rate,
                "hint_usage_rate": metrics.hint_usage_rate,
                "skip_rate": metrics.skip_rate,
                "hesitation_index": metrics.hesitation_index,
                "difficulty_performance": metrics.difficulty_performance,
                "consistency": metrics.consistency,
            }
            try:
                self._repo.update_skill_state(student_id, skill_id, **update_values)
            except TypeError:
                legacy_values = {
                    key: update_values[key]
                    for key in ("accuracy", "avg_speed", "retry_rate", "hesitation_index")
                }
                self._repo.update_skill_state(student_id, skill_id, **legacy_values)

    def calculate_accuracy(self, student_id: int, skill_id: str) -> float:
        """Calculate non-skipped correctness as a 0-100 percentage."""
        non_skipped = self._non_skipped(student_id, skill_id)
        if not non_skipped:
            return 0.0

        correct = sum(1 for attempt in non_skipped if attempt.is_correct)
        return round((correct / len(non_skipped)) * 100.0, 2)

    def calculate_avg_speed(self, student_id: int, skill_id: str) -> float:
        """Calculate average response time as a behavior/session metric only."""
        non_skipped = self._non_skipped(student_id, skill_id)
        if not non_skipped:
            return 0.0

        total_time = sum(attempt.response_time for attempt in non_skipped)
        return round(total_time / len(non_skipped), 2)

    def calculate_retry_rate(self, student_id: int, skill_id: str) -> float:
        """Calculate average retries per non-skipped attempt."""
        non_skipped = self._non_skipped(student_id, skill_id)
        if not non_skipped:
            return 0.0

        retries = sum(max(0, attempt.attempts - 1) for attempt in non_skipped)
        return round(retries / len(non_skipped), 4)

    def calculate_hint_usage_rate(self, student_id: int, skill_id: str) -> float:
        """Calculate hinted non-skipped attempts divided by non-skipped attempts."""
        non_skipped = self._non_skipped(student_id, skill_id)
        if not non_skipped:
            return 0.0

        hinted = sum(1 for attempt in non_skipped if attempt.hint_used)
        return round(hinted / len(non_skipped), 4)

    def calculate_skip_rate(self, student_id: int, skill_id: str) -> float:
        """Calculate skipped attempts divided by all attempts."""
        attempts = list(self._repo.get_attempts(student_id, skill_id))
        if not attempts:
            return 0.0

        skipped = sum(1 for attempt in attempts if attempt.skip)
        return round(skipped / len(attempts), 4)

    def calculate_hesitation_index(self, student_id: int, skill_id: str) -> float:
        """Calculate unusually long answers as a behavior signal only."""
        non_skipped = self._non_skipped(student_id, skill_id)
        if len(non_skipped) < 2:
            return 0.0

        avg_time = sum(attempt.response_time for attempt in non_skipped) / len(non_skipped)
        threshold = avg_time * 2.0
        hesitant = sum(1 for attempt in non_skipped if attempt.response_time > threshold)
        return round(hesitant / len(non_skipped), 4)

    def calculate_difficulty_performance(self, student_id: int, skill_id: str) -> float:
        """Calculate difficulty-weighted correctness without using speed."""
        non_skipped = self._non_skipped(student_id, skill_id)
        if not non_skipped:
            return 0.0

        weighted_correct = sum(
            attempt.difficulty for attempt in non_skipped if attempt.is_correct
        )
        max_possible = sum(attempt.difficulty for attempt in non_skipped)
        if max_possible <= 0:
            return 0.0

        return round((weighted_correct / max_possible) * 100.0, 2)

    def calculate_consistency(self, student_id: int, skill_id: str) -> float:
        """Calculate correctness stability over the latest attempts."""
        window = self._non_skipped(student_id, skill_id)[-self.CONSISTENCY_WINDOW :]
        if len(window) < 2:
            return 100.0

        values = [1.0 if attempt.is_correct else 0.0 for attempt in window]
        mean = sum(values) / len(values)
        variance = sum((value - mean) ** 2 for value in values) / len(values)
        normalized_std = math.sqrt(variance) * 200.0
        return round(max(0.0, 100.0 - normalized_std), 2)

    def calculate_all_metrics(self, student_id: int, skill_id: str) -> PerformanceMetrics:
        """Compute all performance and behavior metrics in one call."""
        return PerformanceMetrics(
            student_id=student_id,
            skill_id=skill_id,
            accuracy=self.calculate_accuracy(student_id, skill_id),
            avg_speed=self.calculate_avg_speed(student_id, skill_id),
            retry_rate=self.calculate_retry_rate(student_id, skill_id),
            hint_usage_rate=self.calculate_hint_usage_rate(student_id, skill_id),
            skip_rate=self.calculate_skip_rate(student_id, skill_id),
            hesitation_index=self.calculate_hesitation_index(student_id, skill_id),
            difficulty_performance=self.calculate_difficulty_performance(
                student_id,
                skill_id,
            ),
            consistency=self.calculate_consistency(student_id, skill_id),
        )

    def _non_skipped(self, student_id: int, skill_id: str) -> list[AttemptRecord]:
        """Return valid answer attempts for performance and mastery evidence."""
        return [
            attempt
            for attempt in self._repo.get_attempts(student_id, skill_id)
            if not attempt.skip
        ]
