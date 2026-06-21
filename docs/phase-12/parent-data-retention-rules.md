# Phase 12 — Parent Data Retention Rules

**Date:** 2026-06-20
**Task:** P12-008
**Author:** GHOST3030
**Dependency:** P12-003 (Privacy and Consent Rules)

---

## 1. Purpose

Document retention and audit expectations for parent-child access records, invitations, consent records, and parent access logs. These rules prepare safe data lifecycle handling for the parent dashboard.

---

## 2. Retention Categories

### 2.1 Parent Profile

| Data | Retention Period | Deletion Trigger |
|---|---|---|
| Parent profile record | Account lifetime | Account deletion request |
| Display name, email, phone | Account lifetime | Account deletion request |
| Onboarding state | Account lifetime | Account deletion request |

**Rules:**
- Parent profile is retained as long as the account is active.
- On account deletion, profile data is removed or anonymized.

### 2.2 Parent-Child Links

| Data | Retention Period | Deletion Trigger |
|---|---|---|
| Active links | While active | Revocation by parent, student, or admin |
| Revoked links | 90 days after revocation | Automated cleanup |
| Link metadata (relationship_type, linked_at) | Same as link record | Same as link record |

**Rules:**
- Active links are retained indefinitely while in use.
- Revoked links are soft-deleted (status = `revoked`) and retained for 90 days for audit purposes.
- After 90 days, revoked link records may be hard-deleted or anonymized.
- Revocation timestamp (`revoked_at`) is preserved during the retention window.

### 2.3 Invitations

| Data | Retention Period | Deletion Trigger |
|---|---|---|
| Pending invitations | Until expiry (configurable, default 7 days) | Expiry timer |
| Accepted invitations | 90 days after acceptance | Automated cleanup |
| Rejected invitations | 30 days after rejection | Automated cleanup |
| Expired invitations | 30 days after expiry | Automated cleanup |
| Cancelled invitations | 30 days after cancellation | Automated cleanup |

**Rules:**
- Pending invitations expire automatically after the configured period.
- Invitation codes are invalidated on expiry, rejection, or cancellation.
- Accepted invitations are retained longer for audit trail purposes.
- After retention periods, invitation records may be hard-deleted.

### 2.4 Consent Records

| Data | Retention Period | Deletion Trigger |
|---|---|---|
| Active consents | While active | Revocation by grantor |
| Revoked consents | 90 days after revocation | Automated cleanup |
| Consent metadata (granted_by, granted_at) | Same as consent record | Same as consent record |

**Rules:**
- Active consents are retained indefinitely while in use.
- Revoked consents are soft-deleted and retained for 90 days for compliance.
- Consent grant/revoke events are logged in the audit trail (see 2.5).
- After retention, revoked consent records may be anonymized.

### 2.5 Parent Access Logs (Audit Trail)

| Data | Retention Period | Deletion Trigger |
|---|---|---|
| Access log entries | 365 days (1 year) | Automated cleanup |
| Log metadata (parent_id, child_id, action, timestamp) | 365 days | Automated cleanup |
| IP address, user agent | 90 days | Automated cleanup (PII reduction) |

**Rules:**
- Audit logs are append-only and immutable — no updates or deletes during retention.
- PII fields (IP, user agent) are removed or anonymized after 90 days.
- Core audit data (who accessed what, when) is retained for 1 year.
- Logs older than 1 year may be archived or deleted.
- Audit logs are accessible only to admins.

### 2.6 Notification Preferences

| Data | Retention Period | Deletion Trigger |
|---|---|---|
| Preference records | Account lifetime | Account deletion request |

**Rules:**
- Preferences are retained as long as the parent account exists.
- On account deletion, preferences are deleted with the account.

---

## 3. Data Lifecycle Events

### 3.1 Account Deletion

When a parent requests account deletion:

1. All active parent-child links are revoked.
2. All pending invitations are cancelled.
3. All active consents are revoked (by system).
4. Parent profile is anonymized or deleted.
5. Notification preferences are deleted.
6. Audit logs retain anonymized entries for the retention period.

### 3.2 Child Link Revocation

When a parent-child link is revoked:

1. Link status set to `revoked`, `revoked_at` recorded.
2. All consents for that link are revoked.
3. Parent immediately loses access to child data.
4. Revocation is logged in audit trail.
5. After 90 days, revoked link and consent records are eligible for cleanup.

### 3.3 Consent Revocation

When consent is revoked:

1. Consent status set to `revoked`, `revoked_at` recorded.
2. Parent immediately loses access to the data category.
3. Revocation is logged in audit trail.
4. UI shows "consent revoked" state on next request.

---

## 4. Cleanup Schedule

| Task | Frequency | Action |
|---|---|---|
| Expire pending invitations | Daily | Set status = `expired` for past-due invitations |
| Clean expired/rejected/cancelled invitations | Weekly | Delete records past retention period |
| Clean revoked links | Weekly | Delete records past 90-day retention |
| Clean revoked consents | Weekly | Delete records past 90-day retention |
| Anonymize PII in audit logs | Monthly | Remove IP/user agent from logs > 90 days |
| Archive old audit logs | Monthly | Archive or delete logs > 365 days |

---

## 5. Compliance Notes

- Retention periods align with data minimization principles.
- PII is reduced over time (IP/user agent removed at 90 days).
- Audit trail supports accountability without indefinite PII retention.
- Account deletion removes or anonymizes all parent-specific data.
- Child data is not owned by the parent domain — child data retention follows student data policies.
- These rules do not affect admin audit logs, which follow separate retention policies.

---

## 6. Implementation Notes

- Cleanup jobs should be implemented as backend scheduled tasks.
- Soft-delete patterns (status flags + timestamps) are preferred over hard deletes.
- Anonymization replaces PII with placeholder values rather than deleting rows.
- Retention periods are configurable via environment variables for flexibility.
- No cleanup job should run without audit logging its own actions.
