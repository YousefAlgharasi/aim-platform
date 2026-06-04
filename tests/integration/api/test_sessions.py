from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.error_pattern import ErrorPatternRecordORM
from aim.infrastructure.database.models.goal import MicroGoalORM
from aim.infrastructure.database.models.learning_history import LessonAttemptORM
from aim.infrastructure.database.models.mastery_history import SkillMasteryHistoryORM
from aim.infrastructure.database.models.outcome_record import OutcomeRecordORM
from aim.infrastructure.database.models.prerequisite_gap import PrerequisiteGapRecordORM
from aim.infrastructure.database.models.prompt_adaptation import (
    PromptAdaptationInstructionORM,
)
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.infrastructure.database.models.retention_schedule import RetentionScheduleORM
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
from aim.infrastructure.database.models.weakness import WeaknessRecordORM
import aim.presentation.api.routers.sessions as sessions_router
from aim.presentation.api.routers.sessions import router


engine_test = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_test,
)


def override_get_db():
    db: Session = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    yield


@pytest.fixture
def client() -> TestClient:
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[sessions_router.get_db] = override_get_db
    return TestClient(app)


def seed_student() -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(name="Session Student", email="session@test.com")
        db.add(student)
        db.commit()
        db.refresh(student)
        return student.id
    finally:
        db.close()


def seed_student_with_skill_state(
    *,
    mastery: float,
    avg_speed: float,
    confidence: float = 0.0,
    current_difficulty: int = 1,
    skill_id: str = "GRAMMAR_VERB_FORMS",
) -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(name="Frustrated Student", email="frustrated@test.com")
        db.add(student)
        db.commit()
        db.refresh(student)
        db.add(
            StudentSkillStateORM(
                student_id=student.id,
                skill_id=skill_id,
                mastery=mastery,
                confidence=confidence,
                avg_speed=avg_speed,
                current_difficulty=current_difficulty,
                retention=100.0,
            )
        )
        db.commit()
        return student.id
    finally:
        db.close()


def attempt_payload(student_id: int, *, session_id: str = "session-1") -> dict:
    return {
        "student_id": student_id,
        "skill_id": "GRAMMAR_VERB_FORMS",
        "question_id": "q1",
        "session_id": session_id,
        "is_correct": True,
        "response_time": 8.0,
        "attempts": 1,
        "difficulty": 2,
        "hint_used": False,
        "skip": False,
        "answer_changed": False,
        "time_of_day": "morning",
        "session_position": 1,
    }


class TestRecordSessionAttempts:
    def test_empty_payload_returns_400(self, client: TestClient) -> None:
        resp = client.post("/sessions/session-1/attempts", json={"attempts": []})

        assert resp.status_code == 400

    def test_mismatched_session_id_returns_422(self, client: TestClient) -> None:
        student_id = seed_student()
        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": [attempt_payload(student_id, session_id="other")]},
        )

        assert resp.status_code == 422

    def test_records_attempts_updates_metrics_and_refreshes_goals(
        self,
        client: TestClient,
    ) -> None:
        student_id = seed_student()
        second = attempt_payload(student_id)
        second["question_id"] = "q2"
        second["is_correct"] = False
        second["session_position"] = 2

        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": [attempt_payload(student_id), second]},
        )

        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert data["attempts_saved"] == 2
        assert data["metrics_updated"][0]["accuracy"] == 50.0
        assert data["performance_metrics"]["accuracy"] == 50.0
        assert data["mastery_result"]["mastery"] == pytest.approx(9.61, abs=0.1)
        assert data["mastery_result"]["reliability"] == pytest.approx(0.2)
        assert "speed_score" not in data["mastery_result"]
        assert data["weakness_result"]["weakness_score"] == pytest.approx(12.5)
        assert data["error_pattern"]["pattern_type"] == "unknown"
        assert data["frustration_score"] == pytest.approx(30.0)
        assert data["retention_result"]["retention"] == pytest.approx(
            data["mastery_result"]["mastery"],
            abs=0.1,
        )
        assert data["difficulty_decision"]["target_difficulty"] == 1
        assert data["recommendation"]["action"] == data["decision_conflict"]["selected_action"]
        assert data["recommendation"]["action_type"] in {
            "spaced_review",
            "collect_more_evidence",
        }
        assert data["prompt_adaptation_instruction"]["lesson_id"] == "session-1"
        assert len(data["adaptive_results"]) == 1
        assert len(data["lesson_attempts"]) == 1
        assert data["lesson_attempts"][0]["lesson_id"] == "session-1"
        assert data["lesson_attempts"][0]["score"] == 50.0

        db = TestingSessionLocal()
        try:
            assert db.query(QuestionAttemptORM).count() == 2
            state = db.query(StudentSkillStateORM).first()
            assert state is not None
            assert state.skill_id == "GRAMMAR_VERB_FORMS"
            assert state.mastery != data["metrics_updated"][0]["accuracy"]
            assert state.mastery == pytest.approx(9.61, abs=0.1)
            assert state.retry_rate == pytest.approx(0.0)
            assert state.weakness_score == pytest.approx(12.5)
            assert state.frustration_score == pytest.approx(30.0)
            assert state.consistency == pytest.approx(0.0)
            assert state.current_difficulty == 1
            assert state.retention == pytest.approx(state.mastery, abs=0.1)
            assert state.last_reviewed_at is not None
            assert state.review_due is True
            assert len(state.retention_history) == 1
            history = db.query(SkillMasteryHistoryORM).one()
            assert history.student_id == student_id
            assert history.skill_id == "GRAMMAR_VERB_FORMS"
            assert history.mastery == pytest.approx(state.mastery, abs=0.1)
            assert history.accuracy == 50.0
            assert history.speed_score == 0.0
            assert history.reliability == pytest.approx(0.2)
            assert history.evidence_quality_score > 0.0
            assert history.consistency == 0.0
            assert history.retention == 100.0
            assert history.difficulty_performance == 50.0
            weakness = db.query(WeaknessRecordORM).one()
            assert weakness.student_id == student_id
            assert weakness.skill_id == "GRAMMAR_VERB_FORMS"
            assert weakness.weakness_score == pytest.approx(12.5)
            assert weakness.error_frequency == pytest.approx(0.5)
            assert weakness.difficulty_weight == pytest.approx(40.0)
            assert weakness.repeated_mistakes == 1
            error_pattern = db.query(ErrorPatternRecordORM).one()
            assert error_pattern.student_id == student_id
            assert error_pattern.skill_id == "GRAMMAR_VERB_FORMS"
            assert error_pattern.pattern_type == "unknown"
            assert error_pattern.evidence_json["accuracy"] == 50.0
            schedule = db.query(RetentionScheduleORM).one()
            assert schedule.student_id == student_id
            assert schedule.skill_id == "GRAMMAR_VERB_FORMS"
            assert schedule.retention == pytest.approx(state.retention, abs=0.1)
            assert schedule.retention_lambda == pytest.approx(state.retention_lambda)
            assert schedule.review_priority == pytest.approx(100.0 - state.retention, abs=0.1)
            assert schedule.completed_at is None
            assert schedule.due_at is not None
            recommendation = db.query(RecommendationLogORM).one()
            assert recommendation.student_id == student_id
            assert recommendation.action_type in {
                "spaced_review",
                "collect_more_evidence",
            }
            assert recommendation.inputs_snapshot["retention"] == pytest.approx(
                state.retention,
                abs=0.1,
            )
            prompt = db.query(PromptAdaptationInstructionORM).one()
            assert prompt.student_id == student_id
            assert prompt.lesson_id == "session-1"
            assert prompt.skill_id == "GRAMMAR_VERB_FORMS"
            assert prompt.difficulty == "current"
            assert "Collect reliable evidence" in prompt.micro_goal
            lesson = db.query(LessonAttemptORM).one()
            assert lesson.student_id == student_id
            assert lesson.lesson_id == "session-1"
            assert lesson.course_id is None
            assert lesson.completed is True
            assert lesson.early_exit is False
            assert lesson.score == 50.0
            assert lesson.frustration_score == pytest.approx(30.0)
            assert lesson.recommendation_id == recommendation.id
            assert db.query(MicroGoalORM).filter(MicroGoalORM.is_active.is_(True)).count() == 3
        finally:
            db.close()

    def test_logs_prerequisite_gap_and_recommends_fill_gaps_first(
        self,
        client: TestClient,
    ) -> None:
        db = TestingSessionLocal()
        try:
            student = StudentORM(name="Gap Student", email="gap@test.com")
            db.add(student)
            db.commit()
            db.refresh(student)
            db.add_all(
                [
                    StudentSkillStateORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_PASSIVE_VOICE",
                        mastery=75.0,
                        confidence=75.0,
                        consistency=90.0,
                        current_difficulty=3,
                        retention=100.0,
                    ),
                    StudentSkillStateORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_TO_BE",
                        mastery=40.0,
                        confidence=40.0,
                    ),
                    StudentSkillStateORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_PAST_PARTICIPLE",
                        mastery=90.0,
                    ),
                    StudentSkillStateORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_TENSES_PRESENT_SIMPLE",
                        mastery=90.0,
                    ),
                    StudentSkillStateORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_TENSES_PAST_SIMPLE",
                        mastery=90.0,
                    ),
                ]
            )
            db.commit()
            student_id = student.id
        finally:
            db.close()

        attempts = []
        for index in range(1, 11):
            payload = attempt_payload(student_id, session_id="session-gap")
            payload["skill_id"] = "GRAMMAR_PASSIVE_VOICE"
            payload["question_id"] = f"passive:q{index}"
            payload["difficulty"] = 3
            payload["session_position"] = index
            attempts.append(payload)

        resp = client.post(
            "/sessions/session-gap/attempts",
            json={"attempts": attempts},
        )

        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert data["recommendation"]["action_type"] == "review_prerequisite"
        assert data["recommendation"]["skill_id"] == "GRAMMAR_TO_BE"
        assert data["prerequisite_gaps"][0]["missing_prerequisite_skill_id"] == "GRAMMAR_TO_BE"

        db = TestingSessionLocal()
        try:
            gap = db.query(PrerequisiteGapRecordORM).one()
            assert gap.student_id == student_id
            assert gap.skill_id == "GRAMMAR_PASSIVE_VOICE"
            assert gap.missing_prerequisite_skill_id == "GRAMMAR_TO_BE"
            assert gap.severity == pytest.approx(30.0)
            assert gap.status == "open"
            recommendation = db.query(RecommendationLogORM).one()
            assert recommendation.action_type == "review_prerequisite"
            assert recommendation.inputs_snapshot["missing_prerequisites"] == [
                "GRAMMAR_TO_BE"
            ]
        finally:
            db.close()

    def test_persists_high_frustration_score(self, client: TestClient) -> None:
        student_id = seed_student_with_skill_state(mastery=85.0, avg_speed=10.0)
        attempts = []
        for index in range(1, 5):
            payload = attempt_payload(student_id)
            payload["question_id"] = f"q{index}"
            payload["is_correct"] = False
            payload["response_time"] = 20.0
            payload["session_position"] = index
            attempts.append(payload)

        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": attempts},
        )

        assert resp.status_code == 201, resp.text
        db = TestingSessionLocal()
        try:
            state = (
                db.query(StudentSkillStateORM)
                .filter(
                    StudentSkillStateORM.student_id == student_id,
                    StudentSkillStateORM.skill_id == "GRAMMAR_VERB_FORMS",
                )
                .one()
            )
            assert state.frustration_score == pytest.approx(100.0)
        finally:
            db.close()

    def test_maintains_difficulty_until_mastery_gate_is_met(self, client: TestClient) -> None:
        student_id = seed_student_with_skill_state(
            mastery=70.0,
            avg_speed=8.0,
            confidence=100.0,
            current_difficulty=2,
        )
        attempts = []
        for index in range(1, 11):
            payload = attempt_payload(student_id)
            payload["question_id"] = f"q{index}"
            payload["is_correct"] = True
            payload["response_time"] = 1.0
            payload["difficulty"] = 5
            payload["session_position"] = index
            attempts.append(payload)

        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": attempts},
        )

        assert resp.status_code == 201, resp.text
        db = TestingSessionLocal()
        try:
            state = (
                db.query(StudentSkillStateORM)
                .filter(
                    StudentSkillStateORM.student_id == student_id,
                    StudentSkillStateORM.skill_id == "GRAMMAR_VERB_FORMS",
                )
                .one()
            )
            assert state.consistency == pytest.approx(100.0)
            assert state.current_difficulty == 2
        finally:
            db.close()

    def test_maintains_difficulty_for_middle_score(self, client: TestClient) -> None:
        student_id = seed_student_with_skill_state(
            mastery=50.0,
            avg_speed=8.0,
            confidence=0.0,
            current_difficulty=3,
        )
        attempts = []
        for index in range(1, 11):
            payload = attempt_payload(student_id)
            payload["question_id"] = f"q{index}"
            payload["is_correct"] = True
            payload["response_time"] = 15.0
            payload["difficulty"] = 3
            payload["session_position"] = index
            attempts.append(payload)

        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": attempts},
        )

        assert resp.status_code == 201, resp.text
        db = TestingSessionLocal()
        try:
            state = (
                db.query(StudentSkillStateORM)
                .filter(
                    StudentSkillStateORM.student_id == student_id,
                    StudentSkillStateORM.skill_id == "GRAMMAR_VERB_FORMS",
                )
                .one()
            )
            assert state.consistency == pytest.approx(100.0)
            assert state.current_difficulty == 3
        finally:
            db.close()

    def test_reduces_difficulty_after_weak_session(self, client: TestClient) -> None:
        student_id = seed_student_with_skill_state(
            mastery=20.0,
            avg_speed=8.0,
            confidence=0.0,
            current_difficulty=3,
        )
        attempts = []
        for index in range(1, 11):
            payload = attempt_payload(student_id)
            payload["question_id"] = f"q{index}"
            payload["is_correct"] = False
            payload["response_time"] = 60.0
            payload["difficulty"] = 1
            payload["session_position"] = index
            attempts.append(payload)

        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": attempts},
        )

        assert resp.status_code == 201, resp.text
        db = TestingSessionLocal()
        try:
            state = (
                db.query(StudentSkillStateORM)
                .filter(
                    StudentSkillStateORM.student_id == student_id,
                    StudentSkillStateORM.skill_id == "GRAMMAR_VERB_FORMS",
                )
                .one()
            )
            assert state.consistency == pytest.approx(100.0)
            assert state.current_difficulty == 2
        finally:
            db.close()

    def test_records_consistent_error_pattern(self, client: TestClient) -> None:
        student_id = seed_student()
        attempts = []
        for index, is_correct in enumerate([False, False, False, True], start=1):
            payload = attempt_payload(student_id)
            payload["question_id"] = f"past_participle:q{index}"
            payload["is_correct"] = is_correct
            payload["session_position"] = index
            attempts.append(payload)

        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": attempts},
        )

        assert resp.status_code == 201, resp.text
        db = TestingSessionLocal()
        try:
            error_pattern = db.query(ErrorPatternRecordORM).one()
            assert error_pattern.student_id == student_id
            assert error_pattern.skill_id == "GRAMMAR_VERB_FORMS"
            assert error_pattern.pattern_type == "misunderstood_concept"
            assert error_pattern.evidence_json["question_subtype"] == "past_participle"
            assert error_pattern.evidence_json["wrong_count"] == 3
            assert "targeted explanation" in error_pattern.treatment_recommendation
        finally:
            db.close()

    def test_question_quality_uses_historical_attempts(self, client: TestClient) -> None:
        db = TestingSessionLocal()
        try:
            for index in range(1, 5):
                student = StudentORM(
                    name=f"High Mastery {index}",
                    email=f"high-mastery-{index}@test.com",
                )
                db.add(student)
                db.flush()
                db.add(
                    StudentSkillStateORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_VERB_FORMS",
                        mastery=90.0,
                    )
                )
                db.add(
                    QuestionAttemptORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_VERB_FORMS",
                        question_id="historical:q1",
                        session_id=f"history-high-{index}",
                        is_correct=True,
                        response_time=8.0,
                        attempts=1,
                        difficulty=3,
                        hint_used=False,
                        skip=False,
                        answer_changed=False,
                        time_of_day="morning",
                        session_position=1,
                    )
                )
            for index in range(1, 5):
                student = StudentORM(
                    name=f"Low Mastery {index}",
                    email=f"low-mastery-{index}@test.com",
                )
                db.add(student)
                db.flush()
                db.add(
                    StudentSkillStateORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_VERB_FORMS",
                        mastery=30.0,
                    )
                )
                db.add(
                    QuestionAttemptORM(
                        student_id=student.id,
                        skill_id="GRAMMAR_VERB_FORMS",
                        question_id="historical:q1",
                        session_id=f"history-low-{index}",
                        is_correct=False,
                        response_time=12.0,
                        attempts=1,
                        difficulty=3,
                        hint_used=False,
                        skip=False,
                        answer_changed=False,
                        time_of_day="morning",
                        session_position=1,
                    )
                )
            db.commit()
        finally:
            db.close()

        student_id = seed_student()
        historical = attempt_payload(student_id)
        historical["question_id"] = "historical:q1"
        historical["session_position"] = 1
        new_question = attempt_payload(student_id)
        new_question["question_id"] = "new-low-sample:q1"
        new_question["session_position"] = 2

        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": [historical, new_question]},
        )

        assert resp.status_code == 201, resp.text
        quality_by_id = {
            item["question_id"]: item
            for item in resp.json()["question_quality"]
        }
        historical_quality = quality_by_id["historical:q1"]
        assert historical_quality["evidence"]["sample_size"] == 9
        assert historical_quality["evidence"]["discrimination_index"] > 0.0
        assert historical_quality["evidence"]["discrimination_index"] != 0.5
        assert historical_quality["quality_label"] in {"acceptable", "strong"}

        low_sample_quality = quality_by_id["new-low-sample:q1"]
        assert low_sample_quality["quality_label"] == "insufficient_data"
        assert low_sample_quality["impact_weight"] == 0.85
        assert low_sample_quality["flag_for_review"] is False

    def test_tracks_previous_recommendation_outcome_once(
        self,
        client: TestClient,
    ) -> None:
        student_id = seed_student_with_skill_state(
            mastery=10.0,
            avg_speed=8.0,
            confidence=50.0,
            skill_id="GRAMMAR_VERB_FORMS",
        )
        db = TestingSessionLocal()
        try:
            prior = RecommendationLogORM(
                student_id=student_id,
                action_type="collect_more_evidence",
                skill_id="GRAMMAR_VERB_FORMS",
                difficulty=1,
                reason="Collect reliable evidence.",
                evidence={},
                confidence="low",
                decision_priority="low_reliability",
                inputs_snapshot={
                    "retention": 10.0,
                    "weakness_score": 40.0,
                },
                mastery_before=10.0,
            )
            db.add(prior)
            db.commit()
            prior_id = prior.id
        finally:
            db.close()

        attempts = []
        for index in range(1, 11):
            payload = attempt_payload(student_id, session_id="session-outcome")
            payload["question_id"] = f"outcome:q{index}"
            payload["is_correct"] = True
            payload["session_position"] = index
            attempts.append(payload)

        resp = client.post(
            "/sessions/session-outcome/attempts",
            json={"attempts": attempts},
        )

        assert resp.status_code == 201, resp.text
        outcome = resp.json()["outcome_tracking"]
        assert outcome["evaluated"] is True
        assert outcome["recommendation_id"] == prior_id
        assert outcome["outcome"] in {"successful", "neutral"}

        db = TestingSessionLocal()
        try:
            record = db.query(OutcomeRecordORM).one()
            assert record.recommendation_id == prior_id
            prior = db.query(RecommendationLogORM).filter_by(id=prior_id).one()
            assert prior.mastery_after is not None
            assert prior.mastery_improved_after is True
            assert prior.was_followed is True
        finally:
            db.close()

    def test_does_not_track_same_recommendation_twice(
        self,
        client: TestClient,
    ) -> None:
        student_id = seed_student_with_skill_state(
            mastery=20.0,
            avg_speed=8.0,
            confidence=50.0,
            skill_id="GRAMMAR_VERB_FORMS",
        )
        db = TestingSessionLocal()
        try:
            prior = RecommendationLogORM(
                student_id=student_id,
                action_type="collect_more_evidence",
                skill_id="GRAMMAR_VERB_FORMS",
                difficulty=1,
                reason="Already evaluated.",
                evidence={},
                confidence="low",
                decision_priority="low_reliability",
                inputs_snapshot={
                    "retention": 20.0,
                    "weakness_score": 30.0,
                },
                mastery_before=20.0,
                mastery_after=25.0,
                mastery_improved_after=True,
                was_followed=True,
            )
            db.add(prior)
            db.flush()
            db.add(
                OutcomeRecordORM(
                    recommendation_id=prior.id,
                    mastery_before=20.0,
                    mastery_after=25.0,
                    retention_before=20.0,
                    retention_after=25.0,
                    weakness_before=30.0,
                    weakness_after=20.0,
                    outcome="successful",
                )
            )
            db.commit()
            prior_id = prior.id
        finally:
            db.close()

        resp = client.post(
            "/sessions/session-outcome-skip/attempts",
            json={"attempts": [attempt_payload(student_id, session_id="session-outcome-skip")]},
        )

        assert resp.status_code == 201, resp.text
        assert resp.json()["outcome_tracking"]["evaluated"] is False
        assert resp.json()["outcome_tracking"]["reason"] == "no_unevaluated_recommendation"

        db = TestingSessionLocal()
        try:
            assert db.query(OutcomeRecordORM).count() == 1
            record = db.query(OutcomeRecordORM).one()
            assert record.recommendation_id == prior_id
        finally:
            db.close()

    def test_outcome_tracking_failure_does_not_break_session(
        self,
        client: TestClient,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        from aim.infrastructure.repositories.adaptive_logs import (
            SQLOutcomeRecordRepository,
        )

        student_id = seed_student_with_skill_state(
            mastery=20.0,
            avg_speed=8.0,
            confidence=50.0,
            skill_id="GRAMMAR_VERB_FORMS",
        )
        db = TestingSessionLocal()
        try:
            db.add(
                RecommendationLogORM(
                    student_id=student_id,
                    action_type="collect_more_evidence",
                    skill_id="GRAMMAR_VERB_FORMS",
                    difficulty=1,
                    reason="Collect reliable evidence.",
                    evidence={},
                    confidence="low",
                    decision_priority="low_reliability",
                    inputs_snapshot={
                        "retention": 20.0,
                        "weakness_score": 30.0,
                    },
                    mastery_before=20.0,
                )
            )
            db.commit()
        finally:
            db.close()

        def fail_add_result(self, result):
            raise RuntimeError("forced outcome failure")

        monkeypatch.setattr(SQLOutcomeRecordRepository, "add_result", fail_add_result)

        resp = client.post(
            "/sessions/session-outcome-failure/attempts",
            json={"attempts": [attempt_payload(student_id, session_id="session-outcome-failure")]},
        )

        assert resp.status_code == 201, resp.text
        outcome = resp.json()["outcome_tracking"]
        assert outcome["evaluated"] is False
        assert outcome["reason"] == "tracking_failed"
        assert outcome["error"] == "RuntimeError"

