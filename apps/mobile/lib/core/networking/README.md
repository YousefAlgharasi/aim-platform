# Flutter Backend API Client Foundation

P1-042 adds a Backend API client foundation for Flutter Mobile.

## Scope

This foundation supports:

- Backend API base URL config through `AppConfig`
- response-envelope parsing
- error-envelope parsing
- safe `GET` and `POST` helpers
- typed data decoding

## Backend API Only

Flutter Mobile must call the Backend API only.

Do not call:

- AIM Engine directly
- AI Teacher providers directly
- AI provider APIs directly
- Supabase service-role endpoints
- database URLs directly

## Response Envelope

The client expects the backend shared response envelope shape:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-01-01T00:00:00.000Z",
    "path": "/health",
    "method": "GET",
    "requestId": "request-id"
  }
}
```

Error responses are parsed from:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {}
  },
  "meta": {}
}
```

## No Feature APIs

This task does not add feature-specific API clients for auth, placement, lessons, practice, AI Teacher, reviews, progress, notifications, or profile.
