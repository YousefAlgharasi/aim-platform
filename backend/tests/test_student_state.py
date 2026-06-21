import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import status
from fastapi.testclient import TestClient
from pydantic import ValidationError

from backend.main import app
from backend.models.student_state import (
    StudentSkillState,
    StudentSkillStateRead,
    StudentSkillStateUpdate,
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# Pydantic schema tests
# ---------------------------------------------------------------------------

class TestStudentSkillStateUpdate:
    def test_all_fields_optional(self):
        payload = StudentSkillStateUpdate()
        assert payload.mastery is None
        assert payload.frustration_score is None
        assert payload.learning_style is None

    def test_valid_full_payload(self):
        payload = StudentSkillStateUpdate(
            mastery=85.0,
            confidence=70.0,
            attempts=10,
            avg_speed=3.5,
            retention=80.0,
            weakness_score=20.0,
            frustration_score=15.0,
            learning_style="example_first",
            last_reviewed_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
        )
        assert payload.mastery == 85.0
        assert payload.frustration_score == 15.0
        assert payload.learning_style == "example_first"

    def test_mastery_below_zero_rejected(self):
        with pytest.raises(ValidationError):
            StudentSkillStateUpdate(mastery=-1.0)

    def test_mastery_above_100_rejected(self):
        with pytest.raises(ValidationError):
            StudentSkillStateUpdate(mastery=101.0)

    def test_confidence_above_100_rejected(self):
        with pytest.raises(ValidationError):
            StudentSkillStateUpdate(confidence=200.0)

    def test_attempts_negative_rejected(self):
        with pytest.raises(ValidationError):
            StudentSkillStateUpdate(attempts=-5)

    def test_frustration_score_above_100_rejected(self):
        with pytest.raises(ValidationError):
            StudentSkillStateUpdate(frustration_score=150.0)

    def test_retention_above_100_rejected(self):
        with pytest.raises(ValidationError):
            StudentSkillStateUpdate(retention=101.0)

    def test_weakness_score_above_100_rejected(self):
        with pytest.raises(ValidationError):
            StudentSkillStateUpdate(weakness_score=101.0)

    def test_learning_style_too_long_rejected(self):
        with pytest.raises(ValidationError):
            StudentSkillStateUpdate(learning_style="x" * 51)

    def test_boundary_mastery_zero(self):
        payload = StudentSkillStateUpdate(mastery=0.0)
        assert payload.mastery == 0.0

    def test_boundary_mastery_100(self):
        payload = StudentSkillStateUpdate(mastery=100.0)
        assert payload.mastery == 100.0


class TestStudentSkillStateRead:
    def _make_orm_mock(self, **overrides):
        defaults = dict(
            id=1,
            student_id=uuid.uuid4(),
            skill_id="grammar.present_simple",
            mastery=0.0,
            confidence=0.0,
            attempts=0,
            avg_speed=0.0,
            retention=0.0,
            weakness_score=0.0,
            frustration_score=0.0,
            learning_style="unknown",
            last_reviewed_at=None,
            created_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
            updated_at=datetime(2025, 1, 1, tzinfo=timezone.utc),
        )
        defaults.update(overrides)
        obj = MagicMock(**defaults)
        return obj

    def test_from_orm_defaults(self):
        obj = self._make_orm_mock()
        read = StudentSkillStateRead.model_validate(obj)
        assert read.mastery == 0.0
        assert read.frustration_score == 0.0
        assert read.learning_style == "unknown"
        assert read.last_reviewed_at is None

    def test_from_orm_with_values(self):
        sid = uuid.uuid4()
        obj = self._make_orm_mock(
            student_id=sid,
            skill_id="vocabulary.academic",
            mastery=72.5,
            frustration_score=30.0,
            learning_style="rule_first",
        )
        read = StudentSkillStateRead.model_validate(obj)
        assert read.student_id == sid
        assert read.skill_id == "vocabulary.academic"
        assert read.mastery == 72.5
        assert read.frustration_score == 30.0
        assert read.learning_style == "rule_first"

    def test_all_required_fields_present(self):
        obj = self._make_orm_mock()
        read = StudentSkillStateRead.model_validate(obj)
        required = [
            "id", "student_id", "skill_id", "mastery", "confidence",
            "attempts", "avg_speed", "retention", "weakness_score",
            "frustration_score", "learning_style", "last_reviewed_at",
            "created_at", "updated_at",
        ]
        for field in required:
            assert hasattr(read, field), f"Missing field: {field}"


# ---------------------------------------------------------------------------
# ORM model attribute tests
# ---------------------------------------------------------------------------

class TestStudentSkillStateORM:
    def test_default_mastery(self):
        state = StudentSkillState()
        assert state.mastery == 0.0

    def test_default_frustration_score(self):
        state = StudentSkillState()
        assert state.frustration_score == 0.0

    def test_default_learning_style(self):
        state = StudentSkillState()
        assert state.learning_style == "unknown"

    def test_default_attempts(self):
        state = StudentSkillState()
        assert state.attempts == 0

    def test_frustration_score_field_exists(self):
        assert hasattr(StudentSkillState, "frustration_score")

    def test_learning_style_field_exists(self):
        assert hasattr(StudentSkillState, "learning_style")

    def test_can_set_all_fields(self):
        state = StudentSkillState(
            student_id=uuid.uuid4(),
            skill_id="grammar.passive_voice",
            mastery=60.0,
            confidence=55.0,
            attempts=5,
            avg_speed=4.2,
            retention=70.0,
            weakness_score=35.0,
            frustration_score=20.0,
            learning_style="repetition_based",
        )
        assert state.skill_id == "grammar.passive_voice"
        assert state.mastery == 60.0
        assert state.frustration_score == 20.0
        assert state.learning_style == "repetition_based"


# ---------------------------------------------------------------------------
# API endpoint tests (mocked DB)
# ---------------------------------------------------------------------------

def _make_state_mock(student_id=None, skill_id="grammar.tenses"):
    sid = student_id or uuid.uuid4()
    state = MagicMock(spec=StudentSkillState)
    state.id = 1
    state.student_id = sid
    state.skill_id = skill_id
    state.mastery = 55.0
    state.confidence = 60.0
    state.attempts = 3
    state.avg_speed = 3.0
    state.retention = 75.0
    state.weakness_score = 25.0
    state.frustration_score = 10.0
    state.learning_style = "unknown"
    state.last_reviewed_at = None
    state.created_at = datetime(2025, 1, 1, tzinfo=timezone.utc)
    state.updated_at = datetime(2025, 1, 1, tzinfo=timezone.utc)
    return sid, state


def _make_sync_execute_result(scalar=None, scalars_list=None):
    result = MagicMock()
    result.scalar_one_or_none.return_value = scalar
    if scalars_list is not None:
        result.scalars.return_value.all.return_value = scalars_list
    return result


def _make_async_db(execute_side_effects: list):
    mock_db = AsyncMock()
    mock_db.execute.side_effect = [
        AsyncMock(return_value=effect)() if not isinstance(effect, MagicMock)
        else AsyncMock(return_value=effect)()
        for effect in execute_side_effects
    ]

    async def _execute(*args, **kwargs):
        return execute_side_effects.pop(0)

    mock_db.execute.side_effect = _execute
    return mock_db


class TestGetStudentState:
    def test_returns_404_when_student_not_found(self):
        student_id = uuid.uuid4()
        effects = [_make_sync_execute_result(scalar=None)]
        mock_db = _make_async_db(effects)

        async def override_db():
            yield mock_db

        from backend.database import get_db
        app.dependency_overrides[get_db] = override_db
        response = client.get(f"/students/{student_id}/state")
        app.dependency_overrides.clear()

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_returns_empty_list_when_no_skills(self):
        student_id = uuid.uuid4()
        effects = [
            _make_sync_execute_result(scalar=MagicMock()),
            _make_sync_execute_result(scalars_list=[]),
        ]
        mock_db = _make_async_db(effects)

        async def override_db():
            yield mock_db

        from backend.database import get_db
        app.dependency_overrides[get_db] = override_db
        response = client.get(f"/students/{student_id}/state")
        app.dependency_overrides.clear()

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []


class TestGetStudentSkillState:
    def test_returns_404_when_skill_not_found(self):
        student_id = uuid.uuid4()
        effects = [_make_sync_execute_result(scalar=None)]
        mock_db = _make_async_db(effects)

        async def override_db():
            yield mock_db

        from backend.database import get_db
        app.dependency_overrides[get_db] = override_db
        response = client.get(f"/students/{student_id}/skills/nonexistent/state")
        app.dependency_overrides.clear()

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["detail"] == "Skill state not found"


class TestUpsertStudentSkillState:
    def test_returns_404_when_student_missing(self):
        student_id = uuid.uuid4()
        effects = [_make_sync_execute_result(scalar=None)]
        mock_db = _make_async_db(effects)

        async def override_db():
            yield mock_db

        from backend.database import get_db
        app.dependency_overrides[get_db] = override_db
        response = client.put(
            f"/students/{student_id}/skills/grammar.tenses/state",
            json={"mastery": 70.0},
        )
        app.dependency_overrides.clear()

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_payload_with_frustration_score_accepted(self):
        payload = StudentSkillStateUpdate(
            mastery=80.0,
            frustration_score=5.0,
            learning_style="inductive",
        )
        assert payload.frustration_score == 5.0
        assert payload.learning_style == "inductive"

    def test_model_dump_excludes_unset(self):
        payload = StudentSkillStateUpdate(mastery=90.0)
        dumped = payload.model_dump(exclude_unset=True)
        assert "mastery" in dumped
        assert "frustration_score" not in dumped
        assert "learning_style" not in dumped

    def test_full_payload_all_fields_present(self):
        payload = StudentSkillStateUpdate(
            mastery=75.0,
            confidence=65.0,
            attempts=8,
            avg_speed=2.5,
            retention=80.0,
            weakness_score=15.0,
            frustration_score=12.0,
            learning_style="example_first",
        )
        dumped = payload.model_dump(exclude_unset=True)
        assert len(dumped) == 8
        assert dumped["frustration_score"] == 12.0
        assert dumped["learning_style"] == "example_first"


# ---------------------------------------------------------------------------
# Schema field completeness test
# ---------------------------------------------------------------------------

class TestSchemaCompleteness:
    REQUIRED_DB_FIELDS = [
        "mastery", "confidence", "attempts", "avg_speed",
        "retention", "weakness_score", "frustration_score",
        "learning_style", "last_reviewed_at",
    ]

    def test_orm_has_all_required_fields(self):
        for field in self.REQUIRED_DB_FIELDS:
            assert hasattr(StudentSkillState, field), f"ORM missing: {field}"

    def test_read_schema_has_all_required_fields(self):
        fields = StudentSkillStateRead.model_fields
        for field in self.REQUIRED_DB_FIELDS:
            assert field in fields, f"Read schema missing: {field}"

    def test_update_schema_has_all_required_fields(self):
        fields = StudentSkillStateUpdate.model_fields
        for field in self.REQUIRED_DB_FIELDS:
            assert field in fields, f"Update schema missing: {field}"
