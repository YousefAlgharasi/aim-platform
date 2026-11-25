# 14 — Deployment and Infrastructure (`render.yaml`)

## 1. Production Topology (Render Blueprint)
`render.yaml` defines two containerized Docker web services:
1. **`aim-backend-api`**:
   - Root: `services/backend-api`, Port: `3000`, Health check: `/health`, `autoDeploy: false`.
   - Connects to external **Supabase** (PostgreSQL + Auth), **AIM Engine** (`AIM_ENGINE_URL`), and **AI/STT/TTS Providers**.
2. **`aim-engine`**:
   - Dockerfile: `services/aim-engine/Dockerfile`, Health check: `/health`, `autoDeploy: true`.
   - Protected by `AIM_ENGINE_SERVICE_TOKEN`.

## 2. Scalability Analysis (Estimates)
- **10–100 concurrent users**: Render Starter plan handles this easily; `aim-engine` math is $O(1)$ per request.
- **1,000–10,000 concurrent users**: Bottlenecks will be (1) external LLM/STT/TTS API rate limits and latency, (2) PostgreSQL connection pooling (requires PgBouncer/Supabase pooler), and (3) single-instance Render Starter CPU/RAM.
