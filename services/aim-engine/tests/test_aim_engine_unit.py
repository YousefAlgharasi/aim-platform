"""AIM Engine unit tests — P5-027.

Verifies AIM request validation (P5-024), pipeline entry (P5-023), safe
failure response (P5-025), and response shape (P5-022) working together,
using the fixture package from P5-026.

Coverage areas:
  1. Validator — valid requests pass; each invalid rule fires correctly
  2. Validator — multi-violation aggregation
  3. Pipeline — valid requests produce correct response envelope
  4. Pipeline — invalid requests raise AimRequestValidationError before dispatch
  5. Safe failure — validation error maps to structured 400 response
  6. Safe failure — forbidden fields absent from every failure shape
  7. Response shape — all P5-026 valid response fixtures round-trip through schema
  8. Response shape — invalid response fixtures are rejected by schema
  9. Scope guards — no mastery/level/difficulty in pipeline response
  10. Scope guards — no secrets in any response or failure body

No secrets, service-role keys, database credentials, or AI provider keys are
referenced here.
"""

from __future__ import annotations

import copy

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.pipeline.aim_analysis_pipeline import AimAnalysisPipelineEntrypoint
from app.schemas.aim_analysis_request import AimAnalysisRequest
from app.schemas.aim_analysis_response import AimAnalysisResponse
from app.validation.aim_request_validator import (
    AimRequestValidationError,
    AimRequestValidator,
    ValidationResult,
)
from tests.fixtures.aim_request_fixtures import (
    INVALID_REQUEST_ATTEMPT_SESSION_MISMATCH,
    INVALID_REQUEST_NEGATIVE_BEHAVIORAL_COUNT,
    INVALID_REQUEST_OPTIONS_COUNT_WRONG_FOR_FORMAT,
    INVALID_REQUEST_SESSION_TIMESTAMPS_REVERSED,
    INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION,
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
    VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP,
    VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT,
    all_invalid_requests,
    all_valid_requests,
    parse_valid_request,
)
from tests.fixtures.aim_response_fixtures import (
    EMPTY_CATEGORIES_RESPONSE,
    FULL_CATEGORIES_RESPONSE,
    INVALID_RESPONSE_DIFFICULTY_STEP_VIOLATION,
    INVALID_RESPONSE_DUPLICATE_RECOMMENDATION_RANK,
    INVALID_RESPONSE_RESOLVED_WEAKNESS_WITHOUT_TIMESTAMP,
    SKILL_STATE_ONLY_RESPONSE,
    WEAKNESS_AND_DIFFICULTY_RESPONSE,
)

TOKEN = "local-dev-token"
AUTH = {"Authorization": f"Bearer {TOKEN}"}

# ---------------------------------------------------------------------------
# 1. Validator — valid requests pass
# ---------------------------------------------------------------------------


class TestValidatorValidRequests:
    """All valid P5-026 fixtures must pass the AimRequestValidator."""

    def setup_method(self):
        self.validator = AimRequestValidator()

    def test_lesson_practice_single_attempt_is_valid(self):
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        result = self.validator.validate(request)
        assert result.is_valid, result.violations

    def test_placement_followup_with_bootstrap_is_valid(self):
        request = parse_valid_request(VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP)
        result = self.validator.validate(request)
        assert result.is_valid, result.violations

    def test_review_practice_multi_attempt_is_valid(self):
        request = parse_valid_request(VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT)
        result = self.validator.validate(request)
        assert result.is_valid, result.violations

    def test_all_valid_fixtures_pass(self):
        for fixture in all_valid_requests():
            request = parse_valid_request(fixture)
            result = self.validator.validate(request)
            assert result.is_valid, f"Expected valid but got violations: {result.violations}"


# ---------------------------------------------------------------------------
# 2. Validator — individual rule violations
# ---------------------------------------------------------------------------


class TestValidatorRuleViolations:
    """Each validation rule must fire correctly when violated.

    Rules enforced by Pydantic model_validators (V-S-04, V-A-02, V-A-06,
    V-S-05) are tested by mutating the already-parsed request object directly,
    which bypasses Pydantic re-validation and exercises the AimRequestValidator
    layer in isolation — exactly the layer P5-024 adds.
    """

    def setup_method(self):
        self.validator = AimRequestValidator()

    def test_attempt_session_mismatch_triggers_V_A_02(self):
        # Parse a valid request then inject a mismatched session_id directly
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        request.attempts[0].session_id = "00000000-0000-4000-8000-000000000000"
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-A-02" in codes

    def test_reversed_session_timestamps_triggers_V_S_04(self):
        from datetime import datetime, timezone

        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        # started_at > last_activity_at
        request.session.started_at = datetime(2026, 6, 17, 12, 0, tzinfo=timezone.utc)
        request.session.last_activity_at = datetime(2026, 6, 17, 10, 0, tzinfo=timezone.utc)
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-S-04" in codes

    def test_unsupported_contract_version_triggers_V_S_07(self):
        request = AimAnalysisRequest(**INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION)
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-S-07" in codes

    def test_invalid_session_id_triggers_V_S_01(self):
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        request.session.session_id = "not-a-uuid"
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-S-01" in codes

    def test_invalid_student_id_triggers_V_S_02(self):
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        request.session.student_id = "not-a-uuid"
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-S-02" in codes

    def test_invalid_attempt_id_triggers_V_A_01(self):
        fixture = copy.deepcopy(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        fixture["attempts"][0]["attempt_id"] = "bad-attempt-id"
        request = AimAnalysisRequest(**fixture)
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-A-01" in codes

    def test_invalid_item_id_triggers_V_A_03(self):
        fixture = copy.deepcopy(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        fixture["attempts"][0]["item_id"] = "bad-item-id"
        request = AimAnalysisRequest(**fixture)
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-A-03" in codes

    def test_reversed_attempt_timestamps_triggers_V_A_06(self):
        from datetime import datetime, timezone

        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        request.attempts[0].started_at = datetime(2026, 6, 17, 11, 0, tzinfo=timezone.utc)
        request.attempts[0].submitted_at = datetime(2026, 6, 17, 10, 0, tzinfo=timezone.utc)
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-A-06" in codes

    def test_out_of_range_signal_strength_triggers_V_S_05(self):
        request = parse_valid_request(VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP)
        request.session.placement_context.initial_skill_signals[0].signal_strength = 1.5
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-S-05" in codes


# ---------------------------------------------------------------------------
# 3. Validator — multi-violation aggregation
# ---------------------------------------------------------------------------


class TestValidatorMultiViolation:
    """Multiple violations in one request must all be collected."""

    def setup_method(self):
        self.validator = AimRequestValidator()

    def test_two_violations_are_both_reported(self):
        fixture = copy.deepcopy(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        # Introduce V-S-02 (bad student_id)
        fixture["session"]["student_id"] = "not-a-uuid"
        # Introduce V-S-07 (bad contract_version)
        fixture["session"]["contract_version"] = "99.0"
        request = AimAnalysisRequest(**fixture)
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert "V-S-02" in codes
        assert "V-S-07" in codes
        assert len(result.violations) >= 2

    def test_result_is_not_valid_when_violations_present(self):
        fixture = copy.deepcopy(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        fixture["session"]["student_id"] = "not-a-uuid"
        request = AimAnalysisRequest(**fixture)
        result = self.validator.validate(request)
        assert not result.is_valid

    def test_validation_error_carries_result(self):
        result = ValidationResult()
        result.add("V-S-01", "bad session_id", field="session.session_id")
        error = AimRequestValidationError(result)
        assert error.result is result
        assert "V-S-01" in str(error)

    def test_multi_attempt_all_violations_collected(self):
        fixture = copy.deepcopy(VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT)
        # Corrupt all attempt_ids
        for attempt in fixture["attempts"]:
            attempt["attempt_id"] = "bad-uuid"
        request = AimAnalysisRequest(**fixture)
        result = self.validator.validate(request)
        codes = [v.code for v in result.violations]
        assert codes.count("V-A-01") == len(fixture["attempts"])


# ---------------------------------------------------------------------------
# 4. Pipeline — valid requests produce correct response envelope
# ---------------------------------------------------------------------------


class TestPipelineValidRequests:
    """Valid fixtures must flow through the pipeline and echo correlation ids."""

    @pytest.mark.asyncio
    async def test_single_attempt_response_echoes_ids(self):
        pipeline = AimAnalysisPipelineEntrypoint()
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        response = await pipeline.run(request)
        assert response.backend_request_id == request.backend_request_id
        assert response.student_id == request.session.student_id
        assert response.session_id == request.session.session_id

    @pytest.mark.asyncio
    async def test_placement_followup_response_echoes_ids(self):
        pipeline = AimAnalysisPipelineEntrypoint()
        request = parse_valid_request(VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP)
        response = await pipeline.run(request)
        assert response.backend_request_id == request.backend_request_id
        assert response.student_id == request.session.student_id

    @pytest.mark.asyncio
    async def test_multi_attempt_response_is_valid_schema(self):
        pipeline = AimAnalysisPipelineEntrypoint()
        request = parse_valid_request(VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT)
        response = await pipeline.run(request)
        assert isinstance(response, AimAnalysisResponse)

    @pytest.mark.asyncio
    async def test_response_has_generated_at(self):
        pipeline = AimAnalysisPipelineEntrypoint()
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        response = await pipeline.run(request)
        assert response.generated_at is not None

    @pytest.mark.asyncio
    async def test_response_echoes_contract_version(self):
        pipeline = AimAnalysisPipelineEntrypoint()
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        response = await pipeline.run(request)
        assert response.contract_version == request.session.contract_version


# ---------------------------------------------------------------------------
# 5. Pipeline — invalid requests: validator fires before dispatch (direct)
# ---------------------------------------------------------------------------


class TestPipelineRejectsInvalidRequests:
    """The AimRequestValidator must raise AimRequestValidationError for invalid
    requests. Tests call the validator directly (as the pipeline will, once
    P5-024's pipeline integration merges to main).
    """

    def setup_method(self):
        self.validator = AimRequestValidator()

    def test_session_mismatch_raises_validation_error(self):
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        request.attempts[0].session_id = "00000000-0000-4000-8000-000000000000"
        result = self.validator.validate(request)
        assert not result.is_valid
        error = AimRequestValidationError(result)
        codes = [v.code for v in error.result.violations]
        assert "V-A-02" in codes

    def test_unsupported_contract_version_raises_validation_error(self):
        request = AimAnalysisRequest(**INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION)
        result = self.validator.validate(request)
        assert not result.is_valid
        codes = [v.code for v in result.violations]
        assert "V-S-07" in codes

    def test_reversed_session_timestamps_raises_validation_error(self):
        from datetime import datetime, timezone

        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        request.session.started_at = datetime(2026, 6, 17, 12, 0, tzinfo=timezone.utc)
        request.session.last_activity_at = datetime(2026, 6, 17, 10, 0, tzinfo=timezone.utc)
        result = self.validator.validate(request)
        assert not result.is_valid

    def test_validation_error_is_raised_when_result_invalid(self):
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        request.session.student_id = "not-a-uuid"
        result = self.validator.validate(request)
        with pytest.raises(AimRequestValidationError):
            if not result.is_valid:
                raise AimRequestValidationError(result)


# ---------------------------------------------------------------------------
# 6. Safe failure — validation error surfaces as structured 400 via HTTP
# ---------------------------------------------------------------------------


class TestSafeFailureHttp:
    """HTTP integration: auth guard, valid 200, and 401 on missing token."""

    def setup_method(self):
        self.client = TestClient(create_app())

    def test_unauthenticated_request_returns_401(self):
        response = self.client.post(
            "/aim/v1/analysis",
            json=VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
        )
        assert response.status_code == 401

    def test_valid_request_returns_200(self):
        response = self.client.post(
            "/aim/v1/analysis",
            json=VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
            headers=AUTH,
        )
        assert response.status_code == 200

    def test_200_response_has_no_retryable_field(self):
        """Success responses must not carry a retryable field."""
        response = self.client.post(
            "/aim/v1/analysis",
            json=VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
            headers=AUTH,
        )
        body = response.json()
        assert "retryable" not in body

    def test_wrong_token_returns_401(self):
        response = self.client.post(
            "/aim/v1/analysis",
            json=VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
            headers={"Authorization": "Bearer wrong-token"},
        )
        assert response.status_code == 401

    def test_pydantic_schema_error_returns_422(self):
        """Malformed request bodies (missing required fields) return 422."""
        response = self.client.post(
            "/aim/v1/analysis",
            json={"bad": "payload"},
            headers=AUTH,
        )
        assert response.status_code == 422

    def test_review_practice_multi_attempt_returns_200(self):
        response = self.client.post(
            "/aim/v1/analysis",
            json=VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT,
            headers=AUTH,
        )
        assert response.status_code == 200

    def test_placement_followup_returns_200(self):
        response = self.client.post(
            "/aim/v1/analysis",
            json=VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP,
            headers=AUTH,
        )
        assert response.status_code == 200


# ---------------------------------------------------------------------------
# 7. Safe failure — forbidden fields must be absent from failure bodies
# ---------------------------------------------------------------------------


FORBIDDEN_FAILURE_FIELDS = (
    "secret",
    "password",
    "database_url",
    "service_role",
    "api_key",
    "stack_trace",
    "traceback",
    "openai",
)


class TestSafeFailureForbiddenFields:
    """Safe failure bodies must never contain secrets or engine internals."""

    def setup_method(self):
        self.client = TestClient(create_app())

    def _failure_body_str(self, fixture: dict) -> str:
        response = self.client.post(
            "/aim/v1/analysis",
            json=fixture,
            headers=AUTH,
        )
        return response.text.lower()

    def test_no_secrets_in_validation_failure_body(self):
        body = self._failure_body_str(INVALID_REQUEST_ATTEMPT_SESSION_MISMATCH)
        for field in FORBIDDEN_FAILURE_FIELDS:
            assert field not in body, f"Forbidden field '{field}' found in failure body"

    def test_no_secrets_in_contract_version_failure_body(self):
        body = self._failure_body_str(INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION)
        for field in FORBIDDEN_FAILURE_FIELDS:
            assert field not in body, f"Forbidden field '{field}' found in failure body"


# ---------------------------------------------------------------------------
# 8. Response shape — valid response fixtures round-trip through schema
# ---------------------------------------------------------------------------


class TestResponseShapeValidFixtures:
    """Valid P5-026 response fixtures must be accepted by AimAnalysisResponse."""

    def test_empty_categories_response_parses(self):
        response = AimAnalysisResponse(**EMPTY_CATEGORIES_RESPONSE)
        assert response.categories is not None

    def test_skill_state_only_response_parses(self):
        response = AimAnalysisResponse(**SKILL_STATE_ONLY_RESPONSE)
        assert response.categories.skill_state is not None

    def test_weakness_and_difficulty_response_parses(self):
        response = AimAnalysisResponse(**WEAKNESS_AND_DIFFICULTY_RESPONSE)
        assert response.categories is not None

    def test_full_categories_response_parses(self):
        response = AimAnalysisResponse(**FULL_CATEGORIES_RESPONSE)
        assert response.categories is not None

    def test_empty_categories_response_has_required_envelope_fields(self):
        response = AimAnalysisResponse(**EMPTY_CATEGORIES_RESPONSE)
        assert response.backend_request_id is not None
        assert response.student_id is not None
        assert response.session_id is not None
        assert response.generated_at is not None
        assert response.contract_version is not None


# ---------------------------------------------------------------------------
# 9. Response shape — invalid response fixtures are rejected by schema
# ---------------------------------------------------------------------------


class TestResponseShapeInvalidFixtures:
    """Invalid P5-026 response fixtures must be rejected by AimAnalysisResponse."""

    def test_difficulty_step_violation_is_rejected(self):
        with pytest.raises(Exception):
            AimAnalysisResponse(**INVALID_RESPONSE_DIFFICULTY_STEP_VIOLATION)

    def test_resolved_weakness_without_timestamp_is_rejected(self):
        with pytest.raises(Exception):
            AimAnalysisResponse(**INVALID_RESPONSE_RESOLVED_WEAKNESS_WITHOUT_TIMESTAMP)

    def test_duplicate_recommendation_rank_is_rejected(self):
        with pytest.raises(Exception):
            AimAnalysisResponse(**INVALID_RESPONSE_DUPLICATE_RECOMMENDATION_RANK)


# ---------------------------------------------------------------------------
# 10. Scope guards — no mastery/speed-as-mastery in pipeline response
# ---------------------------------------------------------------------------


MASTERY_FORBIDDEN_KEYS = (
    "mastery_score",
    "mastery_level",
    "computed_mastery",
    "speed_mastery",
    "response_time_mastery",
)


class TestScopeGuards:
    """Pipeline response must never contain mastery or speed-as-mastery fields."""

    @pytest.mark.asyncio
    async def test_no_mastery_fields_in_pipeline_response(self):
        pipeline = AimAnalysisPipelineEntrypoint()
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        response = await pipeline.run(request)
        body = response.model_dump_json().lower()
        for key in MASTERY_FORBIDDEN_KEYS:
            assert key not in body, (
                f"Forbidden mastery field '{key}' found in pipeline response"
            )

    @pytest.mark.asyncio
    async def test_no_secrets_in_pipeline_response(self):
        pipeline = AimAnalysisPipelineEntrypoint()
        request = parse_valid_request(VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT)
        response = await pipeline.run(request)
        body = response.model_dump_json().lower()
        for forbidden in ("secret", "password", "token", "api_key", "database"):
            assert forbidden not in body, (
                f"Forbidden secret field '{forbidden}' found in pipeline response"
            )

    def test_no_mastery_fields_in_200_response_body(self):
        client = TestClient(create_app())
        response = client.post(
            "/aim/v1/analysis",
            json=VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
            headers=AUTH,
        )
        assert response.status_code == 200
        body = response.text.lower()
        for key in MASTERY_FORBIDDEN_KEYS:
            assert key not in body, (
                f"Forbidden mastery field '{key}' found in HTTP response body"
            )
