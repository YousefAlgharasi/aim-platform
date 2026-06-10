# Backend OpenAPI Foundation

This folder owns the Phase 1 Swagger/OpenAPI setup for `services/backend-api`.

## Scope

The OpenAPI document is intentionally limited to implemented foundation endpoints and stable placeholder tags.
It must not invent full API behavior for future modules.

## Runtime paths

- Swagger UI: `/docs`
- OpenAPI JSON: `/docs-json`

By default, Swagger is enabled outside production. In production, set `OPENAPI_ENABLED=true` only when docs are intentionally exposed behind the correct infrastructure controls.

## Security rules

- Do not document real secrets.
- Do not expose Supabase service-role keys.
- Do not expose database URLs.
- Do not expose provider keys.
- Do not document internal AIM analytics fields as client-owned fields.
- Use bearer auth documentation only for normal Supabase access JWTs.
