# AIM Engine Service

Python service skeleton for the AIM adaptive-learning engine.

## Phase 1 scope

This service is the backend-owned AIM Engine boundary. It is responsible for future adaptive-learning orchestration, mastery calculation, recommendation logic, retention scheduling, weakness detection, and related internal learning intelligence.

For P1-026 and P1-027, this folder intentionally contains only the service skeleton plus safe system endpoints.

## Non-negotiable boundaries

- Do not implement full adaptive-learning algorithms in this task.
- Do not move mastery, weakness, difficulty, retention, or recommendation logic into any client.
- Do not expose learner-internal model fields directly to clients.
- Do not commit secrets.
- Do not add production provider keys or database credentials.

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

These endpoints expose safe operational metadata only:

- service identifier
- status
- UTC timestamp
- uptime seconds
- implementation phase
- runtime environment
- service version

They must not expose secrets, database URLs, provider keys, Supabase keys, learner-internal fields, or adaptive-learning internals.

## Future tasks

- P1-028 will add contract models.
- P1-029 will add the pipeline interface skeleton.
