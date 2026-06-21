# Phase 18 AI Teacher / Voice Tutor / Admin AI — Design System Review

Scope: review of all AI Teacher, Voice Tutor, and Admin AI Management UI
delivered in Phase 18 (mobile AI Teacher chat, mobile Voice Tutor, admin
web AI management dashboard) against the AIM design system
(`docs/design/source/aim-design-system`) and the Flutter AIM Mobile
Design System widget/token library (`apps/mobile/lib/core/design_tokens`,
`apps/mobile/lib/core/theme`).

## Mobile (Flutter) — AI Teacher chat

Reviewed: `apps/mobile/lib/features/ai_teacher/ui/` (chat page, message
list, message input, feedback action widgets).

- Pages compose standard Flutter layout primitives (`Scaffold`, `Column`,
  `ListView`) with text styles and spacing pulled from theme context
  rather than ad-hoc constants in the files reviewed.
- No raw hex colors (`Color(0x...)`) or `Colors.*` literals were found in
  the `ai_teacher` UI tree.
- **Verdict: Pass.**

## Mobile (Flutter) — Voice Tutor

Reviewed: `apps/mobile/lib/features/voice_teacher/ui/pages/voice_teacher_page.dart`
and `apps/mobile/lib/features/voice_teacher/ui/widgets/` (`voice_waveform_indicator.dart`,
`voice_transcript_list.dart`, `voice_record_button.dart`,
`voice_feedback_actions.dart`, `voice_error_state.dart`,
`voice_teacher_entry_card.dart`, `voice_text_fallback.dart`,
`recording_state_bar.dart`).

- Most widgets correctly consume `AimColors`/theme tokens (e.g.
  `recording_state_bar.dart:72,98` use `AimColors.primary`).
- **Finding (one-off styling):** `recording_state_bar.dart:40,52,67,183`
  use raw `Colors.red` / `Colors.red.withOpacity(0.08)` for the
  recording/error indicator instead of the design system's
  `AimColors.error500` (or the theme's `errorSoft`/`errorSoftFg`
  extension colors already defined in
  `apps/mobile/lib/core/design_tokens/aim_colors.dart:63-67` and
  `apps/mobile/lib/core/theme/aim_theme_extensions.dart:135-136,169-170,204-205`).
  This is a genuine inconsistency: the design system already ships an
  error-color token family, so there is no need for a raw `Colors.red`
  literal here.
- **Verdict: Conditional pass — blocked pending fix.** This single file
  must be updated to use `AimColors.error500` (light) /
  `Theme.of(context).extension<AimThemeExtension>()!.errorSoft`-equivalent
  semantics in place of the four raw `Colors.red` usages before this
  surface is considered fully compliant. No other one-off styling was
  found elsewhere in the Voice Tutor UI tree.

## Admin Web — AI Management Dashboard

Reviewed: `apps/web/src/features/admin-ai/AdminAiShell.js` +
`AdminAiShell.css`, and `apps/web/src/features/admin-ai/pages/`
(`AdminAiPrompts.js`, `AdminAiModelConfig.js`, `AdminAiUsageCost.js`,
`AdminAiSafetyReview.js`, `AdminAiAudit.js`) + `AdminAiPages.css`.

- The shell follows the exact same structural pattern as
  `AdminAnalyticsShell`/`AdminAnalyticsShell.css` (nav items, loading/
  empty/error/forbidden state components, sidebar + mobile nav,
  `dir="auto"`, `role="status"`/`role="alert"`, `aria-current`) — no new
  shell pattern was invented.
- All five pages share one common `AdminAiPages.css` stylesheet (table,
  form, badge, status classes), reused consistently rather than each page
  defining its own ad-hoc styles.
- `AdminAiShell.css` and `AdminAiPages.css` use only AIM design-token
  custom properties (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`,
  `var(--type-*-size)`, `var(--weight-*)`) for every colored/spaced/sized
  rule. A repository-wide scan of both files found zero raw hex colors or
  unguarded pixel literals outside `var(--space-*, <fallback>)` style
  fallbacks (the same fallback-default pattern used by the existing
  `admin-analytics` and `parent-dashboard` stylesheets).
- RTL/responsiveness: both stylesheets use RTL-safe logical properties
  (`border-inline`, `inset-inline`) and `@media (max-width: 768px)`
  breakpoints, consistent with prior phases.
- Accessibility: all status messages use `role="status"`/`role="alert"`;
  all interactive controls (`نشر`, `إيقاف`, `تنشيط`, `الحدود`, `بحث`)
  have visible Arabic labels or `aria-label`; nav items use
  `aria-current` for the active route.
- **Verdict: Pass.**

## Summary

| Surface | Verdict |
| --- | --- |
| Mobile AI Teacher chat | Pass |
| Mobile Voice Tutor | Conditional pass — fix raw `Colors.red` in `recording_state_bar.dart` |
| Admin web AI Management dashboard | Pass |

No provider secrets, raw API keys, or one-off color/spacing values were
found anywhere in the admin web AI surfaces. The one outstanding
inconsistency is isolated to a single mobile Voice Tutor widget file and
does not block the already-shipped admin web AI Management UI from this
phase; it is logged here for a follow-up fix in the Voice Tutor feature
area.
