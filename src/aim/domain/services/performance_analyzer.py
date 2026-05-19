"""
T-04: Performance Analysis Engine
────────────────────────────────────────────────────────────────────────────────
Pure algorithm logic — no web framework imports.
Reads from the DB via injected session; never hard-codes student data.

Metrics produced:
  1. Accuracy          = correct / total × 100
  2. Average Speed     = sum(response_times) / count
  3. Retry Rate        = total_retries / total_questions
  4. Hesitation Index  = questions where time > 2× avg_time / total  ⭐ new metric
────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol, Sequence


# ──────────────────────────────────────────────
# Lightweight data transfer object
# (mirrors QuestionAttemptORM without the ORM dependency)
# ──────────────────────────────────────────────

@dataclass(frozen=True)
class AttemptRecord:
    """
    Immutable snapshot of one question attempt.
    The FastAPI layer converts ORM rows → AttemptRecord before calling this module.
    """
    student_id:       int
    skill_id:         str
    question_id:      str
    session_id:       str

    is_correct:       bool
    response_time:    float   # seconds
    attempts:         int     # total tries before final answer
    difficulty:       int     # 1–5

    hint_used:        bool
    skip:             bool
    answer_changed:   bool    # ⭐
    time_of_day:      str     # morning / afternoon / evening / night
    session_position: int     # 1-based position in session


# ──────────────────────────────────────────────
# Repository protocol (Dependency Inversion)
# The real impl lives in /backend; tests inject a fake.
# ──────────────────────────────────────────────

class AttemptRepository(Protocol):
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
        hesitation_index: float,
    ) -> None: ...


# ──────────────────────────────────────────────
# Result dataclass
# ──────────────────────────────────────────────

@dataclass
class PerformanceMetrics:
    student_id:       int
    skill_id:         str
    accuracy:         float   # 0–100
    avg_speed:        float   # seconds
    retry_rate:       float   # 0–1
    hesitation_index: float   # 0–1  ⭐


# ──────────────────────────────────────────────
# Core Engine
# ──────────────────────────────────────────────

class PerformanceAnalyzer:
    """
    Records and analyses every question attempt for a student+skill pair.

    Usage:
        analyzer = PerformanceAnalyzer(repo)
        analyzer.record_attempt(attempt_record)
        metrics  = analyzer.calculate_all_metrics(student_id, skill_id)
    """

    def __init__(self, repo: AttemptRepository) -> None:
        self._repo = repo

    # ── Write ──────────────────────────────────

    def record_attempt(self, attempt: AttemptRecord) -> None:
        """Persist a single attempt."""
        self._repo.save_attempts([attempt])

    def record_session_attempts(self, attempts: Sequence[AttemptRecord]) -> None:
        """Persist all attempts from a session in one batch, then refresh state."""
        if not attempts:
            return

        self._repo.save_attempts(attempts)

        # Refresh metrics in student_skill_states for every unique skill touched
        skills_touched = {(a.student_id, a.skill_id) for a in attempts}
        for student_id, skill_id in skills_touched:
            metrics = self.calculate_all_metrics(student_id, skill_id)
            self._repo.update_skill_state(
                student_id,
                skill_id,
                accuracy=metrics.accuracy,
                avg_speed=metrics.avg_speed,
                retry_rate=metrics.retry_rate,
                hesitation_index=metrics.hesitation_index,
            )

    # ── Read / Calculate ───────────────────────

    def calculate_accuracy(self, student_id: int, skill_id: str) -> float:
        """
        Accuracy = (Correct Answers / Total Answers) × 100
        Returns 0.0 when there are no attempts.
        """
        attempts = self._repo.get_attempts(student_id, skill_id)
        if not attempts:
            return 0.0

        non_skipped = [a for a in attempts if not a.skip]
        if not non_skipped:
            return 0.0

        correct = sum(1 for a in non_skipped if a.is_correct)
        return round((correct / len(non_skipped)) * 100, 2)

    def calculate_avg_speed(self, student_id: int, skill_id: str) -> float:
        """
        Average Response Time = Sum of response times / Total questions
        Returns 0.0 when there are no attempts.
        Skipped questions are excluded (no meaningful response time).
        """
        attempts = self._repo.get_attempts(student_id, skill_id)
        non_skipped = [a for a in attempts if not a.skip]
        if not non_skipped:
            return 0.0

        total_time = sum(a.response_time for a in non_skipped)
        return round(total_time / len(non_skipped), 2)

    def calculate_retry_rate(self, student_id: int, skill_id: str) -> float:
        """
        Retry Rate = Total Retries / Total Questions
        Retries = attempts - 1 per question (first try is not a retry).
        Returns 0.0 when there are no attempts.
        """
        attempts = self._repo.get_attempts(student_id, skill_id)
        non_skipped = [a for a in attempts if not a.skip]
        if not non_skipped:
            return 0.0

        total_retries = sum(max(0, a.attempts - 1) for a in non_skipped)
        return round(total_retries / len(non_skipped), 4)

    def calculate_hesitation_index(self, student_id: int, skill_id: str) -> float:
        """
        ⭐ Hesitation Index = Questions exceeding 2× avg response time / Total

        A high index means the student frequently pauses much longer than
        their own average — a signal of uncertainty or confusion.

        Returns 0.0 when there are fewer than 2 non-skipped attempts.
        """
        attempts = self._repo.get_attempts(student_id, skill_id)
        non_skipped = [a for a in attempts if not a.skip]
        if len(non_skipped) < 2:
            return 0.0

        avg_time = sum(a.response_time for a in non_skipped) / len(non_skipped)
        threshold = avg_time * 2.0
        hesitant_count = sum(1 for a in non_skipped if a.response_time > threshold)
        return round(hesitant_count / len(non_skipped), 4)

    def calculate_all_metrics(self, student_id: int, skill_id: str) -> PerformanceMetrics:
        """Compute and return all four metrics in one call."""
        return PerformanceMetrics(
            student_id=student_id,
            skill_id=skill_id,
            accuracy=self.calculate_accuracy(student_id, skill_id),
            avg_speed=self.calculate_avg_speed(student_id, skill_id),
            retry_rate=self.calculate_retry_rate(student_id, skill_id),
            hesitation_index=self.calculate_hesitation_index(student_id, skill_id),
        )
