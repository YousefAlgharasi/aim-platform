# Phase 13 Notification UI — Design System Review

Scope: review of all notification/reminder UI delivered in Phase 13
(mobile, parent web dashboard, admin web) against the AIM design system
(`docs/design/source/aim-design-system`) and the Flutter AIM Mobile
Design System widget library.

## Mobile (Flutter)

Reviewed: `apps/mobile/lib/features/notifications/ui/`
(`notification_inbox_page.dart`, `notification_preferences_page.dart`,
`reminder_settings_page.dart`, `notification_bell_button.dart`).

- Uses `AIMCard`, `AIMBadge`, `AIMButton`, `AIMEmptyState`,
  `AIMFullScreenLoading`/`AIMFullScreenError`, `AimSpacing`, `AimTextStyles`
  exclusively for layout, feedback, and typography — no raw `Container`
  styling, no hardcoded colors found.
- Unread indicator uses Flutter's built-in Material 3 `Badge` widget
  rather than an AIM primitive, because no AIM badge-overlay component
  exists for this use case. This is a one-off but a narrow, justified
  exception (no equivalent first-party widget existed to reuse).
- **Verdict: Pass**, with the noted `Badge` exception flagged for the
  design system owners to decide whether a dedicated AIM notification-dot
  primitive should be added later.

## Parent web dashboard

Reviewed: `apps/web/src/features/parent-dashboard/pages/ParentNotifications.js`,
`ParentNotificationSettings.js`, `ParentDeadlineReminders.js`,
`apps/web/src/features/parent-dashboard/notifications/ParentNotificationsShell.js`.

- All three pages compose the existing shared parent component library
  (`ParentCard`, `ParentBadge`, `ParentLoadingState`, `ParentEmptyState`,
  `ParentErrorState`) and the existing `ParentPages.css` token-based
  classes (`parent-form__input`, `parent-form__btn`, `parent-btn`,
  `parent-btn--primary`, `parent-btn--danger`), consistent with every
  other Phase 12/13 parent page. No new one-off CSS classes, inline
  styles, or hardcoded colors were introduced.
- The parent web dashboard's CSS layer is not yet a direct consumer of
  `docs/design/source/aim-design-system` tokens — it predates this
  review and uses its own `var(--color-primary-500, #4762EE)`-style
  fallback tokens. This is a pre-existing condition across the entire
  parent dashboard (Phase 12 and earlier), not something introduced by
  Phase 13. No Phase 13 notification page deviates further from that
  established baseline.
- **Verdict: Pass relative to the existing parent dashboard baseline.**
  Migrating the parent dashboard's CSS layer onto
  `docs/design/source/aim-design-system` tokens directly is a pre-existing
  gap, out of scope for Phase 13, and should be tracked as its own task
  rather than addressed ad hoc here.

## Admin web (notification monitor / template viewer)

Reviewed: `apps/web/src/features/admin-notifications/pages/AdminNotificationMonitor.jsx`,
`AdminTemplateMonitor.jsx`.

- These pages were intentionally built to mirror the existing
  `apps/web/src/pages/AdminDashboard.jsx` pattern (plain HTML
  `<table>`/`<input>`/`<button>` elements, inline `style={{...}}` for
  flex layout, the `admin-dashboard-*` CSS classes already defined in
  `AdminDashboard.jsx`'s embedded `<style>` block) rather than the AIM
  design system component library or its design tokens.
- This is a **known deviation**, not a false positive: the admin web
  surface as a whole (the pre-existing `AdminDashboard.jsx` it was
  modeled on) has never adopted the AIM design system, the Parent
  component library, or the Flutter AIM Mobile Design System. There is
  no admin-facing design-system-compliant component library in this
  repository to build against.
- Functionally this is low-risk: the admin notification UI is
  read-only, internal-only, and not part of any approved end-user
  journey, but it does not meet the "follow the approved AIM design
  system" bar literally.
- **Verdict: Conditional pass / flagged exception.** Blocking this on a
  full admin design-system migration would require building net-new
  AIM-compliant admin components for the web app, which is outside the
  scope of any single Phase 13 task and would constitute the
  "Admin Dashboard expansion" explicitly excluded from this phase's
  scope. Recommendation: approve as consistent with the existing admin
  surface's established (non-AIM) baseline, and open a follow-up task
  to define and adopt an AIM-compliant admin component library before
  any further admin UI work.

## Test coverage of UI-safety properties

- `apps/mobile/test/features/notifications/notification_state_notifiers_test.dart`
  and `device_token_notifier_test.dart` (P13-060).
- `apps/web/src/features/parent-dashboard/__tests__/parent-notification-ui.test.js` (P13-065).
- `apps/web/src/features/admin-notifications/__tests__/admin-notification-ui.test.js` (P13-068).

All three suites assert no-authority/no-mutation properties (no local
eligibility/delivery/quiet-hours computation, no child-id scope
override, admin client GET-only) using the same static-analysis pattern
already established by the Phase 12 parent UI test suites.

## Overall

Approved for Phase 13, with one explicit, documented exception (admin
web notification/template pages not yet on the AIM design system,
because no AIM-compliant admin component library exists) and one noted
narrow exception (mobile unread badge using Flutter's built-in `Badge`
widget). Neither introduces one-off styling beyond what already exists
in their respective surfaces' established baselines.
