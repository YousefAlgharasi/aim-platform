# Phase 13 Notification Privacy Review

Scope: review of sensitive content exposure, parent/child data scope,
quiet hours, digests, and logs across
`services/backend-api/src/features/notifications/*` and the
Phase 13 client UIs.

## Sensitive content in notification payloads

- All notification titles/bodies are produced exclusively by
  `NotificationTemplateService.renderTemplate()`, which substitutes
  caller-supplied `variables` into pre-approved
  `{{placeholder}}` template strings (`notification-template.entity.ts`,
  `notification-template.service.ts`). Callers never supply raw
  title/body text directly through `NotificationQueueService.enqueue()`.
- Reviewed every reminder integration that calls `enqueue()`:
  - `LearningReminderIntegration` — passes only ids/cron config to the
    schedule, no content variables shown in the reviewed methods beyond
    locale.
  - `DeadlineReminderIntegration.fireDeadlineReminder` — variable is
    `deadline_name` (a label), not deadline content or grading detail.
  - `StreakReminderIntegration.fireStreakReminder` — variable is
    `streak_count` (a number).
  - `ParentSummaryReminderIntegration` — variable is `event_count` (a
    number), never event titles, child names, scores, or raw AIM
    output.
  - None of these pass full sensitive answers, raw AIM model output,
    or assessment content into a notification payload.

## Parent/child data exposure and scope

- Every parent-facing notification endpoint (`inbox.controller.ts`,
  `preferences.controller.ts`, `reminders.controller.ts`,
  `device-token.controller.ts`) derives the acting user from
  `@CurrentUser()` (the parent's own Supabase JWT) and scopes every
  read/write to that `userId` — no endpoint accepts a child id or any
  other recipient-scope override. This was verified earlier for P13-065's
  test suite and re-confirmed here at the controller level.
- The notification system models the recipient as `userId` directly
  (parent or student account, depending on `ownerType`/category), not
  as "child accessed via parent." A parent's notification feed contains
  only events generated for the parent's own account (e.g.
  `parent_summary`, `deadline_reminder` for things the parent
  subscribed to) — it does not expose a child's own personal
  notification stream, scores, or learning content directly.
- Parent web dashboard pages (`ParentNotifications.js`,
  `ParentNotificationSettings.js`, `ParentDeadlineReminders.js`) only
  render backend-supplied `title`/`body`/`category`/`status` fields —
  none of these pages compute or display any additional child-specific
  detail beyond what the backend's notification event already contains.

## Quiet hours

- `NotificationEligibilityService.isInQuietHours()` reads the
  recipient's own `quietHours` row (timezone-aware via
  `Intl.DateTimeFormat`) — quiet hours are evaluated server-side against
  the same `userId` that will receive the notification, not against an
  unrelated party. No client supplies the "is it quiet hours" decision.

## Digests

- `NotificationDigestService.createDigest()` aggregates only a count of
  the recipient's own existing `in_app` notification events
  (`eligibleEvents.length`) within the digest period. The digest record
  and the resulting `parent_weekly_summary`/`parent_daily_summary`
  notification payload carry only `event_count` — no underlying event
  titles, bodies, scores, or child-specific learning content is
  aggregated into the digest payload.

## Logs

- Reviewed every `logger.log/warn/error` call under
  `features/notifications/`: all log lines reference ids
  (`userId`, `planId`, `deadlineId`, `scheduleId`) or counts
  (`event_count`, `streak_count`), never rendered notification titles,
  bodies, or template variables. No log statement contains template
  content or child-specific learning detail.
- The push provider adapter (`NoopPushProviderAdapter`) logs only the
  first 8 characters of a device token, never the full token.
- `NotificationAuditService.log()` drops any audit metadata entirely if
  `containsSensitiveData()` matches a secret/credential pattern,
  rather than persisting partially-redacted data (see
  `phase-13-notification-security-review.md` for the full review of
  this mechanism).

## Summary

| Area | Status |
|---|---|
| Notification payload content (no raw AIM output / full answers) | Pass |
| Parent/child recipient scope (no cross-account access) | Pass |
| Quiet hours evaluated against the correct recipient | Pass |
| Digest payloads (counts only, no underlying content) | Pass |
| Logs (no sensitive content, partial token only) | Pass |

**Overall: Pass.** No privacy issues found in notification payload
content, recipient scoping, quiet-hours evaluation, digest aggregation,
or logging. See `phase-13-notification-security-review.md` (P13-070)
for the one related, separately-tracked finding (rate limiter not
wired into the dispatch path), which is a security/availability
concern rather than a privacy concern.
