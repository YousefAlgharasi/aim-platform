# Screens — AIM Mobile · Gen Z (59 total)

The app routes between these screens via the logic class in `design/AIM Mobile - Gen Z.dc.html`. Use the in-app **screen picker** (top-right dropdown) to jump to any of them. Numbers match the picker order.

## Design language (applied across all screens)
- **Hero headers** — gradient (`--gz-hero`) with floating blob shapes, glassy white text, rounded bottom.
- **Glass app bars** — translucent, blurred, sit over scrolling content.
- **Cards** — `--radius-2xl` / `--radius-xl` rounded surfaces, soft `--shadow-card` elevation, 1px `--border`.
- **Buttons** — pill-shaped, gradient fill for primary actions, with a soft glow.
- **Navigation** — a floating round menu button opens a slide-in **side drawer** (replaces the old bottom bar). Active item highlighted with the hero gradient.
- **Icons** — outline SVG only (2px stroke), no emoji.
- **Theming** — every surface/text/border is token-driven, so **light + dark** and **EN + Arabic (RTL)** are fully supported everywhere.

---

## Auth & shell
1. **Splash** — animated AIM logo, graduation-cap mark, shimmer progress, "tap to continue".
2. **Login** — gradient welcome header, glass card with email/password, pill sign-in, error banner.
3. **Register** — account creation, learner/parent type, OTP entry.

## Home & learning
4. **Home** — XP/level hero with animated counter + progress ring, daily challenges (claimable), skill "blob" cards, weekly squad leaderboard, achievements.
5. **Courses** (`courseList`) — Level B1 pill, filter chips (All / In progress / Completed), course cards with colored glyph tiles.
6. **Chapters** (`chapterList`) — chapter list with progress + lock states.
7. **Lessons** (`lessonList`) — lesson cards within a chapter.
8. **Lesson detail** — gradient lesson hero (duration / blocks / XP), "What's inside" timeline of blocks, sticky "Start practice".
9. **Question page** — practice question UI.

## Review & progress
10. **Review** — spaced-repetition queue, due dates, interval/rep chips.
11. **Progress** — stats, charts, weekly activity.
12. **Skill states** — mastery "blob" shapes per skill, strong/developing/focus.
13. **Weakness** — focus areas needing work.
14. **Recommendations** — suggested next steps.
15. **Review schedule** — upcoming spaced-repetition calendar.

## Profile
16. **Profile** — gradient hero with avatar + level badge, stat tiles (streak / XP / rank), weekly activity bar chart, achievements strip, settings rows, sign-out.
17. **Edit profile** — editable display name, language, timezone.

## Placement test (6)
18. **Placement intro** · 19. **Placement start** · 20. **Placement section** · 21. **Placement question** · 22. **Placement submit** · 23. **Placement result**

## Assessments (8)
24. **Assessment list** · 25. **Assessment detail** · 26. **Start attempt** · 27. **Attempt** · 28. **Submit attempt** · 29. **Assessment result** · 30. **Result history** · 31. **Deadlines**

## AI, voice, path & analytics
32. **AI Teacher chat** — gradient hero header with a bobbing AI avatar + live status, AI/user chat bubbles, typing indicator, quick-action chips, pill input with gradient send.
33. **AI history** — past AI conversations.
34. **AI settings** — tutor preferences.
35. **Voice** — speaking practice with record button.
36. **Learning path** — roadmap of upcoming units.
37. **Analytics** — deeper performance breakdown.

## Notifications (4) & billing (5)
38. **Notifications inbox** · 39. **Notification detail** · 40. **Notification prefs** · 41. **Reminder settings**
42. **Pricing** · 43. **Subscription** · 44. **Checkout start** · 45. **Checkout status** · 46. **Invoice history**

## Support (10) & misc
47. **Help center** · 48. **Parent help** · 49. **Create ticket** · 50. **Feedback** · 51. **Ticket list** · 52. **Parent ticket list** · 53. **Ticket detail** · 54. **System status** · 55. **Release notes** · 56. **Release note detail**
57. **Design system preview** — swatches of buttons / tokens / components.
58. **Achievements** — full badge gallery.

---

### Global overlays (available on the 5 root tabs)
- **Side drawer** — slides in from the start edge; brand header, search, Menu + More sections (with badges), Light/Dark toggle, Sign out.
- **Notifications sheet** — bottom sheet with the fire-gradient bell header, "Mark read", and notification cards with colored icon blobs + unread dots.
