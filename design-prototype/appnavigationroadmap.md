# AIM Platform — Mobile App Navigation Roadmap

Traced from actual `context.push`/`context.go` call sites in the code (not
guessed) — every arrow below is a real navigation edge. Indentation = "reached
from the screen above it." A `[LEAF]` marker means nothing pushes forward from
that screen (back button only). A `[DEAD END — unreachable]` marker means the
screen is registered as a route but **nothing in the app ever navigates to it**.

---

## 0. App Launch

```
SplashPage  (/)
 └─ AuthGate checks session (local, no user action)
     ├─ Not signed in ──────────────► LoginPage (/auth/sign-in)
     └─ Signed in ───────────────────► MainShellPage (/main)
```

### 0a. Sign-in branch

```
LoginPage (/auth/sign-in)
 ├─ "Register" ─────────────────────► RegisterPage (/auth/register)
 │                                      └─ "Back to sign in" ──► LoginPage
 ├─ successful login ────────────────► MainShellPage
 └─ (dev-only) "Endpoint Tester" ────► EndpointTesterPage [LEAF]

RegisterPage (/auth/register)
 └─ successful register + auto-confirm ► MainShellPage
```

### 0b. First entry into the shell

```
MainShellPage (/main)
 └─ if this device has never dismissed it:
     OnboardingWalkthroughOverlay (4-slide overlay, Skip/Next/Get Started)
     — shown once ever, then never again on this device
```

---

## 1. MainShellPage — the hub

`MainShellPage` is a 5-tab `IndexedStack` (no bottom bar — navigation is
**FAB → drawer only**, per this session's earlier UX pass). Tapping a tab in
the drawer's MENU section swaps the tab index in place (does not push a new
route); everything else pushes a real route.

```
MainShellPage
 │
 ├─ Tab 0: HomePage ───────────────────────────────────┐
 ├─ Tab 1: CourseListPage ("Learn") ────────────────────┤  (see §2–7 below
 ├─ Tab 2: ReviewPage ───────────────────────────────────┤   for what each
 ├─ Tab 3: ProgressPage ─────────────────────────────────┤   tab branches into)
 ├─ Tab 4: ProfilePage ──────────────────────────────────┘
 │
 └─ Drawer (opened via FAB, bottom-start)
     ├─ MENU section — same 5 destinations as the tabs above (switches tab index)
     ├─ MORE section
     │   ├─ Notifications ─────────────► NotificationInboxPage  (see §8)
     │   ├─ Achievements ──────────────► AchievementsPage [LEAF — only "Back to Home" → go(mainShell)]
     │   ├─ AIM Plus ──────────────────► PricingPage  (see §9)
     │   ├─ Placement Test ────────────► PlacementMenuPage  (see §5)
     │   └─ Support ───────────────────► HelpCenterPage  (see §10)
     └─ Footer
         ├─ Light/Dark theme toggle (local, no navigation)
         ├─ English/Arabic language toggle (local, no navigation)
         └─ Logout ────────────────────► back to LoginPage (session cleared)
```

---

## 2. Home tab

```
HomePage (Tab 0)
 ├─ Notification bell ─────► opens a bottom-sheet preview
 │                            └─ tap an item ──► NotificationDetailPage  (see §8)
 ├─ "Continue learning" card ──► LessonDetailPage  (see §3)
 ├─ Recommended course card ───► ChapterListPage  (see §3)
 ├─ Quick-start lesson card ───► LessonDetailPage  (see §3)
 ├─ "Take Placement Test" (shown pre-placement) ──► PlacementStartPage  (see §5)
 └─ "View assessments" ────────► AssessmentListPage  (see §6)
```

---

## 3. Learn tab — course → lesson → practice

```
CourseListPage (Tab 1, "Learn")
 └─ tap a course (enrolls first if not yet enrolled; blocked with a message if locked)
     └─ ChapterListPage (/lessons/chapters)
         └─ tap a chapter
             └─ LessonListPage (/lessons/lessons)
                 └─ tap a lesson
                     └─ LessonDetailPage (/lessons/detail)
                         ├─ "Practice" ─────────► PracticeSessionPage (/practice/session)
                         │                          [LEAF — completes/exits back to LessonDetailPage;
                         │                           this is where lesson_progress + lesson_complete +
                         │                           the real AIM pipeline call happen]
                         ├─ "Ask AI Teacher" ───► AiTeacherChatPage (/ai-teacher/chat)  (see §11)
                         └─ "Voice practice" ───► VoiceTeacherPage (/voice-teacher)  (see §12)
```

`QuestionPage` (`question_answer` feature) has a full working endpoint chain
but **is not registered in the router at all** — effectively replaced by
PracticeSessionPage. Not reachable by any user.

---

## 4. Progress tab & Review tab

```
ProgressPage (Tab 3)
 ├─ Skill states card ─────────► SkillStatePage (/progress/skill-state) [LEAF]
 ├─ Weaknesses card ────────────► WeaknessSummaryPage (/progress/weakness) [LEAF]
 ├─ Recommendations card ───────► RecommendationsPage (/progress/recommendations) [LEAF]
 └─ Review schedule card ───────► ReviewSchedulePage (/progress/review-schedule) [LEAF]

ReviewPage (Tab 2, "Review") [LEAF]
 — same underlying AIM data as the four Progress subscreens, no forward navigation
```

---

## 5. Placement Test (drawer → "Placement Test")

```
PlacementMenuPage (/placement/menu)
 — checks GET /placement/attempts/latest, branches on status:
 │
 ├─ status "none"  ──"Take the Placement Test"──► PlacementStartPage
 ├─ status "active" ──"Continue"───────────────► PlacementStartPage (starts fresh; backend
 │                                                  auto-abandons the old active attempt —
 │                                                  there's no real mid-section resume)
 ├─ status "submitted" ──"Check Again"──────────► (re-runs the same check, stays on this page)
 └─ status "completed" ─┬─"View Full Result"────► PlacementResultPage
                         └─"Retake Test?"─(confirm dialog)─► PlacementStartPage

PlacementStartPage (/placement/start)
 └─ "Start" ──► PlacementSectionPage (/placement/section)
                 └─ loops through sections, each section:
                     PlacementQuestionPage (/placement/question)  [has a "Listen" button
                       for listening_choice items, plays TTS audio via
                       GET /placement/questions/:id/audio]
                     └─ after the last question in the last section ─►
 PlacementSubmitPage (/placement/submit)
 └─ "Submit" ──► PlacementResultPage (/placement/result)
                  ├─ "Start with <recommended course>" ──► ChapterListPage  (rejoins §3)
                  └─ "Continue to AIM" ───────────────────► go(mainShell)

PlacementIntroPage (/placement/intro)
 — a separate static "what is this test" screen that also pushes
   PlacementStartPage directly, but nothing in the app currently pushes
   *to* PlacementIntroPage itself — it's registered but has no real entry
   point from the rest of the flow above (see Orphaned Screens below).
```

---

## 6. Assessments (Home → "View assessments", or Deadlines from the list)

```
AssessmentListPage (/student/assessments)
 └─ "Upcoming deadlines" ─────► DeadlinesPage (/student/assessments/deadlines)
                                  └─ tap a deadline ──► AssessmentDetailPage

AssessmentDetailPage (/student/assessments/detail)
 ├─ "Start attempt" ──────────► StartAttemptPage (/student/assessments/start)
 │                                └─► AttemptPage (/student/assessments/attempt)
 │                                     └─"Submit"──► SubmitAttemptPage (/student/assessments/submit)
 │                                                     └─► AssessmentResultPage
 │                                                          └─ "Done" ──► go(mainShell)
 └─ "History" ─────────────────► ResultHistoryPage (/student/assessments/history)
                                   └─ tap a past attempt ──► AssessmentResultPage
```

*Note: `AssessmentListPage` itself isn't linked from `MainShellPage`'s drawer —
its only confirmed in-app entry point is `HomePage`'s "View assessments" card
(`AppRoutePaths.assessments`).*

---

## 7. Profile tab

```
ProfilePage (Tab 4)
 ├─ "Edit profile" ─────────► EditProfilePage (/profile/edit) [LEAF — save returns to ProfilePage]
 ├─ "Achievements" ─────────► AchievementsPage [LEAF]
 ├─ "Analytics" ────────────► AnalyticsSummaryPage (/analytics/summary) [LEAF]
 ├─ "Subscription" ─────────► SubscriptionPage (/billing/subscription)  (see §9)
 ├─ "Invoices" ─────────────► InvoiceHistoryPage (/billing/invoices) [LEAF]
 └─ (dev-only) "Endpoint Tester" ──► EndpointTesterPage [LEAF]
```

---

## 8. Notifications (drawer → "Notifications", or Home bell)

```
NotificationInboxPage (/notifications/inbox)
 ├─ tap a notification ────► NotificationDetailPage (/notifications/detail)
 │                             [LEAF — mark-as-read/dismiss actions, then back]
 └─ settings gear ──────────► NotificationPreferencesPage (/notifications/preferences) [LEAF]

ReminderSettingsPage (/notifications/reminders)
 — registered, fully wired to real endpoints (pause/resume/cancel reminders),
   but no screen currently pushes to it — see Orphaned Screens below.
```

---

## 9. Billing (drawer "AIM Plus", or Profile → Subscription)

```
PricingPage (/billing/pricing)
 └─ pick a plan ──► CheckoutStartPage (/billing/checkout)
                      └─ on payment provider return ──► CheckoutStatusPage (/billing/checkout-status)
                           — polls status, then "Done" ──► go(mainShell)

SubscriptionPage (/billing/subscription)
 ├─ "Change plan" ──────────► PricingPage (loops back into the flow above)
 ├─ "Invoices" ─────────────► InvoiceHistoryPage [LEAF]
 └─ "Cancel subscription" ──► (in-place action, stays on this page)
```

---

## 10. Support (drawer → "Support")

```
HelpCenterPage (/support/help)
 └─ "Contact support" / "Create ticket" ──► CreateTicketPage (/support/tickets/new) [LEAF]
```

**Everything else under Support is currently unreachable from the UI** — see
the Orphaned Screens section below. `TicketListPage` has a data model for
tappable ticket rows, but no `onTap` handler is ever supplied when the rows
are actually built, so even *if* a user found their way to that screen,
tapping a ticket does nothing.

---

## 11. AI Teacher (from a lesson, or its own history)

```
AiTeacherChatPage (/ai-teacher/chat)
 └─ "History" ──────────► AiTeacherSessionHistoryPage (/ai-teacher/history)
                             └─ tap a past session ──► AiTeacherChatPage (reopens that session)

AiTeacherSettingsPage (/ai-teacher/settings)
 — registered, but nothing currently pushes to it from within the app
   (local-only preferences screen; see Orphaned Screens below).
```

---

## 12. Voice Teacher (from a lesson)

```
VoiceTeacherPage (/voice-teacher) [LEAF]
 — a single self-contained session screen (record → send → hear TTS reply),
   no further forward navigation.
```

---

## 13. Dev / internal-only screens

```
EndpointTesterPage (/dev-tools/endpoint-tester)  [LEAF]
 — reachable from LoginPage and ProfilePage (both dev-only affordances)

DSPreviewPage (/dev-tools/design-system-preview)  [LEAF]
 — reachable only from within its own preview harness; not part of the real
   student-facing app flow at all.
```

---

## Orphaned screens — registered routes, zero real entry points

These all exist as working screens (some with real endpoints, some
local-only) but **nothing in the current app ever navigates a user to them**.
A user can only land on these via a deep link or by typing the route
manually — never through normal taps:

| Screen | Route | Why it's stranded |
|---|---|---|
| `PlacementIntroPage` | `/placement/intro` | Pushes forward to PlacementStartPage, but nothing pushes *to* it |
| `LearningPathPage` | *(not in router)* | Fully wired to real endpoints, just never imported by the router |
| `QuestionPage` | *(not in router)* | Superseded by PracticeSessionPage |
| `ReminderSettingsPage` | `/notifications/reminders` | No button anywhere opens it (NotificationPreferencesPage doesn't link to it) |
| `AiTeacherSettingsPage` | `/ai-teacher/settings` | No entry point from AiTeacherChatPage or elsewhere |
| `TicketListPage` | `/support/tickets` | Not linked from HelpCenterPage or anywhere else |
| `TicketDetailPage` | `/support/tickets/detail` | Even if TicketListPage were reachable, its rows have no tap handler wired |
| `ParentTicketListPage` | `/support/tickets-parent` | No parent-role entry point wired |
| `ParentHelpCenterPage` | `/support/help-parent` | No parent-role entry point wired |
| `FeedbackPage` | `/support/feedback` | Nothing links to it |
| `StatusPage` | `/support/status` | Nothing links to it (it itself links onward to ReleaseNotesPage) |
| `ReleaseNotesPage` | `/support/release-notes` | Only reachable *from* StatusPage, which is itself unreachable |
| `ReleaseNoteDetailPage` | `/support/release-notes/detail` | Same — downstream of the unreachable StatusPage |

**Practical read:** the entire Support section is a dead branch except
`HelpCenterPage → CreateTicketPage`. If Support is meant to be a real feature,
it needs a drawer/profile entry point wired to `TicketListPage` (or the
Help Center needs "My Tickets"/"Feedback"/"Status" links added), plus the
missing `onTap` on ticket rows.
