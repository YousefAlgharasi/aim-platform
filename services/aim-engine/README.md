# AIM Engine Service

Python service skeleton for the AIM adaptive-learning engine.

## Phase 1 scope

This service is the backend-owned AIM Engine boundary. It is responsible for future adaptive-learning orchestration, mastery calculation, recommendation logic, retention scheduling, weakness detection, and related internal learning intelligence.

For P1-026 through P1-030, this folder intentionally contains only:

- service skeleton
- safe system endpoints
- backend-to-engine contract models
- pipeline interface skeleton
- no-speed mastery guard tests

## Non-negotiable boundaries

- Do not implement full adaptive-learning algorithms in this task.
- Do not move mastery, weakness, difficulty, retention, or recommendation logic into any client.
- Do not expose learner-internal model fields directly to clients.
- Do not commit secrets.
- Do not add production provider keys or database credentials.
- Do not use speed, response time, average response time, or speed score as a direct mastery, level, or difficulty-increase signal.

## Local setup

```bash
cd services/aim-engine
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
uvicorn app.main:create_app --factory --reload --host 0.0.0.0 --port 8010
```

## Current app entrypoint

```text
app/main.py
```

The app factory is `create_app()`.

## Safe system endpoints

```text
GET /health
GET /version
```

## Contract models

```text
app/contracts/
```

The contracts define validated Pydantic models for future backend-to-engine calls. They do not calculate mastery, weakness, difficulty, retention, or recommendations.

## Pipeline boundary

```text
app/pipeline/
```

The pipeline package defines the future orchestration interface. The current placeholder returns `accepted` with empty output collections and must not be treated as real adaptive behavior.

## Guard tests

```text
tests/test_no_speed_mastery_guard.py
```

These tests ensure response time alone does not directly create mastery, difficulty, weakness, retention, or recommendation outputs.

## Future tasks

Later tasks will wire algorithms only after contracts, persistence, and service boundaries are explicit.
