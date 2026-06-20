# Phase 13 — Notification Privacy Rules

Defines safe notification content, payload restrictions, parent/child privacy
boundaries, and audit expectations. These rules apply to every notification
template, event payload, digest, and audit log entry created in Phase 13.

## Dependencies

- `docs/phase-13/notification-domain-map.md` (P13-002)
- `docs/phase-12/parent-privacy-consent-rules.md` (P12 privacy outputs)
- `docs/phase-12/parent-data-retention-rules.md` (P12-077)

## Safe Content Rules

A notification payload (template-rendered title/body, in-app payload JSON, push
payload, email body, digest content, audit metadata) must never contain:

- Secrets, API keys, provider keys, service-role keys, or database credentials.
- Full sensitive answers (e.g. a student's submitted assessment answer text).
- Raw AIM outputs (model completions, internal reasoning, scoring internals).
- Sensitive assessment payloads (question content, detailed scoring breakdowns).
- Private child data beyond what the recipient is independently entitled to see.

Notification content must be **summary-level** only: e.g. "Your weekly progress
summary is ready," "A new assessment deadline is approaching," "Sara completed
today's lesson" — never the underlying answer, score breakdown, or AI-generated
text itself. Deep-linking into the app for detail view is the correct pattern,
not embedding detail in the notification.

## Parent/Child Privacy

- A parent notification about a child's activity may only be generated for a
  child the parent has an active `parent_child_link` with **and** the relevant
  consent type granted (see Phase 12 consent types: `progress_view`,
  `assessment_view`, `activity_view`, `report_view`, `full_access`).
- Revoking consent or the underlying link must stop future parent notifications
  about that child; the backend re-validates consent at dispatch time, not only
  at schedule-creation time.
- Parent notifications never include another child's data, even if the parent
  has multiple linked children — each notification is scoped to one child.
- Parent summaries follow the same minimal-data-exposure principle as Phase 12
  parent dashboard APIs: summary-level signals only, never raw internal records.

## Template Content Safety

- `NotificationTemplate.body_template` may only use placeholders for safe,
  pre-approved fields (e.g. `{{student_first_name}}`, `{{lesson_title}}`,
  `{{deadline_date}}`). Placeholders resolving to sensitive fields (answers,
  scores breakdowns, AI text) are not permitted.
- Template content is authored/approved through backend admin tooling, not
  submitted by end-user clients.

## Audit Expectations

- `NotificationAuditLog.metadata` must be safe and non-sensitive: it may record
  *that* a preference changed, a token was registered, or a delivery was
  attempted, with safe identifiers (entity ids, action names, timestamps) —
  never the notification body content, provider credentials, or child personal
  data beyond an opaque reference id.
- Audit logs are retained per the same data-retention posture as Phase 12
  parent audit logs (see `docs/phase-12/parent-data-retention-rules.md`);
  Phase 13 does not loosen retention or visibility beyond what Phase 12
  established for related data.

## Provider Secrets

- Provider credentials (push/email provider API keys) are never stored on
  notification rows, never logged, and never included in audit metadata.
  Delivery attempts record only a provider *name* (e.g. `"fcm"`, `"smtp"`) and
  safe error codes.

## Enforcement

Any task that introduces a new notification payload field, template
placeholder, or audit metadata field must be checked against this document
before merging. Violations are a stop condition per the Phase 13 master
instruction.
