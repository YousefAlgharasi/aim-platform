# Student Web Config and Environment Setup

**Task:** P7-011
**Date:** 2026-06-21

## Environment Variables

All environment variables use the `REACT_APP_` prefix (CRA convention) and contain only public, client-safe values.

| Variable | Purpose | Secret? |
|----------|---------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | No — public endpoint |
| `REACT_APP_SUPABASE_URL` | Supabase project URL | No — public |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase public anon key | No — designed for browser use |

## Prohibited Values

The following must NEVER appear in client environment or code:

- `SUPABASE_SERVICE_ROLE_KEY`
- Database connection strings (`DATABASE_URL`, `POSTGRES_*`)
- Provider API keys (`OPENAI_API_KEY`, etc.)
- JWT signing secrets
- Any `*_SECRET` or `*_PRIVATE_KEY` variable

## Files

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.example` | Yes | Template with placeholder values |
| `.env` | No (.gitignore) | Local development values |
| `.env.local` | No (.gitignore) | Local overrides |
| `.env.production` | No (.gitignore) | Production values (set in CI/CD) |

## Config Module

`src/config/env.ts` exports a typed `config` object that validates all required env vars at startup. Missing variables throw immediately rather than failing silently at runtime.
