# AIM Platform — Backend Plan

> **Status:** Stub — to be completed in a dedicated planning task.

## Responsibilities

The backend (AIM Engine) is the single source of truth for:
- Adaptive scoring and skill progression
- Session creation and management
- Content delivery (exercises, audio, prompts)
- AI Teacher proxying (all LLM calls)
- User authentication and authorization
- Analytics event ingestion

## Technology Stack (Proposed)

| Layer | Technology |
|---|---|
| Runtime | Node.js / Python (TBD) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage (audio/media) |
| AI Proxy | Anthropic API (server-side only) |
| Hosting | TBD (cloud deployment phase) |

## API Design Principles

- RESTful endpoints, versioned under `/api/v1/`
- All responses follow a consistent envelope: `{ data, error, meta }`
- Auth via Bearer JWT on all protected routes
- No adaptive parameters exposed to clients — the engine decides next content

## Sections To Complete

- [ ] Full endpoint list with request/response contracts
- [ ] Auth middleware design
- [ ] AIM Engine algorithm specification
- [ ] Rate limiting and abuse prevention
- [ ] Error codes and client error handling guide

---
*Last updated: 2026-06-09*
