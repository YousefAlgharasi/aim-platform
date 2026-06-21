# Phase 12 — Parent API Contract Map

**Date:** 2026-06-20
**Task:** P12-006
**Author:** GHOST3030
**Dependencies:** P12-002 (Domain Map), P12-005 (Route Permission Map)

---

## 1. Purpose

Document all backend APIs required by the parent dashboard UI. This contract aligns backend and frontend before implementation. All endpoints require authentication with role = `parent`.

---

## 2. Base URL

```
/api/v1/parent
```

All parent endpoints are namespaced under this prefix.

---

## 3. Authentication

All requests must include:

```
Authorization: Bearer <jwt>
```

The JWT must contain `role: "parent"` and a valid `user_id`.

---

## 4. Common Response Shapes

### Success Response

```json
{
  "data": { ... },
  "meta": { "timestamp": "ISO-8601" }
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 100,
    "total_pages": 5,
    "timestamp": "ISO-8601"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied"
  }
}
```

---

## 5. Parent Profile APIs

### GET /api/v1/parent/profile

**Guards:** Auth
**Response:**

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "display_name": "string",
    "email": "string",
    "phone": "string | null",
    "onboarding_completed": true,
    "created_at": "ISO-8601",
    "updated_at": "ISO-8601"
  }
}
```

### PUT /api/v1/parent/profile

**Guards:** Auth
**Body:**

```json
{
  "display_name": "string",
  "phone": "string | null"
}
```

**Response:** Updated profile object.

---

## 6. Children APIs

### GET /api/v1/parent/children

**Guards:** Auth
**Description:** List all children with active links.
**Response:**

```json
{
  "data": [
    {
      "child_id": "uuid",
      "display_name": "string",
      "grade_level": "string",
      "link_id": "uuid",
      "relationship_type": "parent | guardian | other",
      "link_status": "active",
      "consent_summary": {
        "progress_view": true,
        "assessment_view": false,
        "activity_view": true,
        "report_view": false,
        "full_access": false
      }
    }
  ]
}
```

---

## 7. Invitation APIs

### GET /api/v1/parent/invitations

**Guards:** Auth
**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "child_email": "string | null",
      "child_id": "uuid | null",
      "relationship_type": "parent | guardian | other",
      "status": "pending | accepted | rejected | expired | cancelled",
      "expires_at": "ISO-8601",
      "accepted_at": "ISO-8601 | null",
      "created_at": "ISO-8601"
    }
  ]
}
```

### POST /api/v1/parent/invitations

**Guards:** Auth
**Body:**

```json
{
  "child_email": "string",
  "relationship_type": "parent | guardian | other"
}
```

**Response:** Created invitation object.

### POST /api/v1/parent/invitations/:id/cancel

**Guards:** Auth (must be invitation owner)
**Response:** Updated invitation with status = `cancelled`.

---

## 8. Child Progress APIs

### GET /api/v1/parent/children/:childId/overview

**Guards:** Auth + Link + Consent(`progress_view` | `full_access`)
**Response:**

```json
{
  "data": {
    "child_id": "uuid",
    "display_name": "string",
    "overall_progress_percent": 65,
    "courses_enrolled": 3,
    "lessons_completed": 42,
    "current_level": "string",
    "last_activity_date": "ISO-8601 | null",
    "active_weaknesses_count": 2,
    "upcoming_deadlines_count": 1
  }
}
```

### GET /api/v1/parent/children/:childId/progress

**Guards:** Auth + Link + Consent(`progress_view` | `full_access`)
**Query params:** `?page=1&page_size=20`
**Response:**

```json
{
  "data": [
    {
      "course_id": "uuid",
      "course_name": "string",
      "progress_percent": 75,
      "lessons_total": 20,
      "lessons_completed": 15,
      "last_activity_date": "ISO-8601 | null"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 3, "total_pages": 1 }
}
```

---

## 9. Child Skill APIs

### GET /api/v1/parent/children/:childId/skills

**Guards:** Auth + Link + Consent(`progress_view` | `full_access`)
**Query params:** `?page=1&page_size=20&state=mastered|learning|weak|new`
**Response:**

```json
{
  "data": [
    {
      "skill_id": "uuid",
      "skill_name": "string",
      "mastery_level": "mastered | learning | weak | new",
      "confidence_score": 0.85,
      "last_reviewed": "ISO-8601 | null",
      "next_review": "ISO-8601 | null"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 50, "total_pages": 3 }
}
```

---

## 10. Child Weakness APIs

### GET /api/v1/parent/children/:childId/weaknesses

**Guards:** Auth + Link + Consent(`progress_view` | `full_access`)
**Response:**

```json
{
  "data": [
    {
      "weakness_id": "uuid",
      "skill_name": "string",
      "severity": "high | medium | low",
      "recommendation_text": "string",
      "recommended_action": "string",
      "detected_at": "ISO-8601"
    }
  ]
}
```

---

## 11. Child Assessment APIs

### GET /api/v1/parent/children/:childId/assessments

**Guards:** Auth + Link + Consent(`assessment_view` | `full_access`)
**Query params:** `?page=1&page_size=20`
**Response:**

```json
{
  "data": [
    {
      "assessment_id": "uuid",
      "assessment_name": "string",
      "type": "quiz | exam",
      "score": 85,
      "max_score": 100,
      "pass_fail": "pass | fail",
      "attempt_date": "ISO-8601",
      "attempt_number": 1
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 10, "total_pages": 1 }
}
```

### GET /api/v1/parent/children/:childId/deadlines

**Guards:** Auth + Link + Consent(`assessment_view` | `full_access`)
**Response:**

```json
{
  "data": [
    {
      "assessment_id": "uuid",
      "assessment_name": "string",
      "deadline_date": "ISO-8601",
      "is_overdue": false,
      "status": "upcoming | due_soon | overdue | completed"
    }
  ]
}
```

---

## 12. Child Activity APIs

### GET /api/v1/parent/children/:childId/activity

**Guards:** Auth + Link + Consent(`activity_view` | `full_access`)
**Query params:** `?page=1&page_size=20&from=ISO-8601&to=ISO-8601`
**Response:**

```json
{
  "data": [
    {
      "activity_date": "ISO-8601",
      "activity_type": "lesson | quiz | review | practice",
      "duration_minutes": 25,
      "lesson_name": "string | null",
      "course_name": "string | null"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 100, "total_pages": 5 }
}
```

---

## 13. Child Report APIs

### GET /api/v1/parent/children/:childId/reports

**Guards:** Auth + Link + Consent(`report_view` | `full_access`)
**Response:**

```json
{
  "data": [
    {
      "report_id": "uuid",
      "report_type": "weekly | monthly",
      "report_period": "string",
      "summary": {
        "lessons_completed": 12,
        "time_spent_minutes": 300,
        "skills_improved": 5,
        "weaknesses_resolved": 2
      },
      "generated_at": "ISO-8601"
    }
  ]
}
```

---

## 14. Consent APIs

### GET /api/v1/parent/children/:childId/consent

**Guards:** Auth + Link
**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "consent_type": "progress_view | assessment_view | activity_view | report_view | full_access",
      "status": "granted | revoked",
      "granted_at": "ISO-8601",
      "revoked_at": "ISO-8601 | null",
      "granted_by": "uuid"
    }
  ]
}
```

---

## 15. Notification Preference APIs

### GET /api/v1/parent/preferences

**Guards:** Auth
**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "channel": "email | sms | push",
      "category": "progress_update | assessment_result | deadline_reminder | weekly_summary | system_alert",
      "enabled": true
    }
  ]
}
```

### PUT /api/v1/parent/preferences

**Guards:** Auth
**Body:**

```json
{
  "preferences": [
    {
      "channel": "email",
      "category": "progress_update",
      "enabled": true
    }
  ]
}
```

**Response:** Updated preferences array.

---

## 16. Error Codes

| HTTP Status | Code | Description |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 403 | `FORBIDDEN` | Access denied (link, consent, or scope failure) |
| 404 | `NOT_FOUND` | Resource not found (only for parent-owned resources) |
| 422 | `VALIDATION_ERROR` | Invalid request body |
| 500 | `INTERNAL_ERROR` | Server error |

**Note:** Child-scoped endpoints return 403 (not 404) when the child does not exist or is not linked, to prevent enumeration.
