# Phase 12 — Parent Domain Map

**Date:** 2026-06-20
**Task:** P12-002
**Author:** GHOST3030
**Dependency:** P12-001 (Parent Dashboard Charter)

---

## 1. Overview

This document defines the domain entities, relationships, and boundaries for the Parent Dashboard. All entities are managed by the backend. The parent UI consumes read-only views of child data and manages parent-specific actions (linking, consent, preferences) through protected APIs.

---

## 2. Core Entities

### 2.1 Parent / Guardian

Represents a parent or guardian user registered on the AIM Platform.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users — the authenticated user |
| display_name | string | Parent display name |
| email | string | Parent email (from auth) |
| phone | string (nullable) | Optional contact phone |
| role | enum | Always `parent` |
| onboarding_completed | boolean | Whether parent onboarding is complete |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

**Rules:**
- A parent user has role = `parent` in the auth system.
- One auth user maps to one parent record.
- Parent cannot also be a student or admin on the same account.

### 2.2 Child (Student Reference)

The parent dashboard references students (children) through the `parent_child_links` entity. The student entity itself is owned by earlier phases. The parent domain does not create or modify student records.

| Referenced Field | Type | Source |
|---|---|---|
| student_id | UUID | FK to students table (existing) |
| display_name | string | From student profile |
| grade_level | string | From student profile |

**Rules:**
- Parent sees only linked and consented children.
- Parent cannot create, modify, or delete student records.

### 2.3 Parent-Child Link

Represents a verified relationship between a parent/guardian and a student.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| parent_id | UUID | FK to parent record |
| child_id | UUID | FK to student record |
| relationship_type | enum | `parent`, `guardian`, `other` |
| status | enum | `pending`, `active`, `revoked` |
| linked_at | timestamp | When the link was established |
| revoked_at | timestamp (nullable) | When the link was revoked |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

**Rules:**
- A link must be `active` for the parent to access child data.
- Links are established through the invitation workflow.
- Revoking a link immediately removes access.
- Backend validates link status on every child-scoped request.
- Unique constraint: one active link per (parent_id, child_id) pair.

### 2.4 Consent

Represents the parent's consent to view specific categories of child data.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| parent_child_link_id | UUID | FK to parent_child_links |
| consent_type | enum | `progress_view`, `assessment_view`, `activity_view`, `report_view`, `full_access` |
| status | enum | `granted`, `revoked` |
| granted_at | timestamp | When consent was granted |
| revoked_at | timestamp (nullable) | When consent was revoked |
| granted_by | UUID | The user who granted consent (student or admin) |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

**Rules:**
- Consent is required in addition to an active link.
- Consent can be granular (per data category) or full access.
- Revoking consent immediately removes access to that data category.
- Backend checks consent on every child-scoped data request.
- Only the consent grantor (student or admin) can revoke consent.

### 2.5 Invitation

Represents a pending invitation from a parent to link with a child.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| parent_id | UUID | FK to parent record (inviter) |
| child_email | string (nullable) | Email to identify the child/student |
| child_id | UUID (nullable) | FK to student record (if already identified) |
| invitation_code | string | Unique code for the invitation |
| status | enum | `pending`, `accepted`, `rejected`, `expired`, `cancelled` |
| relationship_type | enum | `parent`, `guardian`, `other` |
| expires_at | timestamp | When the invitation expires |
| accepted_at | timestamp (nullable) | When accepted |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

**Rules:**
- A parent sends an invitation; the child/student (or admin) accepts or rejects.
- Accepting an invitation creates a `parent_child_link` with status `active`.
- Expired invitations cannot be accepted.
- Invitation codes are unique and unguessable.
- A parent cannot send duplicate pending invitations to the same child.

### 2.6 Notification Preference

Represents parent preferences for future notification delivery (Phase 13 delivers actual sending).

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| parent_id | UUID | FK to parent record |
| channel | enum | `email`, `sms`, `push` |
| category | enum | `progress_update`, `assessment_result`, `deadline_reminder`, `weekly_summary`, `system_alert` |
| enabled | boolean | Whether this notification type is enabled |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Last update time |

**Rules:**
- Preferences are stored in Phase 12 but sending is not implemented until Phase 13.
- Each parent can configure preferences per channel and category.
- Defaults are set during onboarding.

---

## 3. Visibility Entities (Read-Only from Parent Perspective)

The parent dashboard displays the following data categories. All are sourced from the backend and are read-only in the parent UI.

### 3.1 Child Progress Summary

| Field | Source | Parent Access |
|---|---|---|
| overall_progress | Backend calculation | Read-only |
| courses_enrolled | Backend query | Read-only |
| lessons_completed | Backend count | Read-only |
| current_level | Backend determination | Read-only |
| last_activity_date | Backend query | Read-only |

### 3.2 Skill States

| Field | Source | Parent Access |
|---|---|---|
| skill_id | Skills table | Read-only |
| skill_name | Skills table | Read-only |
| mastery_level | Backend AIM calculation | Read-only |
| state | Backend AIM determination | Read-only |
| last_reviewed | Backend tracking | Read-only |

### 3.3 Weaknesses and Recommendations

| Field | Source | Parent Access |
|---|---|---|
| weakness_id | Weakness records | Read-only |
| skill_name | Skills table | Read-only |
| severity | Backend AIM calculation | Read-only |
| recommendation_text | Backend AIM generation | Read-only |
| recommended_action | Backend AIM output | Read-only |

### 3.4 Assessment Results

| Field | Source | Parent Access |
|---|---|---|
| assessment_name | Assessments table | Read-only |
| score | Backend grading | Read-only |
| pass_fail | Backend determination | Read-only |
| attempt_date | Assessment attempts | Read-only |
| max_score | Assessment settings | Read-only |

### 3.5 Deadlines

| Field | Source | Parent Access |
|---|---|---|
| assessment_name | Assessments table | Read-only |
| deadline_date | Assessment deadlines | Read-only |
| is_overdue | Backend calculation | Read-only |
| status | Backend determination | Read-only |

### 3.6 Learning Activity

| Field | Source | Parent Access |
|---|---|---|
| activity_date | Session logs | Read-only |
| activity_type | Backend classification | Read-only |
| duration_minutes | Backend calculation | Read-only |
| lesson_name | Curriculum tables | Read-only |
| course_name | Curriculum tables | Read-only |

### 3.7 Parent Reports

| Field | Source | Parent Access |
|---|---|---|
| report_type | Backend generation | Read-only |
| report_period | Backend definition | Read-only |
| summary_data | Backend aggregation | Read-only |
| generated_at | Backend timestamp | Read-only |

---

## 4. Entity Relationships

```
Parent (user)
  ├── has many → Parent-Child Links
  │     ├── belongs to → Child (student)
  │     └── has many → Consents
  ├── has many → Invitations
  │     └── targets → Child (student)
  └── has many → Notification Preferences

Parent-Child Link (active + consented)
  └── enables read-only access to:
        ├── Child Progress Summary
        ├── Skill States
        ├── Weaknesses and Recommendations
        ├── Assessment Results
        ├── Deadlines
        ├── Learning Activity
        └── Parent Reports
```

---

## 5. Access Control Model

### Access Chain

Every parent data request must pass all four guards:

1. **Auth Guard** — Valid JWT, role = `parent`
2. **Relationship Guard** — Active `parent_child_link` exists for (parent, child)
3. **Consent Guard** — Active consent exists for the requested data category
4. **Child-Scope Guard** — Response filtered to only the requested child's data

### Access Matrix

| Action | Auth | Link | Consent | Scope |
|---|---|---|---|---|
| View child progress | Required | Active | `progress_view` or `full_access` | Child-scoped |
| View skill states | Required | Active | `progress_view` or `full_access` | Child-scoped |
| View weaknesses | Required | Active | `progress_view` or `full_access` | Child-scoped |
| View assessments | Required | Active | `assessment_view` or `full_access` | Child-scoped |
| View deadlines | Required | Active | `assessment_view` or `full_access` | Child-scoped |
| View activity | Required | Active | `activity_view` or `full_access` | Child-scoped |
| View reports | Required | Active | `report_view` or `full_access` | Child-scoped |
| Send invitation | Required | N/A | N/A | Own invitations |
| Manage consent UI | Required | Active | N/A | Own consents |
| Manage preferences | Required | N/A | N/A | Own preferences |

---

## 6. Domain Boundaries

### Parent Domain Owns

- Parent profile and onboarding state
- Parent-child links
- Invitations
- Consent records
- Notification preferences
- Parent access audit logs

### Parent Domain Reads (Does Not Own)

- Student profiles
- Progress data
- Skill states
- Weakness records
- Recommendations
- Assessment results and deadlines
- Learning activity logs
- Curriculum metadata (course/lesson names)
- AIM engine outputs

### Parent Domain Does Not Touch

- Student creation or modification
- Curriculum publishing
- Assessment grading or scoring
- AIM engine calculations
- Admin operations
- Notification delivery (Phase 13)
- Payments (Phase 14)
- AI Teacher interactions
- Voice AI

---

## 7. Audit Entity

### Parent Access Log

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| parent_id | UUID | FK to parent record |
| child_id | UUID | FK to student record |
| action | string | What the parent accessed or did |
| resource_type | string | Entity type accessed |
| ip_address | string (nullable) | Request IP |
| user_agent | string (nullable) | Request user agent |
| created_at | timestamp | When the access occurred |

**Rules:**
- Every child-scoped data access is logged.
- Logs are append-only and immutable.
- Logs are available for compliance and security review.
