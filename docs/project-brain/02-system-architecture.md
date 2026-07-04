# 02 — System Architecture

> Last verified: 2026-07-04, by direct code reads across `services/backend-api`, `services/aim-engine`, and the four frontend apps during this session's repo-understanding audit and full inventory.

## Confirmed call paths (not the aspirational diagram — only what the code actually does)

```
apps/mobile (Flutter)  ─┐
apps/admin-dashboard    │──HTTP──► services/backend-api (NestJS)
apps/student-web        │           │
apps/web                ─┘           │  (raw `pg` via DatabaseService,
                                       │   bypasses Supabase RLS entirely)
                                       ├──► Supabase Postgres (yrarpdkvdxszgxxondkt)
                                       │
                                       ├──HTTP, bearer service-token───► services/aim-engine (FastAPI)
                                       │      (stateless: POST /aim/v1/analysis only,
                                       │       reads no DB itself, live-imports 6 domain
                                       │       services from services/api/src via sys.path)
                                       │
                                       ├──HTTP──► AI provider (OpenAI-compatible chat-completions)
                                       ├──HTTP──► STT provider (Groq Whisper-compatible, default)
                                       ├──HTTP──► TTS provider (tts.ai, async submit→poll→download)
                                       ├──(no real SDK bound)──► payment provider (stubbed, see below)
                                       └──(no-op)──► push/email notification providers (stubbed)

Supabase Auth ──JWT──► backend-api (hand-rolled HS256/ES256+JWKS verification,
                        no @supabase/supabase-js SDK used for this)
```

## Backend-api ↔ aim-engine

- **Contract**: `services/backend-api/src/features/aim/adapter/aim-engine-contract.spec.ts`
  (TypeScript side) vs. `services/aim-engine/app/schemas/aim_analysis_request.py`
  / `aim_analysis_response.py` (Pydantic side, `AimCamelCaseModel` with
  `alias_generator=to_camel`). Both sides confirmed to agree on the
  camelCase wire format by direct test-suite pass (backend jest, engine
  pytest) in this session.
- **Call pattern**: `AimPipelineOrchestratorService.trigger(...)` is called
  from `sessions.controller.ts:258` with `await` inside a `try/catch` — this
  is a **blocking, in-request-path call**, not fire-and-forget, despite a
  stale surrounding code comment that says "asynchronously." A failure is
  caught and downgraded to `aimOutcome: 'deferred'` so the HTTP response
  itself doesn't fail, but the student-facing response still waits on the
  AIM Engine round-trip. Confirmed by direct code read this session.
- **Engine statelessness**: aim-engine never queries a DB; every input
  (session context, attempt history, skill mastery context) is assembled by
  the backend (`aim-state-assembly.service.ts`) before the HTTP call, and
  every output is persisted back into Postgres by the backend
  (`aim-persistence.service.ts` and siblings under `features/aim/persistence/`)
  after response validation — the engine itself performs zero writes.

## Backend ↔ Supabase

- Backend connects via `DATABASE_URL` (Supabase connection pooler) using raw
  `pg.Pool` (`DatabaseService`), which uses a role that **bypasses RLS
  entirely** — confirmed this session by reading `database.service.ts` and
  by the fact that enabling RLS on 8 previously-exposed tables (this
  session's fix) did not change any backend test outcome (298/298 suites
  still passed after the change).
- Supabase Auth is used only for JWT issuance/verification; the backend
  independently re-verifies every JWT itself (`supabase-jwt-verifier.service.ts`,
  manual HS256/ES256+JWKS, no SDK) rather than trusting a client-side
  session.

## Frontend ↔ backend-api

- **Mobile**: calls bare backend paths (`/lessons`, `/placement`, `/aim/...`)
  via a real HTTP client with a bearer-token interceptor — confirmed by
  passing `core/networking` widget/unit tests this session (838/838 mobile
  tests green after installing Flutter 3.44.1 to verify).
- **admin-dashboard**: two real, distinct call mechanisms coexist — a typed
  `adminApiClient` wrapper (`lib/api/admin-*-api.ts`) used by most
  server-component pages, and an untyped `backendFetch`/`backendFetchJson`
  helper (proxied through a Next.js API route `/api/admin/proxy/...`) used
  by client-component pages (notably `operations/*` and `parents`). Both hit
  the same real backend; this is a real inconsistency in wrapper usage, not
  a functional gap — see `13-risk-register.md`.
- **student-web**: calls via `apiClient` built from `${REACT_APP_API_BASE_URL}${path}`.
  Two backend controller groups (`notifications`, `parents`) hardcode their
  own `api/v1/...` prefix in `@Controller()`, while every other controller
  is bare — no single `REACT_APP_API_BASE_URL` value makes both groups
  resolve correctly at once. Whether this is actually broken in the
  deployed environment depends on the real env var value, which is
  **Unknown** from the repo alone.
- **apps/web**: calls via its own `shared/api/client.js` and per-feature
  `api/*.js` clients; Supabase auth is used directly client-side via
  `@supabase/supabase-js` (`shared/supabase/client.js`), with a silent
  mock-client fallback if env vars are missing (logs an error, doesn't throw).

## AI Teacher / Voice Teacher unification (Phase 21)

- As of Phase 21 (`phase_history` in `project-memory.json`, fully merged),
  Voice Teacher turns are persisted into the same `ai_chat_messages` table
  used by AI Teacher text chat, via `AiChatMessageRepository`, confirmed by
  live DB row counts this session: `ai_chat_sessions` (26 rows) /
  `ai_chat_messages` (34 rows) have real data, while all 7 legacy `voice_*`
  tables (`voice_sessions`, `voice_messages`, `voice_transcripts`, etc.)
  have **0 rows** — matching the documented "historical/read-only as of
  P21-021" status.
- `VoiceOrchestratorService` depends on `AiTeacherOrchestratorService` and
  `AiChatMessageRepository` directly (see `12-dependency-map.md` for the
  full edge list).
- `VoiceMessageSubmitModule` (a separate, newer submission path) exists in
  the codebase but is **not imported by `VoiceTeacherModule`** — confirmed
  by direct grep this session; its own file header states this is
  intentional, pending a future controller (P9-068+).

## Single points of failure noted during this review

- The AIM Engine is a hard, synchronous dependency for any lesson/assessment/
  placement attempt submission that triggers `AimPipelineOrchestratorService`
  — if the engine is down or slow, the student-facing response is delayed
  (though not failed outright, since the failure path returns
  `aimOutcome: 'deferred'`). No feature flag exists to disable this call
  path (confirmed absent in `PROJECT_STATE.md` and not found in code this
  session).
