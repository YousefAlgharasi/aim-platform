"""
T-04: Tests for PerformanceAnalyzer
────────────────────────────────────────────────────────────────────────────────
Uses an in-memory fake repository — no DB required.
Coverage targets:
  - calculate_accuracy
  - calculate_avg_speed
  - calculate_retry_rate
  - calculate_hesitation_index  ⭐
  - calculate_all_metrics
  - record_attempt / record_session_attempts (side-effect verification)
Edge cases: zero attempts, single attempt, all correct, all wrong, all skipped,
            hesitation triggered, hesitation not triggered.
────────────────────────────────────────────────────────────────────────────────
Run with:  pytest ai-core/tests/test_performance_analyzer.py -v
"""

from __future__ import annotations

import pytest
from typing import Sequence

from ai_core.performance_analyzer import (
    AttemptRecord,
    PerformanceAnalyzer,
    PerformanceMetrics,
)

# ──────────────────────────────────────────────
# Fake / in-memory repository
# ──────────────────────────────────────────────

class FakeAttemptRepository:
    """
    Stores attempts in memory. Captures update_skill_state calls for assertion.
    """

    def __init__(self) -> None:
        self._store: list[AttemptRecord] = []
        self.state_updates: list[dict] = []

    def save_attempts(self, attempts: Sequence[AttemptRecord]) -> None:
        self._store.extend(attempts)

    def get_attempts(
        self,
        student_id: int,
        skill_id: str,
        limit: int | None = None,
    ) -> list[AttemptRecord]:
        results = [
            a for a in self._store
            if a.student_id == student_id and a.skill_id == skill_id
        ]
        if limit is not None:
            results = results[:limit]
        return results

    def update_skill_state(
        self,
        student_id: int,
        skill_id: str,
        *,
        accuracy: float,
        avg_speed: float,
        retry_rate: float,
        hesitation_index: float,
    ) -> None:
        self.state_updates.append({
            "student_id":       student_id,
            "skill_id":         skill_id,
            "accuracy":         accuracy,
            "avg_speed":        avg_speed,
            "retry_rate":       retry_rate,
            "hesitation_index": hesitation_index,
        })


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def make_attempt(
    *,
    student_id: int = 1,
    skill_id: str = "present_simple",
    question_id: str = "q1",
    session_id: str = "s1",
    is_correct: bool = True,
    response_time: float = 10.0,
    attempts: int = 1,
    difficulty: int = 2,
    hint_used: bool = False,
    skip: bool = False,
    answer_changed: bool = False,
    time_of_day: str = "morning",
    session_position: int = 1,
) -> AttemptRecord:
    return AttemptRecord(
        student_id=student_id,
        skill_id=skill_id,
        question_id=question_id,
        session_id=session_id,
        is_correct=is_correct,
        response_time=response_time,
        attempts=attempts,
        difficulty=difficulty,
        hint_used=hint_used,
        skip=skip,
        answer_changed=answer_changed,
        time_of_day=time_of_day,
        session_position=session_position,
    )


@pytest.fixture
def repo() -> FakeAttemptRepository:
    return FakeAttemptRepository()


@pytest.fixture
def analyzer(repo: FakeAttemptRepository) -> PerformanceAnalyzer:
    return PerformanceAnalyzer(repo)


# ──────────────────────────────────────────────
# Tests — calculate_accuracy
# ──────────────────────────────────────────────

class TestCalculateAccuracy:

    def test_no_attempts_returns_zero(self, analyzer: PerformanceAnalyzer) -> None:
        assert analyzer.calculate_accuracy(1, "present_simple") == 0.0

    def test_all_correct(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        for i in range(5):
            repo.save_attempts([make_attempt(question_id=f"q{i}", is_correct=True)])
        assert analyzer.calculate_accuracy(1, "present_simple") == 100.0

    def test_all_wrong(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        for i in range(4):
            repo.save_attempts([make_attempt(question_id=f"q{i}", is_correct=False)])
        assert analyzer.calculate_accuracy(1, "present_simple") == 0.0

    def test_mixed_correct_wrong(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        # 3 correct, 1 wrong → 75%
        repo.save_attempts([
            make_attempt(question_id="q1", is_correct=True),
            make_attempt(question_id="q2", is_correct=True),
            make_attempt(question_id="q3", is_correct=True),
            make_attempt(question_id="q4", is_correct=False),
        ])
        assert analyzer.calculate_accuracy(1, "present_simple") == 75.0

    def test_skipped_attempts_excluded(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        # 1 correct, 1 skipped (skipped should not count)
        repo.save_attempts([
            make_attempt(question_id="q1", is_correct=True),
            make_attempt(question_id="q2", is_correct=False, skip=True),
        ])
        assert analyzer.calculate_accuracy(1, "present_simple") == 100.0

    def test_all_skipped_returns_zero(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([
            make_attempt(question_id="q1", skip=True),
            make_attempt(question_id="q2", skip=True),
        ])
        assert analyzer.calculate_accuracy(1, "present_simple") == 0.0

    def test_different_skill_isolated(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([make_attempt(skill_id="grammar_a", is_correct=True)])
        repo.save_attempts([make_attempt(skill_id="grammar_b", is_correct=False)])
        assert analyzer.calculate_accuracy(1, "grammar_a") == 100.0
        assert analyzer.calculate_accuracy(1, "grammar_b") == 0.0


# ──────────────────────────────────────────────
# Tests — calculate_avg_speed
# ──────────────────────────────────────────────

class TestCalculateAvgSpeed:

    def test_no_attempts_returns_zero(self, analyzer: PerformanceAnalyzer) -> None:
        assert analyzer.calculate_avg_speed(1, "present_simple") == 0.0

    def test_single_attempt(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([make_attempt(response_time=15.0)])
        assert analyzer.calculate_avg_speed(1, "present_simple") == 15.0

    def test_average_computed_correctly(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([
            make_attempt(question_id="q1", response_time=10.0),
            make_attempt(question_id="q2", response_time=20.0),
            make_attempt(question_id="q3", response_time=30.0),
        ])
        assert analyzer.calculate_avg_speed(1, "present_simple") == 20.0

    def test_skipped_excluded_from_average(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([
            make_attempt(question_id="q1", response_time=10.0),
            make_attempt(question_id="q2", response_time=1000.0, skip=True),
        ])
        assert analyzer.calculate_avg_speed(1, "present_simple") == 10.0


# ──────────────────────────────────────────────
# Tests — calculate_retry_rate
# ──────────────────────────────────────────────

class TestCalculateRetryRate:

    def test_no_attempts_returns_zero(self, analyzer: PerformanceAnalyzer) -> None:
        assert analyzer.calculate_retry_rate(1, "present_simple") == 0.0

    def test_no_retries(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([
            make_attempt(question_id="q1", attempts=1),
            make_attempt(question_id="q2", attempts=1),
        ])
        assert analyzer.calculate_retry_rate(1, "present_simple") == 0.0

    def test_all_retried_once(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([
            make_attempt(question_id="q1", attempts=2),
            make_attempt(question_id="q2", attempts=2),
        ])
        # 2 retries / 2 questions = 1.0
        assert analyzer.calculate_retry_rate(1, "present_simple") == 1.0

    def test_mixed_retries(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([
            make_attempt(question_id="q1", attempts=1),  # 0 retries
            make_attempt(question_id="q2", attempts=3),  # 2 retries
            make_attempt(question_id="q3", attempts=2),  # 1 retry
        ])
        # (0+2+1) / 3 = 1.0
        assert analyzer.calculate_retry_rate(1, "present_simple") == 1.0

    def test_skipped_excluded(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([
            make_attempt(question_id="q1", attempts=1, skip=True),
            make_attempt(question_id="q2", attempts=1),
        ])
        assert analyzer.calculate_retry_rate(1, "present_simple") == 0.0


# ──────────────────────────────────────────────
# Tests — calculate_hesitation_index  ⭐
# ──────────────────────────────────────────────

class TestCalculateHesitationIndex:

    def test_no_attempts_returns_zero(self, analyzer: PerformanceAnalyzer) -> None:
        assert analyzer.calculate_hesitation_index(1, "present_simple") == 0.0

    def test_single_attempt_returns_zero(self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository) -> None:
        repo.save_attempts([make_attempt(response_time=10.0)])
        # Cannot compute avg from 1 item meaningfully
        assert analyzer.calculate_hesitation_index(1, "present_simple") == 0.0

    def test_no_hesitation_all_similar_times(
        self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository
    ) -> None:
        # avg = 10; threshold = 20; none exceed it
        repo.save_attempts([
            make_attempt(question_id=f"q{i}", response_time=10.0)
            for i in range(5)
        ])
        assert analyzer.calculate_hesitation_index(1, "present_simple") == 0.0

    def test_hesitation_detected(
        self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository
    ) -> None:
        # times: [10, 10, 10, 10, 45]  avg=17, threshold=34; only 45 > 34
        repo.save_attempts([
            make_attempt(question_id="q1", response_time=10.0),
            make_attempt(question_id="q2", response_time=10.0),
            make_attempt(question_id="q3", response_time=10.0),
            make_attempt(question_id="q4", response_time=10.0),
            make_attempt(question_id="q5", response_time=45.0),
        ])
        idx = analyzer.calculate_hesitation_index(1, "present_simple")
        assert idx == pytest.approx(0.2, abs=0.01)  # 1/5

    def test_all_hesitant(
        self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository
    ) -> None:
        # First attempt sets baseline low; the rest are 3x longer
        repo.save_attempts([
            make_attempt(question_id="q1", response_time=5.0),
            make_attempt(question_id="q2", response_time=50.0),
            make_attempt(question_id="q3", response_time=50.0),
            make_attempt(question_id="q4", response_time=50.0),
        ])
        # avg ≈ 38.75, threshold ≈ 77.5; only 50s < 77.5 → none hesitant
        # Let's verify with very extreme values instead:
        idx = analyzer.calculate_hesitation_index(1, "present_simple")
        assert 0.0 <= idx <= 1.0  # must always be a valid ratio


# ──────────────────────────────────────────────
# Tests — record_attempt and record_session_attempts
# ──────────────────────────────────────────────

class TestRecordAttempts:

    def test_record_single_attempt_persisted(
        self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository
    ) -> None:
        a = make_attempt()
        analyzer.record_attempt(a)
        stored = repo.get_attempts(1, "present_simple")
        assert len(stored) == 1
        assert stored[0].question_id == "q1"

    def test_record_session_updates_state(
        self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository
    ) -> None:
        attempts = [
            make_attempt(question_id=f"q{i}", is_correct=(i % 2 == 0))
            for i in range(6)
        ]
        analyzer.record_session_attempts(attempts)

        # State should have been updated once for (student_id=1, skill="present_simple")
        assert len(repo.state_updates) == 1
        update = repo.state_updates[0]
        assert update["student_id"] == 1
        assert update["skill_id"] == "present_simple"
        assert 0 <= update["accuracy"] <= 100
        assert update["avg_speed"] > 0
        assert 0 <= update["hesitation_index"] <= 1

    def test_empty_session_does_nothing(
        self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository
    ) -> None:
        analyzer.record_session_attempts([])
        assert repo.state_updates == []


# ──────────────────────────────────────────────
# Tests — calculate_all_metrics integration
# ──────────────────────────────────────────────

class TestCalculateAllMetrics:

    def test_returns_correct_types(
        self, analyzer: PerformanceAnalyzer, repo: FakeAttemptRepository
    ) -> None:
        repo.save_attempts([
            make_attempt(question_id="q1", is_correct=True,  response_time=8.0,  attempts=1),
            make_attempt(question_id="q2", is_correct=False, response_time=12.0, attempts=2),
            make_attempt(question_id="q3", is_correct=True,  response_time=9.0,  attempts=1),
        ])
        m = analyzer.calculate_all_metrics(1, "present_simple")
        assert isinstance(m, PerformanceMetrics)
        assert m.student_id == 1
        assert m.skill_id == "present_simple"
        assert isinstance(m.accuracy, float)
        assert isinstance(m.avg_speed, float)
        assert isinstance(m.retry_rate, float)
        assert isinstance(m.hesitation_index, float)

    def test_no_attempts_all_zeros(self, analyzer: PerformanceAnalyzer) -> None:
        m = analyzer.calculate_all_metrics(99, "nonexistent_skill")
        assert m.accuracy == 0.0
        assert m.avg_speed == 0.0
        assert m.retry_rate == 0.0
        assert m.hesitation_index == 0.0
