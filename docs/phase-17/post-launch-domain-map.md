# Phase 17 — Post-Launch Domain Map

**Document ID:** P17-002
**Phase:** 17 — Post-Launch Operations
**Author:** GHOST3030
**Date:** 2026-06-21
**Dependency:** P17-001

---

## Purpose

Document all post-launch operations domain entities including incidents, support tickets, feedback, feature requests, maintenance windows, release notes, operational status, and audit records. This map establishes the canonical domain for Phase 17 operations.

---

## 1. Domain Entity Overview

| Entity | Owner | Visibility | Mutability |
|--------|-------|------------|------------|
| Incident | Backend/Admin | Admin + public status | Admin-only write |
| Support Ticket | Backend/Admin | Submitter + admin | User create; admin triage/resolve |
| Feedback | Backend/Admin | Submitter + admin | User create; admin categorize |
| Feature Request | Backend/Admin | Submitter + admin + voters | User create/vote; admin triage |
| Maintenance Window | Backend/Admin | Admin + public notice | Admin-only CRUD |
| Release Note | Backend/Admin | Admin draft + public read | Admin-only publish |
| Operational Status | Backend/Admin | Admin + public page | Admin-only update |
| Audit Record | Backend/Admin | Admin-only | System-generated; immutable |

---

## 2. Incident Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique incident identifier |
| title | string | Short incident summary |
| severity | enum | P0 (critical), P1 (major), P2 (minor), P3 (cosmetic) |
| status | enum | detected, investigating, mitigated, resolved, post-mortem |
| affected_services | string[] | List of affected platform services |
| started_at | timestamp | Incident start time |
| resolved_at | timestamp | Incident resolution time (nullable) |
| created_by | UUID | Admin who created the record |
| updates | IncidentUpdate[] | Chronological status updates |
| post_mortem_url | string | Link to post-mortem document (nullable) |

**Authority:** Admin-only CRUD. Public read for status page display.

---

## 3. Support Ticket Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique ticket identifier |
| subject | string | Ticket subject line |
| description | text | Detailed issue description |
| category | enum | account, billing, technical, content, accessibility, other |
| severity | enum | P0, P1, P2, P3 |
| status | enum | open, in_progress, waiting_on_user, resolved, closed |
| submitted_by | UUID | User who submitted |
| assigned_to | UUID | Admin/agent assigned (nullable) |
| created_at | timestamp | Submission time |
| updated_at | timestamp | Last update time |
| resolution_notes | text | Internal resolution notes (admin-only) |

**Authority:** Users create and view own tickets. Admin owns triage, assignment, status changes, and resolution.

---

## 4. Feedback Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique feedback identifier |
| type | enum | bug_report, usability, performance, content, general |
| message | text | Feedback content |
| submitted_by | UUID | User who submitted |
| status | enum | received, reviewed, actionable, deferred, archived |
| admin_notes | text | Internal admin notes |
| created_at | timestamp | Submission time |
| screenshot_url | string | Optional screenshot attachment (nullable) |

**Authority:** Users submit and view own feedback. Admin categorizes and reviews.

---

## 5. Feature Request Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique request identifier |
| title | string | Short feature title |
| description | text | Detailed feature description |
| submitted_by | UUID | User who submitted |
| vote_count | integer | Number of user votes |
| status | enum | submitted, under_review, planned, in_progress, shipped, declined |
| priority | enum | low, medium, high, critical |
| admin_response | text | Official response (nullable) |
| created_at | timestamp | Submission time |

**Authority:** Users submit and vote. Admin owns triage, priority, status, and response.

---

## 6. Maintenance Window Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique window identifier |
| title | string | Maintenance description |
| type | enum | planned, emergency |
| scheduled_start | timestamp | Planned start time |
| scheduled_end | timestamp | Planned end time |
| actual_start | timestamp | Actual start (nullable) |
| actual_end | timestamp | Actual end (nullable) |
| affected_services | string[] | Services affected |
| notice_sent_at | timestamp | When user notice was sent |
| status | enum | scheduled, in_progress, completed, cancelled |
| created_by | UUID | Admin who scheduled |

**Authority:** Admin-only CRUD. Public read for advance notice and status.

---

## 7. Release Note Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique release note identifier |
| version | string | Release version (e.g., 1.2.0) |
| title | string | Release title |
| body | text | Markdown release notes content |
| status | enum | draft, published, archived |
| published_at | timestamp | Publication timestamp (nullable) |
| created_by | UUID | Admin author |
| tags | string[] | Categorization tags (feature, fix, improvement) |

**Authority:** Admin-only publish. Public read after publication.

---

## 8. Operational Status Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique status record identifier |
| service_name | string | Platform service name |
| status | enum | operational, degraded, partial_outage, major_outage, maintenance |
| message | string | Status description |
| updated_at | timestamp | Last update time |
| updated_by | UUID | Admin who updated |
| linked_incident_id | UUID | Related incident (nullable) |
| linked_maintenance_id | UUID | Related maintenance window (nullable) |

**Authority:** Admin-only update. Public read on status page.

---

## 9. Audit Record Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique audit record identifier |
| actor_id | UUID | User or system that performed the action |
| actor_type | enum | user, admin, system |
| action | string | Action performed (e.g., ticket.created, incident.resolved) |
| entity_type | string | Target entity type |
| entity_id | UUID | Target entity identifier |
| metadata | jsonb | Additional context |
| created_at | timestamp | Event timestamp |
| ip_address | string | Actor IP (hashed for privacy) |

**Authority:** System-generated. Admin read-only. Immutable after creation.

---

## 10. Domain Relationships

| Source Entity | Relationship | Target Entity |
|---------------|-------------|---------------|
| Incident | links to | Operational Status |
| Maintenance Window | links to | Operational Status |
| Support Ticket | may reference | Incident |
| Feedback | may escalate to | Feature Request |
| Feature Request | may link to | Release Note |
| Audit Record | references | All entities |
| Incident | generates | Audit Record |
| Support Ticket | generates | Audit Record |

---

## Verdict

This domain map defines all post-launch operations entities for Phase 17. All entities follow the authority model: backend/admin owns mutation; client UI renders read-only state. Audit records are system-generated and immutable. No entity in this map introduces new product features outside the post-launch operations scope.
