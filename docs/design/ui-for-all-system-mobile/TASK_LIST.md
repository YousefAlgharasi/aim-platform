# Mobile UI Implementation — Task List

Generated from an audit of `docs/design/ui-for-all-system-mobile/` (design reference) against
`apps/mobile/lib/` (existing Flutter app). See sections 1–3 below for the underlying audit data,
then TASK-00 through TASK-19 for the executable Claude Code prompts.

**Coverage:** TASK-00–13 cover the 13 screens flagged ⚠️/❌ (content/data work). TASK-14 covers
routing wiring for the 24 screens whose pages exist but have no named route. TASK-15 covers the
menu drawer + notifications bottom sheet (not part of the 59-screen list, but required by
`screenshots/menu/`). TASK-16–19 are batched verification tasks for the remaining 23 screens that
already match the design with no known route/content gaps — together TASK-00–19 touch all 59
screens plus the menu.

---

## 1. Screen Match Table

All 59 screens already have a corresponding file (mapped 1:1 in `docs/mobile-ui-screens.md`). Status
reflects implementation completeness, not file existence.

| # | Screen id | File (`apps/mobile/lib/features/...`) | Status | Endpoint(s) | Notes |
|---|---|---|---|---|---|
| 01 | splash | `onboarding/ui/pages/splash_page.dart` | ✅ | `/auth/me`, `/auth/bootstrap` | dead unused dup: `splash_placeholder_page.dart` |
| 02 | login | `auth/ui/pages/login_page.dart` | ⚠️ | `/auth/login`, `/auth/test-login` | placeholder/TODO markers found; dead dup: `sign_in_placeholder_page.dart` |
| 03 | register | `auth/ui/pages/register_page.dart` | ⚠️ | `/auth/register` | placeholder-flagged code; verify email-sent flow |
| 04 | mainShell | `shell/ui/pages/main_shell_page.dart` | ✅ | n/a | IndexedStack + AIMBottomNav |
| 05 | home | `home/ui/pages/home_page.dart` | ✅ | skill-states, weakness-records, review-schedules, recommendations | |
| 06 | courseList | `lessons/ui/pages/course_list_page.dart` | ✅ | `/curriculum/courses` | |
| 07 | chapterList | `lessons/ui/pages/chapter_list_page.dart` | ✅ | `/curriculum/chapters?levelId` | |
| 08 | lessonList | `lessons/ui/pages/lesson_list_page.dart` | ⚠️ | `/curriculum/lessons?chapterId` | placeholder/TODO flagged |
| 09 | lessonDetail | `lessons/ui/pages/lesson_detail_page.dart` | ⚠️ | `/curriculum/lessons/:id`, `/curriculum/lesson-assets` | media rendering stubbed (metadata only) |
| 10 | review | `reviews/ui/pages/review_page.dart` | ✅ | `/aim/students/:id/review-schedules` | dead dup: `review_placeholder_page.dart` |
| 11 | progress | `progress/ui/pages/progress_page.dart` | ✅ | skill-states/weakness/recommendations/review-schedules | dead dup: `progress_placeholder_page.dart` |
| 12 | skillState | `progress/ui/pages/skill_state_page.dart` | ⚠️ | `/aim/students/:id/skill-states` | flagged; widget `progress_skill_state_card.dart` also flagged |
| 13 | weakness | `progress/ui/pages/weakness_summary_page.dart` | ✅ | `/aim/students/:id/weakness-records` | |
| 14 | recommendations | `progress/ui/pages/recommendations_page.dart` | ✅ | `/aim/students/:id/recommendations` | |
| 15 | reviewSchedule | `progress/ui/pages/review_schedule_page.dart` | ✅ | `/aim/students/:id/review-schedules` | |
| 16 | profile | `profile/ui/pages/profile_page.dart` | ✅ | `/profile/me` | dead dup: `profile_placeholder_page.dart` |
| 17 | editProfile | `profile/ui/pages/edit_profile_page.dart` | ⚠️ | `PATCH /profile/me` | placeholder/TODO flagged |
| 18 | placementIntro | `placement/ui/pages/placement_intro_page.dart` | ❌ | none wired | literal "Placement Intro — coming soon" stub |
| 19 | placementStart | `placement/ui/pages/placement_start_page.dart` | ✅ | `/placement/active`, `/placement/active/sections` | |
| 20 | placementSection | `placement/ui/pages/placement_section_page.dart` | ✅ | `/placement/active/sections` | |
| 21 | placementQuestion | `placement/ui/pages/placement_question_page.dart` | ⚠️ | `/placement/questions?sectionId`, `/placement/attempts/:id/answers` | placeholder/TODO flagged |
| 22 | placementSubmit | `placement/ui/pages/placement_submit_page.dart` | ✅ | `/placement/attempts/:id/complete` | |
| 23 | placementResult | `placement/ui/pages/placement_result_page.dart` | ✅ | `/placement/attempts/:id/result` | |
| 24 | assessmentList | `assessments/ui/pages/assessment_list_page.dart` | ✅ | `/student/assessments` | |
| 25 | assessmentDetail | `assessments/ui/pages/assessment_detail_page.dart` | ✅ | `/student/assessments/:id` | |
| 26 | startAttempt | `assessments/ui/pages/start_attempt_page.dart` | ✅ | `POST /student/assessments/:id/attempts` | |
| 27 | attempt | `assessments/ui/pages/attempt_page.dart` | ⚠️ | `/student/assessments/attempts/:attemptId/resume` | question rendering area is a placeholder |
| 28 | submitAttempt | `assessments/ui/pages/submit_attempt_page.dart` | ✅ | `POST .../attempts/:attemptId/submit` | |
| 29 | assessmentResult | `assessments/ui/pages/assessment_result_page.dart` | ✅ | `.../attempts/:attemptId/result` | |
| 30 | resultHistory | `assessments/ui/pages/result_history_page.dart` | ✅ | `/student/assessments/:id/history` | |
| 31 | deadlines | `assessments/ui/pages/deadlines_page.dart` | ✅ | `/student/assessments/deadlines` | |
| 32 | questionPage | `question_answer/ui/pages/question_page.dart` | ⚠️ | `/sessions/start`, `/sessions/:id/attempt` | widget `question_fill_blank_input.dart` flagged placeholder |
| 33 | aiChat | `ai_teacher/ui/pages/ai_teacher_chat_page.dart` | ⚠️ | `/ai-teacher/sessions`, `/ai-teacher/sessions/:id/messages(/stream)` | widget `ai_chat_input_bar.dart` flagged placeholder |
| 34 | aiHistory | `ai_teacher/ui/pages/ai_teacher_session_history_page.dart` | ✅ | `GET /ai-teacher/sessions` | |
| 35 | aiSettings | `ai_teacher/ui/pages/ai_teacher_settings_page.dart` | ✅ | local device prefs | |
| 36 | voice | `voice_teacher/ui/pages/voice_teacher_page.dart` | ⚠️ | `/voice-teacher/sessions`, `/voice-teacher/sessions/:id/audio` | placeholder/TODO flagged; idle/listening/speaking/error states |
| 37 | learningPath | `learning_path/ui/pages/learning_path_page.dart` | ✅ | skill-states/weakness/recommendations | dead dup: `learning_path_placeholder_page.dart` |
| 38 | analytics | `analytics_summary/ui/pages/analytics_summary_page.dart` | ✅ | `/student/analytics/summary` | |
| 39 | notifInbox | `notifications/ui/pages/notification_inbox_page.dart` | ✅ | `/api/v1/notifications/inbox`, `/inbox/unread-count` | dead dup: `notifications_placeholder_page.dart` |
| 40 | notifDetail | `notifications/ui/pages/notification_detail_page.dart` | ✅ | `PATCH /inbox/:eventId/read`, `/dismiss` | |
| 41 | notifPrefs | `notifications/ui/pages/notification_preferences_page.dart` | ✅ | `/api/v1/notifications/preferences` | |
| 42 | reminderSettings | `notifications/ui/pages/reminder_settings_page.dart` | ✅ | `/api/v1/notifications/reminders`, `/reminders/:id/pause` | |
| 43 | pricing | `billing/ui/pages/pricing_page.dart` | ✅ | billing plans (verify exact path) | |
| 44 | subscription | `billing/ui/pages/subscription_page.dart` | ✅ | billing subscription (verify) | |
| 45 | checkoutStart | `billing/ui/pages/checkout_start_page.dart` | ✅ | checkout (verify) | |
| 46 | checkoutStatus | `billing/ui/pages/checkout_status_page.dart` | ✅ | checkout status (verify) | |
| 47 | invoiceHistory | `billing/ui/pages/invoice_history_page.dart` | ✅ | invoices (verify) | |
| 48 | helpCenter | `support/ui/pages/help_center_page.dart` | ✅ | static/local FAQ | |
| 49 | parentHelp | `support/ui/pages/parent_help_center_page.dart` | ✅ | static/local | |
| 50 | createTicket | `support/ui/pages/create_ticket_page.dart` | ✅ | support ticket create (verify) | |
| 51 | feedback | `support/ui/pages/feedback_page.dart` | ✅ | feedback submit (verify) | |
| 52 | ticketList | `support/ui/pages/ticket_list_page.dart` | ✅ | tickets list (verify) | |
| 53 | parentTicketList | `support/ui/pages/parent_ticket_list_page.dart` | ✅ | tickets list, parent scope | |
| 54 | ticketDetail | `support/ui/pages/ticket_detail_page.dart` | ✅ | ticket detail (verify) | |
| 55 | status | `support/ui/pages/status_page.dart` | ✅ | `/health`, `/version` (verify) | |
| 56 | releaseNotes | `support/ui/pages/release_notes_page.dart` | ✅ | release notes (verify) | |
| 57 | releaseNoteDetail | `support/ui/pages/release_note_detail_page.dart` | ✅ | release note detail (verify) | |
| 58 | dsPreview | `design_system_preview/ui/pages/ds_preview_page.dart` | ✅ | none (dev tool) | |
| 59 | achievements | `achievements/ui/pages/achievements_page.dart` | ❌ | none wired | empty state only, no backend wiring |

13 unused `*_placeholder_page.dart` dead files were found sitting next to real implementations. Not
in scope for these tasks — flag separately for deletion.

## 2. Widget Plan

| Widget | Action | Used by |
|---|---|---|
| `AIMCard` (`core/widgets/learning/aim_card.dart`) | Reuse | most list screens |
| `AIMCircularProgress` | Reuse | progress, profile |
| `AIMSkeleton`, `AIMEmptyState`, `AIMFullScreenError`, `AIMFullScreenLoading` | Reuse | all screens |
| `AIMChip`, `AIMBadge` | Reuse | status indicators |
| `AIMButton`, `AIMFab`, `AIMIconButton` | Reuse | buttons |
| Forms kit (`aim_input`, `aim_textarea`, `aim_select`, `aim_checkbox`, `aim_radio`, `aim_switch`, `aim_otp_input`) | Reuse | login, register, editProfile |
| `AIMAIFeedbackBubble` | Reuse | aiChat |
| `AIMRecordButton` | Reuse | voice |
| `GradientHeroHeader` (`core/widgets/headers/gradient_hero_header.dart`) | Create | home, profile, placementResult |
| Glassy variant of `AIMTopAppBar` | Refactor (`navigation/aim_top_app_bar.dart`) | all screens (verify/add blur) |
| `AIMBlobCard` (gradient card) | Create (`core/widgets/learning/aim_blob_card.dart`) | dashboard, courses |
| `AIMGradientButton` (pill) | Refactor `AIMButton` to add gradient style, or create `core/widgets/buttons/aim_gradient_button.dart` | login, checkout |
| `AIMStatTile` | Create (`core/widgets/learning/aim_stat_tile.dart`) | home, progress |
| `AIMSkillBlob` | Refactor — promote `progress/ui/widgets/progress_skill_state_card.dart` into `core/widgets/learning/aim_skill_blob.dart` | skillState, profile |
| Side menu drawer | Create (`core/widgets/navigation/aim_app_drawer.dart`) | mainShell |
| Notifications bottom sheet | Create (`core/widgets/states/aim_notifications_sheet.dart`) | mainShell / home |

## 3. Theme Token Gap Table

All CSS tokens already have Flutter equivalents in `core/design_tokens/` **except** the Gen Z
gradients from `README.md`:

| CSS token | Flutter token | Status |
|---|---|---|
| `--gz-hero` (142°, #8B5CF6→#6C63FF→#5AC8FA) | `AimGradients.gzHero` | ❌ missing |
| `--gz-fire` (135°, #FFB14E→#FF6B8A) | `AimGradients.gzFire` | ❌ missing |
| `--gz-limeg` (135°, #C8FF3D→#74E08A) | `AimGradients.gzLime` | ❌ missing |
| `--gz-coralg` (135°, #FF6B8A→#FF9F45) | `AimGradients.gzCoral` | ❌ missing |
| `--gz-purple/lime/coral/sky` (solid) | `AimColors.gzPurple/Lime/Coral/Sky` | ❌ missing |

Everything else (`--color-*`, `--type-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--font-*`,
`--z-*`, `--size-*`, `--icon-*`, `--avatar-*`, `--touch-target`, `--ease-*`, `--duration-*`) is
already covered by `AimColors`, `AimTypography`/`AimTextStyles`, `AimSpacing`, `AimRadius`,
`AimShadows`, `AimFontFamilies`, `AimSizes`, `AimMotion`. **TASK-00 is scoped only to adding the
Gen Z gradient/color constants and the new universal widgets — the rest of the theme layer is
already built and must not be touched.**

## 4. Routing Notes

Confirmed named routes exist for: splash, signIn, register, mainShell + tabs (home/learn/review/
progress/profile), lessons (courseChapters/chapterLessons/lessonDetail), placement (start/section/
question/submit/result), assessments, billing (subscription/pricing/invoices), aiTeacherChat,
notificationInbox, analyticsSummary, achievements, dev-tools/endpoint-tester.

**No named route constant exists** for: editProfile, skillState, weakness, recommendations,
reviewSchedule, placementIntro, deadlines, voice, aiHistory, aiSettings, notifDetail, notifPrefs,
reminderSettings, checkoutStart/Status, helpCenter, parentHelp, createTicket, feedback,
ticketList/parentTicketList/ticketDetail, status, releaseNotes/Detail, dsPreview. These are reached
via unnamed `Navigator.push(MaterialPageRoute(...))` from a parent screen — confirmed by checking
`app_route_paths.dart` / `app_router.dart`. Screen tasks below note this where relevant; the
implementing agent should navigate exactly the way the existing parent screen already does, not
invent a new named route.

---

## Summary

**Total tasks generated: 20** (TASK-00 + TASK-01–13 screen content tasks + TASK-14 routing +
TASK-15 menu + TASK-16–19 batched verification, covering all 59 screens plus the menu drawer and
notifications sheet)
**Recommended run order:** TASK-00 → merge → TASK-01–13, TASK-15, TASK-16–19 in parallel → TASK-14
last (touches `app_router.dart`/`app_route_paths.dart`, the one shared file every other task's
screen might also reference for navigation, so merge it after the screen-level branches to avoid
rebase churn)
**Blocked screens:** none — all 13 ⚠️/❌ screens have a real backend endpoint already documented
(achievements and placementIntro have no endpoint wired yet; their tasks are scoped to UI-only with
the existing empty state, since wiring a new endpoint is a backend change out of scope per the
"backend is read-only" rule — flagged explicitly in their task prompts as **Blocked: needs backend
endpoint** if real data is required).
**Ambiguous items:**
- Exact endpoint paths for billing checkout/support tickets/release-notes are not confirmed line-by-line in `docs/mobile-app-api-endpoints.md` (file has more content past what was sampled) — the implementing agent for any of those screens should grep that doc before wiring, but none of those screens are in the ⚠️/❌ set, so no task below is blocked by this.
- Whether the 13 dead `*_placeholder_page.dart` files are still referenced anywhere — recommend a separate cleanup task, not included here since it wasn't requested.

---

════════════════════════════════════════════════════════
## TASK-00 — Theme Layer Additions + Universal Widget Library
Branch: `ui/theme-and-widgets`
Depends: nothing — run this before everything else
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

You are working on the Flutter mobile app in `apps/mobile/`. Your job is two things only:

1. Add the missing Gen Z gradient/color tokens to the existing theme layer (it is otherwise
   already complete — do not rebuild `core/design_tokens/` or `core/theme/` from scratch).
2. Build the universal widgets that screen tasks depend on.

Do NOT touch any screen file, any backend file, or anything outside:
- `apps/mobile/lib/core/design_tokens/`
- `apps/mobile/lib/core/widgets/`

BACKEND IS READ-ONLY. No changes to controllers, routes, models, or schemas.

#### PART A — Add missing tokens

Read `docs/design/ui-for-all-system-mobile/README.md` for the exact gradient definitions, and
`apps/mobile/lib/core/design_tokens/aim_gradients.dart` / `aim_colors.dart` for the existing pattern
to follow (naming convention, doc comments, how `AimGradients` and `AimColors` are structured).

Add to `aim_gradients.dart`:
```dart
static const gzHero = LinearGradient(
  begin: Alignment.topLeft, end: Alignment.bottomRight,
  colors: [Color(0xFF8B5CF6), Color(0xFF6C63FF), Color(0xFF5AC8FA)],
);
static const gzFire = LinearGradient(
  begin: Alignment.topLeft, end: Alignment.bottomRight,
  colors: [Color(0xFFFFB14E), Color(0xFFFF6B8A)],
);
static const gzLime = LinearGradient(
  begin: Alignment.topLeft, end: Alignment.bottomRight,
  colors: [Color(0xFFC8FF3D), Color(0xFF74E08A)],
);
static const gzCoral = LinearGradient(
  begin: Alignment.topLeft, end: Alignment.bottomRight,
  colors: [Color(0xFFFF6B8A), Color(0xFFFF9F45)],
);
```
Match the exact angle convention (142° / 135°) already used elsewhere in `aim_gradients.dart` for
`ai`/`aiSoft`/`growth` rather than hardcoding `topLeft`/`bottomRight` if those use a different
helper (e.g. a `GradientRotation` or `Alignment` computed from degrees) — follow the file's existing
pattern, don't introduce a second style.

Add to `aim_colors.dart`: `gzPurple = Color(0xFF6C63FF)`, `gzLime = Color(0xFFC8FF3D)`,
`gzCoral = Color(0xFFFF6B8A)`, `gzSky = Color(0xFF5AC8FA)`.

#### PART B — Build the universal widgets

All widgets below go in `apps/mobile/lib/core/widgets/` following the existing `AIM*` naming and
file-layout convention (see `core/widgets/learning/aim_card.dart` for the pattern: stateless/
stateful widget, doc comment, token-driven styling, no hardcoded colors/spacing). Register each new
file in `core/widgets/widgets.dart` (the barrel export), same as existing widgets.

Every widget must:
- Use only `AimColors`/`AimColorTheme`, `AimTypography`/`AimTextStyles`, `AimSpacing`, `AimRadius`,
  `AimShadows`, `AimGradients` — never a hardcoded color/number.
- Render correctly in both light and dark `ThemeData` (use `Theme.of(context)` /
  `AimColorTheme.light`/`.dark` via the existing `AimThemeExtension`, not
  `MediaQuery.platformBrightnessOf` checks with hardcoded colors).
- Use `EdgeInsetsDirectional` / `AlignmentDirectional`, never `EdgeInsets.only(left:...)` or
  `Alignment.centerLeft`/`centerRight`.
- Have minimum 44px touch targets on any tappable element (`AimSizes.touchTarget`).

**1. `core/widgets/headers/gradient_hero_header.dart` — `AIMGradientHeroHeader`**
Used by: home, profile, placementResult.
Design ref: `screenshots/light/05-screen.png`, `screenshots/dark/05-screen.png` (home),
`screenshots/light/16-screen.png` (profile).
Params: `gradient` (LinearGradient, default `AimGradients.gzHero`), `title` (String),
`subtitle` (String?), `leading` (Widget?, e.g. avatar), `trailing` (Widget?, e.g. notification
bell), `child` (Widget?, content overlaid at the bottom of the header, e.g. stat row).
States: none (static container) — content passed in by caller already handles its own loading.

**2. `core/widgets/navigation/aim_app_drawer.dart` — `AIMAppDrawer`**
Used by: mainShell (side menu).
Design ref: `screenshots/menu/02-view.png` (dark), `screenshots/menu/03-view.png` (light).
Params: `items` (List of `AIMDrawerItemData { icon, label, onTap, selected }`), `header` (Widget,
user avatar/name block), `footer` (Widget?, e.g. sign-out).
Implement as a `Drawer`/`EndDrawer`-compatible widget so it can be wired into `MainShellPage`'s
`Scaffold.drawer` in a later task — do not wire it into `MainShellPage` yourself, that's out of
scope for this task.

**3. `core/widgets/states/aim_notifications_sheet.dart` — `AIMNotificationsSheet`**
Used by: mainShell / home (bell icon → bottom sheet).
Design ref: `screenshots/menu/04-view.png`.
Params: `notifications` (List<NotificationItemData>), `onTapItem`, `onDismissItem`, `loading`,
`emptyMessage`. Use `AIMSkeleton` for loading rows and `AIMEmptyState` for the empty case — reuse,
don't reimplement.
Implement as a widget returned by `showModalBottomSheet`, i.e. a function/widget you can pass
directly to `showModalBottomSheet(builder: ...)` — do not wire the trigger button into any screen.

**4. `core/widgets/learning/aim_blob_card.dart` — `AIMBlobCard`**
Used by: home (dashboard), courseList.
Design ref: `screenshots/light/05-screen.png`, `screenshots/light/06-screen.png`.
A rounded card (`AimRadius.x2l`) with a gradient or solid-soft-fill background, icon, title,
subtitle, optional trailing chevron. Params: `gradient` (LinearGradient?), `backgroundColor`
(Color?, mutually exclusive with gradient), `icon`, `title`, `subtitle`, `trailing`, `onTap`.

**5. `core/widgets/buttons/aim_gradient_button.dart` — `AIMGradientButton`**
Used by: login, register, checkout.
A pill-shaped (`AimRadius.pill`) button filled with a `LinearGradient` instead of a solid color.
Params: `label`, `gradient` (default `AimGradients.gzHero`), `onPressed`, `loading` (bool, shows a
spinner replacing the label), `icon` (Widget?), `enabled`. Disabled state uses `AimColors`
disabled tokens, not a desaturated gradient hack.

**6. `core/widgets/learning/aim_stat_tile.dart` — `AIMStatTile`**
Used by: home, progress.
Design ref: `screenshots/light/05-screen.png`, `screenshots/light/11-screen.png`.
A small fixed-width tile: icon, big numeric value, label underneath. Params: `icon`, `value`
(String), `label`, `accentColor` (Color?, defaults to `AimColors.primary500`). Must work in a
horizontal scroll row (`SizedBox`-constrained width, not `Expanded`).

**7. `core/widgets/learning/aim_skill_blob.dart` — `AIMSkillBlob`**
Used by: skillState, profile.
Refactor target: read `apps/mobile/lib/features/progress/ui/widgets/progress_skill_state_card.dart`
first — this widget already implements most of the behavior but is feature-local and flagged as
placeholder/incomplete. Promote it into `core/widgets/learning/` as `AIMSkillBlob`, generalize its
params (`skillName`, `masteryLevel` 0.0–1.0, `color`, `size`), fix whatever made it
placeholder-flagged (check for TODO comments / stubbed values), and make it token-driven. After
creating the new widget, update `progress_skill_state_card.dart`'s callers to use `AIMSkillBlob`
instead, and delete the old feature-local file if nothing else references it.
Design ref: `screenshots/light/12-screen.png`, `screenshots/dark/12-screen.png`.

#### Commit and push

```
git checkout -b ui/theme-and-widgets
git add apps/mobile/lib/core/design_tokens/ apps/mobile/lib/core/widgets/ apps/mobile/lib/features/progress/ui/widgets/
git commit -m "feat(theme): add Gen Z gradient tokens and universal widget library"
git push -u origin ui/theme-and-widgets
```

Also create `apps/mobile/DEPRECATED_WIDGETS.md`:

| Old Widget | File | Replaced By | Screens Affected |
|---|---|---|---|
| (skill state card) | `features/progress/ui/widgets/progress_skill_state_card.dart` | `AIMSkillBlob` | skillState, profile |

── END OF TASK-00 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-01 — Login Screen
Branch: `ui/login`
Design ref: `docs/design/ui-for-all-system-mobile/SCREENS.md` → login section
            `screenshots/light/02-screen.png`, `screenshots/dark/02-screen.png`
Status: ⚠️ Partial
Endpoints: `POST /auth/login`, `POST /auth/test-login` (non-prod only)
Depends on: TASK-00 must be merged before this branch is created
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

You are working on the Flutter mobile app in `apps/mobile/`. Implement ONE screen only: Login.
Do not touch any other screen, any backend file, or any file outside the scope below.
BACKEND IS READ-ONLY — do not add, remove, or modify any endpoint.

**Scope:** `apps/mobile/lib/features/auth/ui/pages/login_page.dart`
**Branch:** `ui/login` (create from `main` after confirming TASK-00's `ui/theme-and-widgets` is merged)

**Before touching code:** open `screenshots/light/02-screen.png` and `screenshots/dark/02-screen.png`
side by side, read the login section of `SCREENS.md`, and grep `login_page.dart` for the existing
`TODO`/placeholder markers the audit found so you know exactly what's incomplete vs. what to leave
alone.

**What this screen does:** Email/password sign-in form with a primary CTA, a link to Register, and
(in non-prod builds only) a test-login shortcut. On success it routes into the authenticated shell.

**Endpoints:** Use the existing auth provider/repository already wired in this file —
`POST /auth/login`. Do not create a new provider or restructure state management; only fix the
placeholder-flagged sections.

**Universal widgets to use (from TASK-00 and existing core/widgets):**
- `AIMInput` (forms kit) for email/password fields
- `AIMGradientButton` for the primary "Sign in" CTA (gradient: `AimGradients.gzHero`)
- `AIMFullScreenLoading` / inline button loading state while the request is in flight
- `AIMAlertBanner` for login error display

**Design tokens:** `AimColors`, `AimTypography`/`AimTextStyles`, `AimSpacing`, `AimRadius`,
`AimShadows`, `AimGradients.gzHero`. Never hardcode a value.

**Steps:**
1. Create branch from `main` (rebase onto `ui/theme-and-widgets` if not yet merged, per the
   standard branch-conflict rule).
2. Add the design-ref header comment at the top of the file (design doc path, screenshot paths,
   endpoint, widgets used).
3. Replace whatever is placeholder/stubbed with the real layout matching the screenshots: app
   logo/title at top, email field, password field (with visibility toggle), primary gradient CTA,
   "Create account" text link routing to `AppRoutePaths.register`, test-login shortcut visible only
   when `kReleaseMode` is false (check how the existing code already gates this, don't invent a new
   flag).
4. Wire the login submit to the existing auth call; map field-level validation errors to the
   `AIMInput` error state, and request-level errors to `AIMAlertBanner`.
5. Implement all 4 states: loading (button shows spinner, fields disabled), empty (n/a — this is a
   form, not a list), error (`AIMAlertBanner` with retry = re-submit), success (navigates to
   `AppRoutePaths.mainShell`).
6. Verify dark mode against `screenshots/dark/02-screen.png` using only theme tokens.
7. RTL: `EdgeInsetsDirectional` everywhere, confirm Arabic label/placeholder text aligns correctly
   (check `core/localization/` for how other screens already source translated strings).
8. Test at 360px and 414px width — no overflow.
9. Confirm navigation: "Create account" → `AppRoutePaths.register`; successful login →
   `AppRoutePaths.mainShell` (matches the existing `AppRouter` redirect-from-splash/signIn logic).
10. If you find UI not shown in the screenshots, stop and ask — do not invent UI.
11. `flutter run`, navigate to login, check no red error boxes/overflow, toggle theme and RTL.
12. Delete the unused dead file `apps/mobile/lib/features/auth/ui/pages/sign_in_placeholder_page.dart`
    if (and only if) nothing imports it — grep first to confirm.

**Commit and push:**
```
git add apps/mobile/lib/features/auth/ui/pages/login_page.dart
git commit -m "feat(ui): implement Login screen — layout, tokens, endpoint wiring"
git push -u origin ui/login
```

── END OF TASK-01 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-02 — Register Screen
Branch: `ui/register`
Design ref: `SCREENS.md` → register section, `screenshots/light/03-screen.png`,
            `screenshots/dark/03-screen.png`
Status: ⚠️ Partial
Endpoints: `POST /auth/register`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

Same constraints as TASK-01 (Flutter app in `apps/mobile/`, single-screen scope, backend read-only).

**Scope:** `apps/mobile/lib/features/auth/ui/pages/register_page.dart`
**Branch:** `ui/register`

**What this screen does:** Account creation form (name, email, password, confirm password), submits
to `POST /auth/register`, and on success either signs the user in directly or shows a
verification-email-sent confirmation — check `SCREENS.md` and the existing (flagged placeholder)
code to determine which behavior is intended, and if ambiguous, stop and ask rather than guessing.

**Universal widgets:** `AIMInput`, `AIMGradientButton` (gradient `AimGradients.gzHero`),
`AIMAlertBanner`, `AIMFullScreenLoading`.

**Steps:** identical structure to TASK-01 steps 1–12, adapted for register fields and the
register→login or register→shell navigation flow. Specifically:
- Add design-ref header comment.
- Build the form layout per `screenshots/light/03-screen.png` / `dark/03-screen.png`.
- Wire `POST /auth/register` through the existing auth provider used in this file.
- Validate password confirmation client-side before submit; surface server validation errors
  (e.g. "email already in use") via `AIMAlertBanner`.
- 4 states: loading, n/a empty, error, success.
- Dark mode, RTL, 360/414px checks, 44px touch targets.
- Navigation: link back to `AppRoutePaths.signIn`.
- `flutter run` check, no overflow/errors, both themes, both directions.

**Commit and push:**
```
git add apps/mobile/lib/features/auth/ui/pages/register_page.dart
git commit -m "feat(ui): implement Register screen — layout, tokens, endpoint wiring"
git push -u origin ui/register
```

── END OF TASK-02 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-03 — Lesson List Screen
Branch: `ui/lesson-list`
Design ref: `SCREENS.md` → lessonList, `screenshots/light/08-screen.png`,
            `screenshots/dark/08-screen.png`
Status: ⚠️ Partial
Endpoints: `GET /curriculum/lessons?chapterId=`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/lessons/ui/pages/lesson_list_page.dart`
**Branch:** `ui/lesson-list`

**What this screen does:** Lists all lessons within a chapter (passed in via route arguments —
check how `chapterId`/`chapterTitle` are currently received, same pattern as `lessonDetail`'s
typed-argument handling in `app_router.dart`). Each row shows lesson title, type/icon, and
completion status; tapping navigates to `AppRoutePaths.lessonDetail`.

**Universal widgets:** `AIMCard` or `AIMBlobCard` (from TASK-00) for each lesson row, `AIMChip`/
`AIMBadge` for completion status, `AIMSkeleton` for loading list, `AIMEmptyState` for an empty
chapter, `AIMFullScreenError` for fetch failure.

**Steps:**
1. Branch from `main` (post TASK-00 merge).
2. Design-ref header comment.
3. Build list layout matching screenshots: chapter title header, scrollable list of lesson rows.
4. Wire `GET /curriculum/lessons?chapterId=` through the existing repository/provider already
   referenced in this file — fix whatever is placeholder-flagged, don't replace the data layer.
5. 4 states: skeleton list while loading, `AIMEmptyState` if a chapter has zero lessons,
   `AIMFullScreenError` with retry on fetch failure, real list on success.
6. Dark mode vs `screenshots/dark/08-screen.png`.
7. RTL: directional padding/icons, chevron mirrors in RTL.
8. 360/414px width, ellipsis on long lesson titles, 44px row touch targets.
9. Tap → `AppRoutePaths.lessonDetail` with the same arguments shape `app_router.dart` expects.
10. Ask before adding anything not in the screenshots.
11. `flutter run` check.

**Commit and push:**
```
git add apps/mobile/lib/features/lessons/ui/pages/lesson_list_page.dart
git commit -m "feat(ui): implement Lesson List screen — layout, tokens, endpoint wiring"
git push -u origin ui/lesson-list
```

── END OF TASK-03 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-04 — Lesson Detail Screen
Branch: `ui/lesson-detail`
Design ref: `SCREENS.md` → lessonDetail, `screenshots/light/09-screen.png`,
            `screenshots/dark/09-screen.png`
Status: ⚠️ Partial
Endpoints: `GET /curriculum/lessons/:id`, `GET /curriculum/lesson-assets`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/lessons/ui/pages/lesson_detail_page.dart`
**Branch:** `ui/lesson-detail`

**What this screen does:** Shows a lesson's overview plus its content blocks (text, media,
exercises). The audit found media rendering is currently stubbed to metadata-only (e.g. shows a
filename/icon instead of actually rendering image/audio/video blocks). Your job is to render each
block type per its design treatment in the screenshot, using whatever media-rendering widgets
already exist elsewhere in the app (search `lib/` for an existing image/audio player widget before
building a new one — do not duplicate if one exists for another feature, e.g. voice_teacher's audio
playback).

**Universal widgets:** `AIMCard` for block containers, `AIMSkeleton`, `AIMEmptyState`,
`AIMFullScreenError`.

**Steps:**
1. Branch, design-ref header comment.
2. Build the overview header (title, description, duration/progress) + scrollable list of content
   blocks matching `screenshots/light/09-screen.png`.
3. Wire `GET /curriculum/lessons/:id` and `GET /curriculum/lesson-assets` through the existing
   provider in this file.
4. Render each block type per its type field — text blocks as styled `AimTextStyles`, media blocks
   using a real player/image widget (reuse if one exists, otherwise ask before creating a new one —
   media playback is a bigger scope than this task's UI-only mandate).
5. 4 states: skeleton, n/a empty (a lesson always has content if it exists), error+retry, success.
6. Dark mode, RTL, 360/414px.
7. Navigation: "Start" / "Continue" CTA routes into the lesson's exercise/question flow exactly as
   the current code already does — don't change the destination, just the visual treatment.
8. If existing media playback infrastructure doesn't exist anywhere in the codebase, stop and ask
   rather than building a full media player — that may be a backend/infra gap, not just a UI gap.
9. `flutter run` check.

**Commit and push:**
```
git add apps/mobile/lib/features/lessons/ui/pages/lesson_detail_page.dart
git commit -m "feat(ui): implement Lesson Detail screen — layout, tokens, endpoint wiring"
git push -u origin ui/lesson-detail
```

── END OF TASK-04 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-05 — Skill State Screen
Branch: `ui/skill-state`
Design ref: `SCREENS.md` → skillState, `screenshots/light/12-screen.png`,
            `screenshots/dark/12-screen.png`
Status: ⚠️ Partial
Endpoints: `GET /aim/students/:id/skill-states`
Depends on: TASK-00 must be merged (provides `AIMSkillBlob`)
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/progress/ui/pages/skill_state_page.dart`
**Branch:** `ui/skill-state`

**What this screen does:** Shows skill mastery as a grid/list of "blob" visualizations, one per
skill, colored/sized by mastery level. Data comes from `GET /aim/students/:id/skill-states`.

**Universal widgets:** `AIMSkillBlob` (new from TASK-00 — replaces the old
`progress_skill_state_card.dart`), `AIMSkeleton`, `AIMEmptyState`, `AIMFullScreenError`.

**Steps:**
1. Branch (must come after TASK-00 merge since `AIMSkillBlob` doesn't exist before that).
2. Design-ref header comment.
3. Replace any direct use of the old `progress_skill_state_card.dart` widget in this page with
   `AIMSkillBlob`, laid out in a `Wrap`/`GridView` matching `screenshots/light/12-screen.png`
   (check spacing — likely `AimSpacing.componentGap` between blobs).
4. Wire `GET /aim/students/:id/skill-states` through the existing provider, mapping each skill's
   `masteryLevel` field to `AIMSkillBlob.masteryLevel`.
5. 4 states: skeleton grid, `AIMEmptyState` if no skills tracked yet, error+retry, success grid.
6. Dark mode vs `screenshots/dark/12-screen.png`.
7. RTL: grid should mirror via `Directionality`, not need special handling if using
   `AlignmentDirectional`-based wrap.
8. 360/414px — blob sizes should scale or wrap, not overflow.
9. Tap on a blob → whatever drill-down behavior the existing code already implements (e.g. skill
   detail bottom sheet) — preserve it, just restyle.
10. `flutter run` check.

**Commit and push:**
```
git add apps/mobile/lib/features/progress/ui/pages/skill_state_page.dart
git commit -m "feat(ui): implement Skill State screen using AIMSkillBlob"
git push -u origin ui/skill-state
```

── END OF TASK-05 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-06 — Edit Profile Screen
Branch: `ui/edit-profile`
Design ref: `SCREENS.md` → editProfile, `screenshots/light/17-screen.png`,
            `screenshots/dark/17-screen.png`
Status: ⚠️ Partial
Endpoints: `PATCH /profile/me`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/profile/ui/pages/edit_profile_page.dart`
**Branch:** `ui/edit-profile`
**Note:** no named route constant exists for `editProfile` in `app_route_paths.dart` — it's reached
via an unnamed `Navigator.push(MaterialPageRoute(...))` from `profile_page.dart`. Keep that
navigation mechanism exactly as-is; do not add a named route as part of this task.

**What this screen does:** Form to edit display name, avatar, and other profile fields, submitting
via `PATCH /profile/me`.

**Universal widgets:** `AIMInput`, avatar picker (check if one exists in `core/widgets/` or
`profile/ui/widgets/` already — reuse, don't recreate), `AIMGradientButton` for Save,
`AIMAlertBanner` for errors.

**Steps:**
1. Branch.
2. Design-ref header comment.
3. Build form layout per `screenshots/light/17-screen.png`: avatar with edit affordance, name
   field, any other fields shown in the screenshot, Save CTA.
4. Wire `PATCH /profile/me` through the existing provider, pre-populated from current profile data.
5. 4 states: loading (initial fetch + submit-in-flight), n/a empty, error (`AIMAlertBanner`),
   success (navigates back to profile, likely with a snackbar confirmation — check existing pattern
   elsewhere in the app for post-save confirmations).
6. Dark mode, RTL, 360/414px, 44px touch targets.
7. Back navigation returns to `profile_page.dart` exactly as it currently does.
8. `flutter run` check.

**Commit and push:**
```
git add apps/mobile/lib/features/profile/ui/pages/edit_profile_page.dart
git commit -m "feat(ui): implement Edit Profile screen — layout, tokens, endpoint wiring"
git push -u origin ui/edit-profile
```

── END OF TASK-06 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-07 — Placement Intro Screen
Branch: `ui/placement-intro`
Design ref: `SCREENS.md` → placementIntro, `screenshots/light/18-screen.png`,
            `screenshots/dark/18-screen.png`
Status: ❌ Missing (currently literal "coming soon" stub text)
Endpoints: none required — purely an explainer screen before `AppRoutePaths.placementStart`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/placement/ui/pages/placement_intro_page.dart`
**Branch:** `ui/placement-intro`
**Note:** no named route for `placementIntro` — reached via unnamed push from wherever placement is
first offered (search for where this page is currently pushed to confirm the entry point and the
"Start" button's destination, which should be `AppRoutePaths.placementStart`).

**What this screen does:** An explainer screen shown before the placement test starts — what the
test covers, how long it takes, a "Start" CTA. Currently it's a stub with just "Placement Intro —
coming soon" text; replace it entirely with the real layout.

**Universal widgets:** `AIMGradientHeroHeader` (new from TASK-00, gradient `AimGradients.gzHero`)
for the top banner, `AIMGradientButton` for "Start".

**Steps:**
1. Branch.
2. Design-ref header comment.
3. Build the full layout per `screenshots/light/18-screen.png` — hero header, explanatory copy
   (pull exact text from `SCREENS.md` if specified, otherwise ask if not in the screenshot), list of
   what to expect (icons + short labels), Start CTA.
4. No endpoint to wire — this is static content. If the screenshot shows any dynamic data (e.g.
   estimated time pulled from a config), check `SCREENS.md` for the source; if none documented,
   stop and ask rather than hardcoding a guess.
5. States: this screen has no loading/empty/error — it's static. Just success/default render.
6. Dark mode, RTL, 360/414px.
7. "Start" → `AppRoutePaths.placementStart` (verify by checking how `placement_start_page.dart` is
   currently reached from elsewhere, for consistency).
8. `flutter run` check — confirm the "coming soon" stub text is fully gone.

**Commit and push:**
```
git add apps/mobile/lib/features/placement/ui/pages/placement_intro_page.dart
git commit -m "feat(ui): implement Placement Intro screen, replacing coming-soon stub"
git push -u origin ui/placement-intro
```

── END OF TASK-07 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-08 — Placement Question Screen
Branch: `ui/placement-question`
Design ref: `SCREENS.md` → placementQuestion, `screenshots/light/21-screen.png`,
            `screenshots/dark/21-screen.png`
Status: ⚠️ Partial
Endpoints: `GET /placement/questions?sectionId=`, `POST /placement/attempts/:id/answers`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/placement/ui/pages/placement_question_page.dart`
**Branch:** `ui/placement-question`

**What this screen does:** Displays one placement-test question at a time with answer options,
submits the answer, and advances. Reuses the same answer-option pattern as the regular question
flow.

**Universal widgets:** `AIMAnswerOption` (`core/widgets/learning/aim_answer_option.dart` — already
exists, reuse it), `AIMProgressBar` for question-N-of-M progress, `AIMGradientButton` for
Next/Submit.

**Steps:**
1. Branch.
2. Design-ref header comment.
3. Build layout per `screenshots/light/21-screen.png`: progress indicator at top, question prompt,
   `AIMAnswerOption` list, Next CTA.
4. Wire `GET /placement/questions?sectionId=` for question data and
   `POST /placement/attempts/:id/answers` on submit, through the existing provider in this file —
   fix the placeholder-flagged sections, keep the data layer.
5. 4 states: skeleton while loading next question, n/a empty, error+retry on submit failure,
   success (advances to next question or to `AppRoutePaths.placementSubmit` on the last one).
6. Dark mode, RTL (answer options should mirror selection-indicator side), 360/414px.
7. Disable Next until an option is selected; 44px touch targets on options.
8. `flutter run` check.

**Commit and push:**
```
git add apps/mobile/lib/features/placement/ui/pages/placement_question_page.dart
git commit -m "feat(ui): implement Placement Question screen — layout, tokens, endpoint wiring"
git push -u origin ui/placement-question
```

── END OF TASK-08 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-09 — Assessment Attempt Screen
Branch: `ui/assessment-attempt`
Design ref: `SCREENS.md` → attempt, `screenshots/light/27-screen.png`,
            `screenshots/dark/27-screen.png`
Status: ⚠️ Partial (question rendering area is a placeholder)
Endpoints: `GET /student/assessments/attempts/:attemptId/resume`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/assessments/ui/pages/attempt_page.dart`
**Branch:** `ui/assessment-attempt`

**What this screen does:** In-progress assessment attempt — shows the current question, lets the
student answer, navigate between questions, and eventually submit. The audit found the question
rendering area itself is literally a placeholder; replace it with a real renderer.

**Universal widgets:** `AIMAnswerOption`, `AIMProgressBar`, `AIMGradientButton`. If the question
types here overlap with `question_answer` feature's question rendering (e.g. multiple choice,
fill-blank), reuse that feature's widgets (`question_fill_blank_input.dart` etc., once fixed by
TASK-10) rather than re-implementing question-type rendering from scratch — check for overlap
before writing new rendering logic.

**Steps:**
1. Branch.
2. Design-ref header comment.
3. Replace the placeholder question area with real rendering per question type, matching
   `screenshots/light/27-screen.png`: top bar with timer/progress, question body, answer input
   area, prev/next navigation.
4. Wire `GET /student/assessments/attempts/:attemptId/resume` through the existing provider for
   resuming an in-progress attempt and loading current question state.
5. 4 states: skeleton while resuming, n/a empty, error+retry, success (interactive attempt UI).
6. Dark mode, RTL, 360/414px.
7. Navigation to `AppRoutePaths` for submit-attempt screen on completion — preserve whatever the
   existing (placeholder) code already does for that transition.
8. If a question type appears in the design that has no existing renderer anywhere in the codebase,
   stop and ask before inventing one.
9. `flutter run` check.

**Commit and push:**
```
git add apps/mobile/lib/features/assessments/ui/pages/attempt_page.dart
git commit -m "feat(ui): implement Assessment Attempt screen question rendering"
git push -u origin ui/assessment-attempt
```

── END OF TASK-09 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-10 — Question Page (fill-in-the-blank input)
Branch: `ui/question-page`
Design ref: `SCREENS.md` → questionPage, `screenshots/light/32-screen.png`,
            `screenshots/dark/32-screen.png`
Status: ⚠️ Partial (widget `question_fill_blank_input.dart` flagged placeholder)
Endpoints: `POST /sessions/start`, `POST /sessions/:id/attempt`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/question_answer/ui/pages/question_page.dart` AND
`apps/mobile/lib/features/question_answer/ui/widgets/question_fill_blank_input.dart`
**Branch:** `ui/question-page`

**What this screen does:** Practice question flow (used outside assessments/placement). The page
itself is mostly fine per the audit; the fill-in-the-blank answer-input widget specifically is
flagged as placeholder/incomplete.

**Steps:**
1. Branch.
2. Design-ref header comment on both files.
3. Fix `question_fill_blank_input.dart`: replace placeholder behavior with a real text-input field
   styled per `screenshots/light/32-screen.png` (likely an underlined/boxed inline blank using
   `AIMInput` styling tokens), wired to update the parent question's answer state on change.
4. Confirm `question_page.dart` correctly embeds this fixed widget and that `POST /sessions/start`
   / `POST /sessions/:id/attempt` are wired through the existing provider (don't change the data
   layer, just confirm the UI now reflects real input).
5. 4 states: skeleton, n/a empty, error+retry, success.
6. Dark mode, RTL (blank input should still read correctly in Arabic — confirm cursor/placeholder
   alignment), 360/414px.
7. `flutter run` check — type into the blank, confirm answer state updates and submit works.

**Commit and push:**
```
git add apps/mobile/lib/features/question_answer/ui/pages/question_page.dart apps/mobile/lib/features/question_answer/ui/widgets/question_fill_blank_input.dart
git commit -m "fix(ui): implement real fill-in-the-blank input on Question Page"
git push -u origin ui/question-page
```

── END OF TASK-10 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-11 — AI Teacher Chat Screen
Branch: `ui/ai-chat`
Design ref: `SCREENS.md` → aiChat, `screenshots/light/33-screen.png`,
            `screenshots/dark/33-screen.png`
Status: ⚠️ Partial (widget `ai_chat_input_bar.dart` flagged placeholder)
Endpoints: `POST /ai-teacher/sessions`, `POST /ai-teacher/sessions/:id/messages`
           (or `/messages/stream` if streaming is wired)
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/ai_teacher/ui/pages/ai_teacher_chat_page.dart` AND
`apps/mobile/lib/features/ai_teacher/ui/widgets/ai_chat_input_bar.dart`
**Branch:** `ui/ai-chat`

**What this screen does:** Chat interface with the AI teacher — message bubbles (user + AI) plus a
bottom input bar. The page itself reuses `AIMAIFeedbackBubble`; the input bar specifically is
flagged placeholder.

**Steps:**
1. Branch.
2. Design-ref header comment on both files.
3. Fix `ai_chat_input_bar.dart`: replace placeholder with a real text field + send button matching
   `screenshots/light/33-screen.png` — multi-line growable input, send button disabled when empty,
   loading/disabled state while a message is in flight.
4. Confirm `ai_teacher_chat_page.dart` wires the input bar's submit to the existing
   `POST /ai-teacher/sessions/:id/messages` (or streaming variant) call, and that incoming AI
   responses render via `AIMAIFeedbackBubble`.
5. 4 states: skeleton while loading session history, `AIMEmptyState` for a brand-new chat with no
   messages yet, error+retry on send failure, success (live chat).
6. Dark mode, RTL (message bubbles should mirror alignment — user messages on the trailing side),
   360/414px, input bar respects keyboard-safe-area insets.
7. `flutter run` check — send a message, confirm input clears and bubble renders.

**Commit and push:**
```
git add apps/mobile/lib/features/ai_teacher/ui/pages/ai_teacher_chat_page.dart apps/mobile/lib/features/ai_teacher/ui/widgets/ai_chat_input_bar.dart
git commit -m "fix(ui): implement real AI chat input bar on AI Teacher Chat screen"
git push -u origin ui/ai-chat
```

── END OF TASK-11 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-12 — Voice Teacher Screen
Branch: `ui/voice-teacher`
Design ref: `SCREENS.md` → voice, `screenshots/light/36-screen.png`,
            `screenshots/dark/36-screen.png`
Status: ⚠️ Partial
Endpoints: `POST /voice-teacher/sessions`, `GET /voice-teacher/sessions/:id/audio`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/voice_teacher/ui/pages/voice_teacher_page.dart`
**Branch:** `ui/voice-teacher`

**What this screen does:** Voice/speaking practice screen with idle, listening, speaking, and error
states, centered on `AIMRecordButton`.

**Universal widgets:** `AIMRecordButton` (reuse, already exists), `AIMFullScreenError`.

**Steps:**
1. Branch.
2. Design-ref header comment.
3. Build/fix the layout per `screenshots/light/36-screen.png`: prompt text, central
   `AIMRecordButton` with visual state changes (idle/listening/speaking), waveform or pulse
   animation if shown in the design, transcript/feedback area below.
4. Wire `POST /voice-teacher/sessions` and `GET /voice-teacher/sessions/:id/audio` through the
   existing provider — fix whatever's placeholder-flagged, preserve the data layer.
5. Implement the 4 interaction states explicitly: idle (ready to record), listening (recording in
   progress), speaking (AI audio playing back), error (mic permission denied / network failure,
   `AIMFullScreenError` or inline banner with retry).
6. Dark mode, RTL, 360/414px, `AIMRecordButton` remains ≥44px and centered regardless of direction.
7. `flutter run` check — mic permission flow, state transitions, theme toggle.

**Commit and push:**
```
git add apps/mobile/lib/features/voice_teacher/ui/pages/voice_teacher_page.dart
git commit -m "feat(ui): implement Voice Teacher screen states — idle/listening/speaking/error"
git push -u origin ui/voice-teacher
```

── END OF TASK-12 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-13 — Achievements Screen
Branch: `ui/achievements`
Design ref: `SCREENS.md` → achievements, `screenshots/light/59-screen.png`,
            `screenshots/dark/59-screen.png`
Status: ❌ Missing (empty state only, no backend data wired)
Endpoints: **BLOCKED** — no achievements endpoint found in `docs/mobile-app-api-endpoints.md`
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

**Scope:** `apps/mobile/lib/features/achievements/ui/pages/achievements_page.dart`
**Branch:** `ui/achievements`

**What this screen does:** A gallery of unlockable achievements/badges with locked/unlocked visual
states. Currently shows only the empty state with no real data source.

**BLOCKED endpoint note:** No backend endpoint for achievements data was found in
`docs/mobile-app-api-endpoints.md`. Per the read-only-backend constraint, this task is scoped to
**UI-only**: build the full visual layout (grid of achievement tiles, locked/unlocked states,
detail view) driven by a typed local model and the existing empty-state path, but do NOT invent a
fake endpoint call. If a real endpoint does exist and was simply missed in the docs audit, grep the
codebase for any `achievement` references in API client/repository files before assuming it's
blocked — if found, wire it; if genuinely absent, leave the data layer as a clearly-marked TODO
calling out the missing backend endpoint, and keep the `AIMEmptyState` as the default render path
until a backend task adds the endpoint.

**Universal widgets:** `AIMBlobCard` or a grid-friendly `AIMCard` variant for each achievement tile,
`AIMEmptyState`, `AIMBadge` for locked/unlocked indicator.

**Steps:**
1. Branch.
2. Design-ref header comment, including a note that data wiring is blocked pending a backend
   endpoint.
3. Build the grid layout per `screenshots/light/59-screen.png`: achievement tiles with icon, title,
   locked (greyed/outline) vs unlocked (full-color/gradient) visual treatment.
4. Grep `apps/mobile/lib` for any existing achievements API call before concluding it's blocked.
5. States: `AIMEmptyState` (current default, keep working), and if you find real data is reachable,
   skeleton/error/success states too.
6. Dark mode, RTL, 360/414px.
7. `flutter run` check.

**Commit and push:**
```
git add apps/mobile/lib/features/achievements/ui/pages/achievements_page.dart
git commit -m "feat(ui): implement Achievements screen layout (data wiring blocked — no backend endpoint)"
git push -u origin ui/achievements
```

── END OF TASK-13 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-14 — Wire Missing Routes
Branch: `ui/routing-wiring`
Design ref: n/a — this is routing plumbing, not visual work
Status: 24 screens have a working page file with no named route
Depends on: TASK-00 must be merged. Should be the LAST branch merged of TASK-00–19 since it touches
the shared router files every screen's navigation passes through — merging it after the screen
branches avoids rebase conflicts on `app_router.dart`.
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

You are working on the Flutter mobile app in `apps/mobile/`. Your job is ONLY to add missing named
routes — do not touch screen layout/content, do not touch the backend.

**Scope:**
- `apps/mobile/lib/core/routing/app_route_paths.dart`
- `apps/mobile/lib/core/routing/app_router.dart`

**Background:** An audit of `apps/mobile/lib/core/routing/` found these 24 screens have a complete
page widget but are NOT reachable via any named route in `AppRoutePaths`/`AppRouter.onGenerateRoute`
— they're either unreachable, or only reachable via an ad hoc unnamed `Navigator.push` from one
specific parent screen that the audit didn't fully trace. Your job: give each one a proper named
route, following the exact existing pattern in `app_router.dart` (the `switch (routeName)` with
typed-argument `_build*` helper functions, see `_buildLessonDetailPage` for the pattern of a route
that needs typed arguments via `settings.arguments`).

| # | Screen id | File | Suggested route path | Args needed (check the page's constructor) |
|---|---|---|---|---|
| 10 | review | `reviews/ui/pages/review_page.dart` | `/main/review-queue` or fold into existing `review` shell tab — check `MainShellPage` first to see if this page is meant to be the `review` tab's content (if so, this may already be wired through the shell's `IndexedStack` and not need a top-level route at all — verify before adding one) | none expected |
| 18 | placementIntro | `placement/ui/pages/placement_intro_page.dart` | `/placement/intro` | none |
| 28 | submitAttempt (assessments) | `assessments/ui/pages/submit_attempt_page.dart` | `/student/assessments/submit` | `attemptId`, `assessmentTitle` |
| 30 | resultHistory | `assessments/ui/pages/result_history_page.dart` | `/student/assessments/history` | `assessmentId` |
| 31 | deadlines | `assessments/ui/pages/deadlines_page.dart` | `/student/assessments/deadlines` | none |
| 34 | aiHistory | `ai_teacher/ui/pages/ai_teacher_session_history_page.dart` | `/ai-teacher/history` | none |
| 35 | aiSettings | `ai_teacher/ui/pages/ai_teacher_settings_page.dart` | `/ai-teacher/settings` | none |
| 36 | voice | `voice_teacher/ui/pages/voice_teacher_page.dart` | `/voice-teacher` | check page constructor for a required lesson/context ref |
| 37 | learningPath | `learning_path/ui/pages/learning_path_page.dart` | `/learning-path` | none |
| 40 | notifDetail | `notifications/ui/pages/notification_detail_page.dart` | `/notifications/detail` | `eventId` |
| 41 | notifPrefs | `notifications/ui/pages/notification_preferences_page.dart` | `/notifications/preferences` | none |
| 42 | reminderSettings | `notifications/ui/pages/reminder_settings_page.dart` | `/notifications/reminders` | none |
| 45 | checkoutStart | `billing/ui/pages/checkout_start_page.dart` | `/billing/checkout/start` | `planId` |
| 46 | checkoutStatus | `billing/ui/pages/checkout_status_page.dart` | `/billing/checkout/status` | `sessionId` |
| 48 | helpCenter | `support/ui/pages/help_center_page.dart` | `/support/help` | none |
| 49 | parentHelp | `support/ui/pages/parent_help_center_page.dart` | `/support/parent-help` | none |
| 50 | createTicket | `support/ui/pages/create_ticket_page.dart` | `/support/tickets/new` | none |
| 51 | feedback | `support/ui/pages/feedback_page.dart` | `/support/feedback` | none |
| 52 | ticketList | `support/ui/pages/ticket_list_page.dart` | `/support/tickets` | none |
| 53 | parentTicketList | `support/ui/pages/parent_ticket_list_page.dart` | `/support/parent-tickets` | none |
| 54 | ticketDetail | `support/ui/pages/ticket_detail_page.dart` | `/support/tickets/detail` | `ticketId` |
| 55 | status | `support/ui/pages/status_page.dart` | `/support/status` | none |
| 56 | releaseNotes | `support/ui/pages/release_notes_page.dart` | `/support/release-notes` | none |
| 57 | releaseNoteDetail | `support/ui/pages/release_note_detail_page.dart` | `/support/release-notes/detail` | `noteId` |
| 58 | dsPreview | `design_system_preview/ui/pages/ds_preview_page.dart` | `/dev-tools/design-system` (dev-only, mirror how `endpointTester` is registered as a non-protected dev route) | none |

**Steps:**
1. Branch from `main` after confirming TASK-00 is merged. Rebase onto each screen branch's tip only
   if you hit conflicts — this branch should otherwise be independent since it doesn't touch any
   screen file.
2. For `review` (#10): first check `MainShellPage`/`main_shell_tab_provider.dart` — it may already
   be the review tab's content via the `IndexedStack`, in which case it needs no separate route. Only
   add a route if it's genuinely a standalone page nothing currently shows.
3. For each remaining row: add a `static const` to `AppRoutePaths`, add a `case` to the
   `onGenerateRoute` switch, and (if the page constructor needs arguments) a typed `_build*` helper
   matching the existing pattern — read the target page's constructor signature first to know
   exactly what arguments are required, don't guess.
4. Decide protected vs. unprotected: everything except `dsPreview` should be added to
   `_protectedRoutes` (all of them require a signed-in user per their backend endpoints) — verify
   against how similar existing protected routes are declared.
5. Do NOT change how any screen navigates internally — only add the missing destination route. If a
   parent screen needs a button wired to navigate to one of these new routes, that's the parent
   screen's task to do (e.g. TASK-12 for voice, TASK-07 for placementIntro) — this task only makes
   the destination reachable, it doesn't add new navigation triggers elsewhere.
6. `flutter analyze` to confirm no broken references; `flutter run` and manually navigate to a
   couple of the newly-added routes via `Navigator.pushNamed` in a temporary debug button or the
   dev-tools endpoint tester page, then remove any temporary test code before committing.

**Commit and push:**
```
git checkout -b ui/routing-wiring
git add apps/mobile/lib/core/routing/app_route_paths.dart apps/mobile/lib/core/routing/app_router.dart
git commit -m "feat(routing): add named routes for screens previously unreachable via AppRouter"
git push -u origin ui/routing-wiring
```

── END OF TASK-14 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-15 — Menu Drawer + Notifications Sheet Integration
Branch: `ui/menu-integration`
Design ref: `screenshots/menu/01-view.png` (Home, dark), `screenshots/menu/02-view.png` (drawer,
            dark), `screenshots/menu/03-view.png` (drawer, light), `screenshots/menu/04-view.png`
            (notifications sheet)
Status: ❌ Missing — `AIMAppDrawer`/`AIMNotificationsSheet` are built in TASK-00 but never wired
        into a screen
Depends on: TASK-00 must be merged (provides `AIMAppDrawer`, `AIMNotificationsSheet`)
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

You are working on the Flutter mobile app in `apps/mobile/`. Your job is to wire the side menu
drawer and the notifications bottom sheet into the app shell — these widgets are built by TASK-00
but not yet attached to any screen.

**Scope:**
- `apps/mobile/lib/features/shell/ui/pages/main_shell_page.dart`
- `apps/mobile/lib/core/widgets/navigation/aim_top_app_bar.dart` (only if a hamburger/menu icon
  needs adding to trigger the drawer — check current params first)

BACKEND IS READ-ONLY.

**What this covers:** `screenshots/menu/02-view.png`/`03-view.png` show a side drawer (opened from
the app bar) listing navigation destinations + a header with user avatar/name + a footer
(e.g. sign out). `screenshots/menu/04-view.png` shows a bottom sheet of notifications, triggered by
a bell icon — this is a quick-glance overlay, distinct from the full `notifInbox` screen.

**Endpoints:** Reuse whatever the existing `notifInbox`/`notification_inbox_page.dart` provider
already exposes for notification data (`GET /api/v1/notifications/inbox`) — do not create a second
data source for the sheet, point `AIMNotificationsSheet` at the same provider.

**Steps:**
1. Branch.
2. Add a design-ref header comment to `main_shell_page.dart` noting the menu/drawer integration.
3. Wire `AIMAppDrawer` into `MainShellPage`'s `Scaffold.drawer` (or `endDrawer` if RTL/LTR
   conventions in the screenshots indicate the trailing side — check `02-view.png`/`03-view.png` for
   which edge the drawer opens from, and confirm it mirrors correctly in RTL).
4. Populate `AIMAppDrawer.items` with the app's primary navigation destinations (Home, Learn,
   Review, Progress, Profile, plus secondary items like Settings/Help/Sign out as shown in the
   screenshot) using the existing route constants from `AppRoutePaths` — do not invent new
   destinations not shown in the screenshots.
5. Add a hamburger/menu trigger icon to the top app bar (or confirm one already exists) that opens
   the drawer via `Scaffold.of(context).openDrawer()`.
6. Wire the bell icon (check if `notification_bell_button.dart` already exists and is placed
   correctly — the audit found this widget already exists in
   `features/notifications/ui/widgets/notification_bell_button.dart`) to open
   `AIMNotificationsSheet` via `showModalBottomSheet`, instead of/in addition to whatever it
   currently does — check its current `onTap` behavior before changing it; if it already navigates
   to the full inbox, decide per the screenshots whether tapping the bell should open the quick
   sheet (with a "View all" link to the full inbox) or keep navigating directly, and ask if
   ambiguous.
7. Dark mode vs `02-view.png`, light mode vs `03-view.png`, sheet vs `04-view.png`.
8. RTL: drawer slide direction and sheet content must mirror correctly.
9. `flutter run` — open the drawer, open the notifications sheet, confirm both render correctly in
   both themes and both directions, and that drawer items navigate correctly.

**Commit and push:**
```
git checkout -b ui/menu-integration
git add apps/mobile/lib/features/shell/ui/pages/main_shell_page.dart
git commit -m "feat(ui): wire side menu drawer and notifications sheet into app shell"
git push -u origin ui/menu-integration
```

── END OF TASK-15 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-16 — Verification: Auth, Shell, Home, Lessons
Branch: `ui/verify-auth-shell-home-lessons`
Screens covered: 01 splash, 04 mainShell, 05 home, 06 courseList, 07 chapterList
Status: ✅ Match per audit — this task confirms it, fixes only what's actually wrong
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

You are working on the Flutter mobile app in `apps/mobile/`. These 5 screens were already audited
as matching the design (✅), so your job is **verification, not a rebuild**: confirm each screen
against its screenshots in both themes, and fix only concrete discrepancies you find — do not
restructure working code, do not add features not shown in the screenshots.

**Screens and files:**
| Screen | File | Screenshots |
|---|---|---|
| splash | `features/onboarding/ui/pages/splash_page.dart` | `light/01-screen.png`, `dark/01-screen.png` |
| mainShell | `features/shell/ui/pages/main_shell_page.dart` | `light/04-screen.png`, `dark/04-screen.png` |
| home | `features/home/ui/pages/home_page.dart` | `light/05-screen.png`, `dark/05-screen.png` |
| courseList | `features/lessons/ui/pages/course_list_page.dart` | `light/06-screen.png`, `dark/06-screen.png` |
| chapterList | `features/lessons/ui/pages/chapter_list_page.dart` | `light/07-screen.png`, `dark/07-screen.png` |

**Note:** `home_page.dart` is a good candidate to adopt `AIMGradientHeroHeader`, `AIMStatTile`, and
`AIMBlobCard` from TASK-00 if its current layout uses ad hoc local widgets that visually approximate
but don't exactly match those new universal widgets — check `features/home/ui/widgets/` for
`home_section_header.dart`, `home_goal_card.dart`, etc. and replace with the TASK-00 universal
widgets where they're a drop-in visual match, to reduce the duplication the audit flagged across
home/progress/learning_path. Don't force the swap if it would change the visual result — screenshots
are ground truth, not the new widgets.

**Steps per screen:**
1. Open the light and dark screenshot side by side with the running screen.
2. Check: layout/spacing match `AimSpacing` tokens, colors match `AimColors`/`AimColorTheme` (no
   hardcoded hex), dark mode renders correctly, RTL mirrors correctly, no overflow at 360px/414px,
   44px touch targets, loading/empty/error states present and using `AIMSkeleton`/`AIMEmptyState`/
   `AIMFullScreenError`.
3. If you find a real mismatch, fix it minimally. If everything matches, make no change to that
   file.
4. Where `home_page.dart`'s local widgets are a clean swap for TASK-00's universal widgets, make the
   swap and delete the now-unused local widget file if nothing else references it.

**Commit and push (only if you made changes):**
```
git checkout -b ui/verify-auth-shell-home-lessons
git add apps/mobile/lib/features/onboarding apps/mobile/lib/features/shell apps/mobile/lib/features/home apps/mobile/lib/features/lessons
git commit -m "fix(ui): verification pass on splash/shell/home/courseList/chapterList"
git push -u origin ui/verify-auth-shell-home-lessons
```
If no changes were needed, report that explicitly instead of pushing an empty branch.

── END OF TASK-16 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-17 — Verification: Progress, Profile, Reviews
Branch: `ui/verify-progress-profile`
Screens covered: 11 progress, 13 weakness, 14 recommendations, 15 reviewSchedule, 16 profile
Status: ✅ Match per audit
Depends on: TASK-00 must be merged (provides `AIMSkillBlob`, `AIMStatTile` for potential reuse)
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

Same verification-only mandate as TASK-16 — confirm against screenshots, fix only real
discrepancies, no rebuilds.

**Screens and files:**
| Screen | File | Screenshots |
|---|---|---|
| progress | `features/progress/ui/pages/progress_page.dart` | `light/11-screen.png`, `dark/11-screen.png` |
| weakness | `features/progress/ui/pages/weakness_summary_page.dart` | `light/13-screen.png`, `dark/13-screen.png` |
| recommendations | `features/progress/ui/pages/recommendations_page.dart` | `light/14-screen.png`, `dark/14-screen.png` |
| reviewSchedule | `features/progress/ui/pages/review_schedule_page.dart` | `light/15-screen.png`, `dark/15-screen.png` |
| profile | `features/profile/ui/pages/profile_page.dart` | `light/16-screen.png`, `dark/16-screen.png` |

**Note:** `progress_recommendation_card.dart`, `progress_weakness_chip.dart`,
`progress_section_header.dart` here duplicate near-identical widgets in `features/learning_path/ui/
widgets/`. If you find both sets are simple visual matches for shared widgets, consolidate by
promoting one shared implementation into `core/widgets/` and pointing both features at it — but only
if TASK-18 (which covers `learningPath`) hasn't already done so; check for that branch/PR first to
avoid duplicate work, and if in doubt leave the consolidation for a separate cleanup task rather than
risk conflicting with TASK-18.

**Steps:** same checklist as TASK-16 (theme tokens, dark mode, RTL, 360/414px, touch targets, 4
states).

**Commit and push (only if changes were made):**
```
git checkout -b ui/verify-progress-profile
git add apps/mobile/lib/features/progress apps/mobile/lib/features/profile
git commit -m "fix(ui): verification pass on progress/weakness/recommendations/reviewSchedule/profile"
git push -u origin ui/verify-progress-profile
```

── END OF TASK-17 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-18 — Verification: Placement, Assessments
Branch: `ui/verify-placement-assessments`
Screens covered: 19 placementStart, 20 placementSection, 22 placementSubmit, 23 placementResult,
                 24 assessmentList, 25 assessmentDetail, 26 startAttempt, 29 assessmentResult
Status: ✅ Match per audit
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

Same verification-only mandate as TASK-16.

**Screens and files:**
| Screen | File | Screenshots |
|---|---|---|
| placementStart | `features/placement/ui/pages/placement_start_page.dart` | `light/19-screen.png`, `dark/19-screen.png` |
| placementSection | `features/placement/ui/pages/placement_section_page.dart` | `light/20-screen.png`, `dark/20-screen.png` |
| placementSubmit | `features/placement/ui/pages/placement_submit_page.dart` | `light/22-screen.png`, `dark/22-screen.png` |
| placementResult | `features/placement/ui/pages/placement_result_page.dart` | `light/23-screen.png`, `dark/23-screen.png` |
| assessmentList | `features/assessments/ui/pages/assessment_list_page.dart` | `light/24-screen.png`, `dark/24-screen.png` |
| assessmentDetail | `features/assessments/ui/pages/assessment_detail_page.dart` | `light/25-screen.png`, `dark/25-screen.png` |
| startAttempt | `features/assessments/ui/pages/start_attempt_page.dart` | `light/26-screen.png`, `dark/26-screen.png` |
| assessmentResult | `features/assessments/ui/pages/assessment_result_page.dart` | `light/29-screen.png`, `dark/29-screen.png` |

**Note:** `assessment_list_tile.dart` has an internal `_DeadlineStatusChip` that duplicates
`deadline_status_widgets.dart`'s `DeadlineStatusBadge`/`DeadlineStatusCard` (used by the `deadlines`
screen, TASK-14 routing target). If you find this duplication causes a visible inconsistency between
`assessmentList`'s deadline chip and the dedicated `deadlines` screen's badge, consolidate on one
implementation; otherwise leave both, this isn't required for visual match.

**Steps:** same checklist as TASK-16, applied to all 8 screens.

**Commit and push (only if changes were made):**
```
git checkout -b ui/verify-placement-assessments
git add apps/mobile/lib/features/placement apps/mobile/lib/features/assessments
git commit -m "fix(ui): verification pass on placement and assessment screens"
git push -u origin ui/verify-placement-assessments
```

── END OF TASK-18 PROMPT ──

---

════════════════════════════════════════════════════════
## TASK-19 — Verification: AI Teacher, Analytics, Notifications, Billing
Branch: `ui/verify-ai-notifications-billing`
Screens covered: 38 analytics, 39 notifInbox, 43 pricing, 44 subscription, 47 invoiceHistory
Status: ✅ Match per audit
Depends on: TASK-00 must be merged
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

Same verification-only mandate as TASK-16.

**Screens and files:**
| Screen | File | Screenshots |
|---|---|---|
| analytics | `features/analytics_summary/ui/pages/analytics_summary_page.dart` | `light/38-screen.png`, `dark/38-screen.png` |
| notifInbox | `features/notifications/ui/pages/notification_inbox_page.dart` | `light/39-screen.png`, `dark/39-screen.png` |
| pricing | `features/billing/ui/pages/pricing_page.dart` | `light/43-screen.png`, `dark/43-screen.png` |
| subscription | `features/billing/ui/pages/subscription_page.dart` | `light/44-screen.png`, `dark/44-screen.png` |
| invoiceHistory | `features/billing/ui/pages/invoice_history_page.dart` | `light/47-screen.png`, `dark/47-screen.png` |

**Note on billing:** `docs/mobile-app-api-endpoints.md` marks most `/billing/*` endpoints as
"Planned / Not Yet Active." These 3 billing screens already have concrete datasource
implementations per the audit, but verify they degrade gracefully (clear error/empty state, not a
crash) if the backend endpoint isn't actually live yet in this environment — that's an acceptable,
expected state, not a bug to "fix" by inventing fake data.

**Steps:** same checklist as TASK-16, applied to all 5 screens.

**Commit and push (only if changes were made):**
```
git checkout -b ui/verify-ai-notifications-billing
git add apps/mobile/lib/features/analytics_summary apps/mobile/lib/features/notifications apps/mobile/lib/features/billing
git commit -m "fix(ui): verification pass on analytics, notification inbox, and billing screens"
git push -u origin ui/verify-ai-notifications-billing
```

── END OF TASK-19 PROMPT ──
