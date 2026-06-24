# AIM Mobile — All UI Screens

> **Total: 59 screens** across 19 feature areas.

---

## 1. Onboarding & Auth

| # | Screen | File | Description |
|---|--------|------|-------------|
| 1 | **Splash Page** | `features/onboarding/ui/pages/splash_page.dart` | App launch screen. Shows AIM logo (school icon), app name "AIM", tagline "Adaptive Intelligence for Mastery", and a loading indicator. Contains invisible `AuthGate` that auto-navigates to sign-in or home based on stored session. |
| 2 | **Login Page** | `features/auth/ui/pages/login_page.dart` | Sign-in form. AIM branding at top, email input with envelope icon, password input with lock icon, error banner (red), "Sign In" primary button, "Don't have an account? Create one" link. Non-production builds show a test-mode divider with Student/Parent/Admin shortcut buttons. |
| 3 | **Register Page** | `features/auth/ui/pages/register_page.dart` | Registration form. Email, password, confirm-password inputs. On submit: either auto-signs in or shows an inline "Confirmation email sent" view prompting user to check their inbox. |

---

## 2. Main Shell (Tab Bar)

| # | Screen | File | Description |
|---|--------|------|-------------|
| 4 | **Main Shell** | `features/shell/ui/pages/main_shell_page.dart` | Bottom tab bar container with 5 tabs: Home, Learn, Review, Progress, Profile. Uses `IndexedStack` to keep tab state alive. `AIMBottomNav` with filled/outlined icon pairs. |

---

## 3. Home Tab

| # | Screen | File | Description |
|---|--------|------|-------------|
| 5 | **Home Page** | `features/home/ui/pages/home_page.dart` | Student dashboard. Pull-to-refresh `ListView` with 4 sections: **Skill States** (mastery cards with score, band, trend), **Focus Areas** (weakness chips in a `Wrap`), **Review Schedule** (due-date reminder cards), **AIM Recommendations** (action cards with kind/reason). Empty state: "Complete your placement test to see personalised recommendations." |

---

## 4. Learn Tab (Curriculum Browser)

| # | Screen | File | Description |
|---|--------|------|-------------|
| 6 | **Course List Page** | `features/lessons/ui/pages/course_list_page.dart` | Scrollable list of published courses. Each course tile shows title, description, and a chevron. Tapping navigates to chapter list. Pull-to-refresh. Empty state: "No courses available." |
| 7 | **Chapter List Page** | `features/lessons/ui/pages/chapter_list_page.dart` | List of chapters within a selected course. AppBar shows course title. Each chapter tile shows title/description with chevron. Tapping navigates to lesson list. Empty state: "No chapters available." |
| 8 | **Lesson List Page** | `features/lessons/ui/pages/lesson_list_page.dart` | List of lessons within a chapter. AppBar shows chapter title. Each tile shows lesson title, description, type badge. Tapping navigates to lesson detail. Empty state: "No lessons available." |
| 9 | **Lesson Detail Page** | `features/lessons/ui/pages/lesson_detail_page.dart` | Lesson content viewer. Shows lesson title, description text, and a list of published asset blocks (text/image/video/audio/exercise/vocabulary). Actual media rendering is stubbed — content blocks shown as metadata. Empty state: "No content yet." |

---

## 5. Review Tab

| # | Screen | File | Description |
|---|--------|------|-------------|
| 10 | **Review Page** | `features/reviews/ui/pages/review_page.dart` | List of spaced-repetition review schedules. Each card shows skill ID, status badge (pending/completed/skipped/overdue), due date with calendar icon, interval days badge, repetition count, and scheduled date. Pull-to-refresh. Empty state: "No reviews scheduled." |

---

## 6. Progress Tab

| # | Screen | File | Description |
|---|--------|------|-------------|
| 11 | **Progress Page** | `features/progress/ui/pages/progress_page.dart` | Student progress overview. Similar to Home but progress-focused. 4 sections: Skill States, Weaknesses, Recommendations, Review Schedule. Each section has a header and navigable cards. Pull-to-refresh. |
| 12 | **Skill State Page** | `features/progress/ui/pages/skill_state_page.dart` | Full list of AIM skill states. Each `AIMCard` shows skill ID, mastery score, confidence %, trend badge (improving/declining/stable), and previous mastery score. Empty state: "No skill data yet." |
| 13 | **Weakness Summary Page** | `features/progress/ui/pages/weakness_summary_page.dart` | Full list of AIM weakness records. Each card shows skill ID, severity badge (high/medium/low), status badge (open/improving/resolved), and trigger attempt IDs. Empty state: "No focus areas yet." |
| 14 | **Recommendations Page** | `features/progress/ui/pages/recommendations_page.dart` | Full list of AIM recommendations. Each card shows kind badge (lesson/targeted_practice/review_session), target skill, rank, reason text, and status badge (active/completed/dismissed). Empty state: "No recommendations yet." |
| 15 | **Review Schedule Page** | `features/progress/ui/pages/review_schedule_page.dart` | Full review schedule list. Each card shows skill ID, status badge, due date, interval days, repetition count, and scheduled timestamp. Empty state: "No reviews scheduled." |

---

## 7. Profile Tab

| # | Screen | File | Description |
|---|--------|------|-------------|
| 16 | **Profile Page** | `features/profile/ui/pages/profile_page.dart` | Student profile overview. Shows user email, user type, status, role badges, profile fields (display name, preferred language, timezone). Notification bell in AppBar. Edit button navigates to edit profile. Logout button at bottom. |
| 17 | **Edit Profile Page** | `features/profile/ui/pages/edit_profile_page.dart` | Form to edit safe fields: display name, preferred language, timezone. `AIMInput` fields with inline validation. "Save" ghost button in AppBar. Submits to backend. |

---

## 8. Placement Test Flow

| # | Screen | File | Description |
|---|--------|------|-------------|
| 18 | **Placement Intro Page** | `features/placement/ui/pages/placement_intro_page.dart` | Stub/placeholder — just shows "Placement Intro — coming soon" centered text. |
| 19 | **Placement Start Page** | `features/placement/ui/pages/placement_start_page.dart` | Test overview before starting. Shows test title, section count, estimated time, and description. "Start Placement Test" primary button and "Not now" dismiss option. Lists sections with skill area and question count. |
| 20 | **Placement Section Page** | `features/placement/ui/pages/placement_section_page.dart` | Section info screen between sections. Shows current section title, skill area, question count, and time estimate. "Begin Section" button to start answering questions. Progress indicator for sections. |
| 21 | **Placement Question Page** | `features/placement/ui/pages/placement_question_page.dart` | Single question display. Shows question text, progress (e.g., "3 of 10"), and answer options (multiple choice or true/false). `AIMButton` to submit answer and move to next. Error banner for submission failures. |
| 22 | **Placement Submit Page** | `features/placement/ui/pages/placement_submit_page.dart` | Submission confirmation. Shows summary (sections completed), "Submit Placement Test" button, loading/spinner while submitting, error state with retry, and success transition to result page. |
| 23 | **Placement Result Page** | `features/placement/ui/pages/placement_result_page.dart` | Result display after placement. Shows assigned CEFR level (e.g., B1) in a prominent card, total score, section-by-section breakdown in `AIMCard` tiles. "Continue" button to proceed to main app. |

---

## 9. Assessments (Quizzes & Exams)

| # | Screen | File | Description |
|---|--------|------|-------------|
| 24 | **Assessment List Page** | `features/assessments/ui/pages/assessment_list_page.dart` | Scrollable list of available assessments. Each tile shows title, type, deadline info. Tapping navigates to detail. Pull-to-refresh. Empty state: "No assessments available." |
| 25 | **Assessment Detail Page** | `features/assessments/ui/pages/assessment_detail_page.dart` | Assessment info before attempting. Shows title, description, question count, time limit, passing score, deadline info, and attempt count. "Start Attempt" primary button. Links to result history. |
| 26 | **Start Attempt Page** | `features/assessments/ui/pages/start_attempt_page.dart` | Confirmation before beginning. Shows assessment title, warning text about time limits. "Start Attempt" and "Go Back" buttons. Calls backend to create the attempt. |
| 27 | **Attempt Page** | `features/assessments/ui/pages/attempt_page.dart` | Active assessment attempt screen. Shows attempt status in an `AIMCard` (started time, question count, status badge). Question rendering area (placeholder for now). "Submit" button. |
| 28 | **Submit Attempt Page** | `features/assessments/ui/pages/submit_attempt_page.dart` | Submission confirmation. Shows summary, loading spinner during submission, "Submit" primary button, "Go Back" outline button. Navigates to result on success. |
| 29 | **Assessment Result Page** | `features/assessments/ui/pages/assessment_result_page.dart` | Graded result display. Shows score percentage (large text), pass/fail badge, breakdown cards per section, optional late-penalty indicator. "Done" button. |
| 30 | **Result History Page** | `features/assessments/ui/pages/result_history_page.dart` | List of past attempt results for an assessment. Each card shows attempt number, score, pass/fail badge, and timestamps. Empty state: "No results yet." |
| 31 | **Deadlines Page** | `features/assessments/ui/pages/deadlines_page.dart` | Grouped deadline view. Sections: Active, Upcoming, Late, Missed, Closed — each with expandable cards showing assessment title, due date, and status. Empty state: "No deadlines." |

---

## 10. Question/Answer

| # | Screen | File | Description |
|---|--------|------|-------------|
| 32 | **Question Page** | `features/question_answer/ui/pages/question_page.dart` | Standalone question screen used within lessons/practice. Shows question text, answer options (`AIMAnswerOption` buttons), submit button. Handles multiple-choice and text-input questions. Displays correctness feedback after submission. |

---

## 11. AI Teacher

| # | Screen | File | Description |
|---|--------|------|-------------|
| 33 | **AI Teacher Chat Page** | `features/ai_teacher/ui/pages/ai_teacher_chat_page.dart` | Chat interface. AppBar "AI Teacher". Message list with user/AI bubbles (markdown rendered), typing indicator, text input with send button at bottom. Empty state: "Ask AI Teacher anything — Start the conversation by sending a message." |
| 34 | **AI Teacher Session History** | `features/ai_teacher/ui/pages/ai_teacher_session_history_page.dart` | List of past chat conversations. Each `AIMCard` shows session title, message count, last message preview, timestamp, and active/ended badge. Tapping opens that session. Empty state: "No conversations yet." |
| 35 | **AI Teacher Settings** | `features/ai_teacher/ui/pages/ai_teacher_settings_page.dart` | Preferences for AI Teacher. Two `AIMCard` sections for device-local display settings. Informational "About these settings" note at bottom. |

---

## 12. Voice Teacher

| # | Screen | File | Description |
|---|--------|------|-------------|
| 36 | **Voice Teacher Page** | `features/voice_teacher/ui/pages/voice_teacher_page.dart` | Voice conversation interface. Shows different states: idle/start, listening (mic active), speaking (AI speaking), error. Large mic button in center. Visual audio feedback. Session-backed voice interaction with the AI teacher. |

---

## 13. Learning Path

| # | Screen | File | Description |
|---|--------|------|-------------|
| 37 | **Learning Path Page** | `features/learning_path/ui/pages/learning_path_page.dart` | Personalized learning roadmap. Three sections: **Skill States** (mastery cards with coverage bar), **Focus Areas** (weakness chips), **AIM Recommendations** (action cards). Pull-to-refresh. Empty state: "Your learning path is empty — Complete your placement test." |

---

## 14. Analytics

| # | Screen | File | Description |
|---|--------|------|-------------|
| 38 | **Analytics Summary Page** | `features/analytics_summary/ui/pages/analytics_summary_page.dart` | Read-only report list. Each `AIMCard` shows report title, category badge, description, and generation date. Tapping would show report detail. Empty state: "No reports available." |

---

## 15. Notifications

| # | Screen | File | Description |
|---|--------|------|-------------|
| 39 | **Notification Inbox Page** | `features/notifications/ui/pages/notification_inbox_page.dart` | In-app notification list. Each card shows title, body preview, channel/category, read/unread indicator, timestamp. Unread items have visual emphasis. Tapping opens detail. Mark-all-read action. Empty state: "No notifications yet." |
| 40 | **Notification Detail Page** | `features/notifications/ui/pages/notification_detail_page.dart` | Full notification view. Shows title, body content, category badge, read/unread badge, timestamps. "Mark as read" and "Dismiss" action buttons. |
| 41 | **Notification Preferences** | `features/notifications/ui/pages/notification_preferences_page.dart` | Channel toggles per category in `AIMCard` sections. Quiet hours configuration with time pickers and "Save quiet hours" button. |
| 42 | **Reminder Settings Page** | `features/notifications/ui/pages/reminder_settings_page.dart` | Active reminders list. Each `AIMCard` shows reminder type, frequency, status badge (active/paused/cancelled). Pause/resume/cancel actions. Empty state: "No reminders yet." |

---

## 16. Billing & Subscription

| # | Screen | File | Description |
|---|--------|------|-------------|
| 43 | **Pricing Page** | `features/billing/ui/pages/pricing_page.dart` | Plans & Pricing overview. Shows available subscription plans with pricing, features, and "Subscribe" actions. |
| 44 | **Subscription Page** | `features/billing/ui/pages/subscription_page.dart` | Current subscription status. Shows active plan name, entitlements list, renewal date, and manage options. |
| 45 | **Checkout Start Page** | `features/billing/ui/pages/checkout_start_page.dart` | Checkout form. Shows selected plan name and price, payment summary card, terms text, and "Proceed to Payment" button with loading state. |
| 46 | **Checkout Status Page** | `features/billing/ui/pages/checkout_status_page.dart` | Payment outcome. Shows success (checkmark + "Payment Successful!" + "Go to Home" button) or failure state with error message. |
| 47 | **Invoice History Page** | `features/billing/ui/pages/invoice_history_page.dart` | List of past invoices. Each tile shows amount, date, and status badge. Tapping shows invoice detail with full breakdown. |

---

## 17. Support & Help

| # | Screen | File | Description |
|---|--------|------|-------------|
| 48 | **Help Center Page** | `features/support/ui/pages/help_center_page.dart` | FAQ categories list: Lessons & Content, Assessments & Grades, Account & Profile, Billing & Subscription, Technical Issues, General Help. Each category expands to show Q&A items. |
| 49 | **Parent Help Center** | `features/support/ui/pages/parent_help_center_page.dart` | Parent-specific FAQ. Categories: Student Progress, Courses & Content, Billing & Payments, Account Management, Privacy & Safety, General Help. |
| 50 | **Create Ticket Page** | `features/support/ui/pages/create_ticket_page.dart` | Support form. Category dropdown, severity dropdown, subject text field, description text area, "Submit Ticket" button with loading state. |
| 51 | **Feedback Page** | `features/support/ui/pages/feedback_page.dart` | Feedback form. Category dropdown, optional 1-5 star rating, title field, body text area, "Submit" button. |
| 52 | **Ticket List Page** | `features/support/ui/pages/ticket_list_page.dart` | User's support tickets. Each tile shows subject, status badge, date. FAB "+" to create new ticket. |
| 53 | **Parent Ticket List** | `features/support/ui/pages/parent_ticket_list_page.dart` | Parent-specific ticket list. Same layout as student ticket list with subject, status, and date. |
| 54 | **Ticket Detail Page** | `features/support/ui/pages/ticket_detail_page.dart` | Single ticket view. Shows subject, status badge, category, description, message thread, and timestamps. |
| 55 | **System Status Page** | `features/support/ui/pages/status_page.dart` | Service health dashboard. Lists system components (API, Auth, etc.) with operational/degraded/down status indicators and optional message. |
| 56 | **Release Notes Page** | `features/support/ui/pages/release_notes_page.dart` | Version history list. Each item shows version, title, date, and summary. Tapping opens full detail. |
| 57 | **Release Note Detail** | `features/support/ui/pages/release_note_detail_page.dart` | Single release note. Shows version badge, title, and full body content. |

---

## 18. Dev Tools

| # | Screen | File | Description |
|---|--------|------|-------------|
| 58 | **Design System Preview** | `features/design_system_preview/ui/pages/ds_preview_page.dart` | Internal dev tool. Tabbed preview of all AIM design system components: buttons, inputs, cards, badges, colors, typography, spacing. Shows each component in all variants/states. |

---

## 19. Achievements

| # | Screen | File | Description |
|---|--------|------|-------------|
| 59 | **Achievements Page** | `features/achievements/ui/pages/achievements_page.dart` | Empty state only. Shows trophy icon with "No achievements yet — Complete lessons and practice to earn badges and milestones." No backend data wired. |
