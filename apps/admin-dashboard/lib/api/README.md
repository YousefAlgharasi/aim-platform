# Admin API Client Foundation

P1-049 adds the Admin Dashboard Backend API client foundation.

## Scope

This foundation includes:

- Backend API base URL configuration.
- Response envelope parsing.
- Error envelope parsing.
- Typed `GET` and `POST` helpers.
- Safe client-side error type.

## Backend API Only

The Admin Dashboard must use the Backend API only.

Do not call:

- Supabase database URLs directly.
- Supabase service-role endpoints.
- AIM Engine directly.
- AI Teacher providers directly.
- OpenAI or other AI providers directly.

## Environment

The only configured public value is:

```text
NEXT_PUBLIC_BACKEND_API_BASE_URL
```

This value must not contain secrets.

## No Secrets

Never expose these in the Admin Dashboard:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
SUPABASE_JWT_SECRET
AI_PROVIDER_API_KEY
OPENAI_API_KEY
AIM_ENGINE_URL
```

## Authorization Boundary

Admin UI checks are UX-only.

Backend API authorization remains the final authority for:

- admin access
- content manager access
- human reviewer access
- project owner access
- learner data access
- report data access

## Non-goals

This task does not add:

- real admin modules
- auth/session integration
- API endpoint-specific clients
- data fetching hooks
- role-based menu behavior
- production dashboard workflows
