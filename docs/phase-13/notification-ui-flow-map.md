# Phase 13 — Notification UI Flow Map

**Dependency:** P13-006 (Notification API Contract Map)

## Purpose

Document notification inbox, preferences, reminder settings, and digest display
flows so all Phase 13 UI tasks build consistent, design-system-compliant
screens.

## Design System Requirements

All flows below must use the approved AIM design system
(`docs/design/source/aim-design-system`): tokens, typography, spacing,
radius/elevation, shared layout/components. No one-off styling. All flows
support responsive layout, Arabic/RTL mirroring, accessible labels/controls,
and loading/empty/error/forbidden states.

## Flow 1 — Notification Inbox (Student + Parent)

1. **Entry** — Bell icon in app header/nav with unread-count badge (badge count
   comes from backend; UI never computes it locally).
2. **List** — `GET /feed` (paginated). Each row: icon (by category), title,
   relative timestamp, read/unread visual state (`--primary-soft` background for
   unread per design tokens).
3. **States** — Loading: skeleton rows. Empty: friendly empty state ("You're all
   caught up!"). Error: retry affordance, no raw error text shown.
4. **Item interaction** — Tap marks read (`PATCH /feed/:id/read`) and may deep-
   link to the relevant detail screen (e.g. assessment result, lesson). Swipe or
   action button dismisses (`PATCH /feed/:id/dismiss`).
5. **No client-side state invention** — Read/dismissed visual state always
   reflects the last backend response; optimistic UI must reconcile with the
   backend response, not assume success.

## Flow 2 — Notification Preferences (Student + Parent)

1. **Entry** — Settings → Notifications.
2. **List** — Grouped by category, each row shows channel toggles (in-app
   always on/disabled-toggle, push, email) sourced from `GET /preferences`.
3. **Update** — Toggling calls `PUT /preferences`; toggle shows a pending state
   until backend confirms, then reflects the confirmed value (never assumes
   success silently).
4. **Quiet Hours** — Sub-section with start/end time pickers and timezone,
   backed by `GET/PUT /quiet-hours`. Helper copy clarifies quiet hours apply to
   push/email, not to the in-app inbox.

## Flow 3 — Reminder Settings (Student)

1. **Entry** — Settings → Reminders, or a dedicated "Study Reminders" screen.
2. **System reminders** — Learning plan / deadline / streak reminders are
   listed read-only (toggle maps to the relevant `NotificationPreference`
   category, not direct schedule editing).
3. **Custom reminders** — List of caller-owned custom reminders
   (`GET /reminders`), with create (`POST /reminders`) and pause/cancel
   (`PATCH /reminders/:id`) actions. UI clearly indicates the displayed
   time/cadence is what the backend confirmed, not a guarantee until confirmed.
4. **States** — Empty state for no custom reminders; form validation errors
   surfaced from backend validation responses.

## Flow 4 — Parent Digest View (Parent)

1. **Entry** — Parent dashboard → child card → "Weekly Summary".
2. **Access gating** — Only rendered for a child the parent has an active link
   + required consent for; if missing, UI shows a forbidden/locked state
   consistent with Phase 12 parent dashboard patterns (no client-side
   workaround to view it anyway).
3. **Content** — Summary-level digest content only (per Notification Privacy
   Rules) — no raw answers, no AI output text.

## Flow 5 — Admin Notification Oversight (Admin, read-only)

1. **Entry** — Admin dashboard → Notifications.
2. **Views** — Read-only lists for templates, events, delivery attempts, audit
   logs (`GET /admin/...`). No create/edit/delete controls unless a future task
   explicitly grants write access.
3. **States** — Standard loading/empty/error states; no sensitive payload
   content beyond what Notification Privacy Rules permit.

## Shared Components Expected

- Notification list item, badge/counter, toggle row, empty/error state panels,
  and time-window picker should be built as shared components reusable across
  student, parent, and admin surfaces — not duplicated per surface.
