# AIM Engine Test Fixtures (P5-026)

Deterministic Python fixtures for AIM Engine analysis request and response
payloads. These fixtures back unit, contract, and integration tests for the
AIM Engine and the Backend AIM adapter.

## Contents

- `aim_request_fixtures.py` — `AimAnalysisRequest` shaped dicts.
  - 3 valid scenarios: lesson-practice, placement-followup with bootstrap
    signals, multi-attempt review-practice.
  - 5 invalid scenarios, each violating exactly one contract rule:
    attempt/session mismatch, reversed session timestamps, negative
    behavioral counter, options count present for a non-option answer
    format, unsupported contract version.
- `aim_response_fixtures.py` — `AimAnalysisResponse` shaped dicts.
  - 4 valid scenarios: empty categories, skill-state only, weakness +
    difficulty, full categories with all six output kinds.
  - 3 invalid scenarios: difficulty step constraint violated, resolved
    weakness with no `resolved_at`, duplicate recommendation rank.
- Builder helpers (`build_valid_session`, `build_valid_attempt`,
  `build_request_envelope`, `build_skill_state_output`,
  `build_response_envelope`, etc.) for tests that need to vary a single
  field without restating the whole envelope.

## Determinism

UUIDs and ISO-8601 UTC timestamps are hard-coded. Tests that rely on these
fixtures must compare against the exact values declared in this module and
must not generate fresh UUIDs at call time.

## Scope guarantees

- Fixtures are test-only artifacts. Production code paths do not import them.
- Fixtures embed no secrets, service-role keys, database credentials, or AI
  provider keys.
- Fixtures preserve the Phase 5 rule that mastery, level, weakness,
  difficulty, recommendation, review-schedule, retention, and frustration
  values exist only on the response side (AIM Engine outputs). The request
  side carries only backend-owned context and raw behavioral signals.
- Fixtures preserve the rule that speed / response time is behavioral
  context only and never enters mastery, level, or difficulty logic.

## Usage

```python
from tests.fixtures import (
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
    FULL_CATEGORIES_RESPONSE,
    build_valid_attempt,
)
from app.schemas.aim_analysis_request import AimAnalysisRequest

request = AimAnalysisRequest.model_validate(
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT
)
```
