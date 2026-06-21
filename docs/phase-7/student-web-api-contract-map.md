# Phase 7 — Student Web API Contract Map

**Phase:** 7 (Deferred)
**Date:** 2026-06-21

## Purpose

Document all backend APIs consumed by the Student Web App. The web app is a client-only consumer — it never calls the database or AIM Engine directly.

## API Base

```
Base URL: configured via REACT_APP_API_BASE_URL
All requests include: Authorization: Bearer <access_token>
Content-Type: application/json
```

## Authentication APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| POST | `/api/auth/register` | `{ email, password, name }` | `{ user, session }` | Creates student account |
| POST | `/api/auth/login` | `{ email, password }` | `{ user, session }` | Returns access/refresh tokens |
| POST | `/api/auth/logout` | — | `{ success }` | Invalidates session |
| POST | `/api/auth/refresh` | `{ refreshToken }` | `{ session }` | Refreshes access token |
| POST | `/api/auth/forgot-password` | `{ email }` | `{ success }` | Sends reset email |
| POST | `/api/auth/reset-password` | `{ token, password }` | `{ success }` | Resets password |

## Profile & Settings APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/profile` | — | `{ user }` | Current user profile |
| PATCH | `/api/profile` | `{ name?, avatar?, locale? }` | `{ user }` | Update allowed fields |
| GET | `/api/settings` | — | `{ preferences }` | User preferences |
| PUT | `/api/settings` | `{ preferences }` | `{ preferences }` | Update preferences |

## Dashboard APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/students/me/dashboard` | — | `{ progress, recommendations, deadlines, activity }` | Aggregated dashboard data |
| GET | `/api/students/me/progress` | — | `{ mastery, completion, streak }` | Backend-computed progress |
| GET | `/api/students/me/skills` | — | `{ skills[] }` | Per-skill mastery and weakness |
| GET | `/api/students/me/recommendations` | — | `{ recommendations[] }` | Backend-generated recommendations |
| GET | `/api/students/me/activity` | `?limit&offset` | `{ activities[] }` | Recent activity feed |

## Placement APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/placement/status` | — | `{ status, sessionId? }` | Check placement status |
| POST | `/api/placement/start` | `{ subjectId? }` | `{ sessionId }` | Start placement session |
| GET | `/api/placement/:id/next` | — | `{ question }` | Next question from backend |
| POST | `/api/placement/:id/answer` | `{ questionId, answerId }` | `{ accepted }` | Submit answer — backend scores |
| GET | `/api/placement/:id/result` | — | `{ result }` | Backend-computed placement result |

## Curriculum APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/curriculum/subjects` | — | `{ subjects[] }` | All available subjects |
| GET | `/api/curriculum/subjects/:id/units` | — | `{ units[] }` | Units in a subject |
| GET | `/api/curriculum/units/:id/lessons` | — | `{ lessons[] }` | Lessons in a unit |

## Lesson APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/lessons/:id` | — | `{ lesson }` | Lesson metadata |
| GET | `/api/lessons/:id/content` | — | `{ content }` | Lesson content blocks |
| POST | `/api/lessons/:id/complete` | — | `{ progress }` | Mark lesson complete — backend updates progress |

## Practice APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| POST | `/api/practice/start` | `{ topicId?, type? }` | `{ sessionId }` | Start practice session |
| GET | `/api/practice/:id/next` | — | `{ question }` | Next practice question |
| POST | `/api/practice/:id/answer` | `{ questionId, answerId }` | `{ feedback }` | Submit — backend evaluates |
| GET | `/api/practice/:id/summary` | — | `{ summary }` | Backend-computed session summary |

## Assessment APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/assessments/available` | — | `{ assessments[] }` | Available assessments |
| POST | `/api/assessments/:id/start` | — | `{ sessionId }` | Start assessment |
| GET | `/api/assessments/:id/next` | — | `{ question }` | Next question |
| POST | `/api/assessments/:id/answer` | `{ questionId, answerId }` | `{ accepted }` | Submit — backend scores |
| POST | `/api/assessments/:id/submit` | — | `{ result }` | Finalize — backend computes result |
| GET | `/api/assessments/:id/result` | — | `{ result }` | Backend-computed assessment result |

## AI Teacher APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/ai-teacher/conversations` | — | `{ conversations[] }` | List conversations |
| POST | `/api/ai-teacher/conversations` | `{ topic? }` | `{ conversationId }` | Start new conversation |
| GET | `/api/ai-teacher/conversations/:id` | — | `{ messages[] }` | Conversation history |
| POST | `/api/ai-teacher/message` | `{ conversationId, content }` | `{ response }` | Send message, receive AI response |

## Notification APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/notifications` | `?read&limit&offset` | `{ notifications[], unreadCount }` | List notifications |
| PATCH | `/api/notifications/:id/read` | — | `{ success }` | Mark as read |
| PATCH | `/api/notifications/read-all` | — | `{ success }` | Mark all as read |
| GET | `/api/notifications/preferences` | — | `{ preferences }` | Notification preferences |
| PUT | `/api/notifications/preferences` | `{ preferences }` | `{ preferences }` | Update preferences |

## Billing APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/billing/subscription` | — | `{ subscription }` | Current plan and status |
| GET | `/api/billing/plans` | — | `{ plans[] }` | Available plans |
| GET | `/api/billing/payments` | `?limit&offset` | `{ payments[] }` | Payment history |

## Report APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| GET | `/api/reports/progress` | `?from&to` | `{ report }` | Backend-generated progress report |
| GET | `/api/reports/performance` | `?from&to` | `{ report }` | Backend-generated performance summary |

## Support APIs

| Method | Endpoint | Request | Response | Notes |
|--------|----------|---------|----------|-------|
| POST | `/api/support/tickets` | `{ subject, category, body }` | `{ ticket }` | Create support ticket |
| GET | `/api/support/tickets` | `?status&limit&offset` | `{ tickets[] }` | List own tickets |
| GET | `/api/support/tickets/:id` | — | `{ ticket, comments[] }` | Ticket detail |
| POST | `/api/support/tickets/:id/comments` | `{ body }` | `{ comment }` | Add comment |
| POST | `/api/support/feedback` | `{ category, rating, body }` | `{ feedback }` | Submit feedback |

## Error Response Contract

All endpoints return errors in a consistent format:

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Token expired"
}
```

| Status | Meaning | Web App Action |
|--------|---------|---------------|
| 400 | Bad Request | Show validation error |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show forbidden state |
| 404 | Not Found | Show not-found state |
| 429 | Rate Limited | Show retry message |
| 500 | Server Error | Show error state with retry |
