# Phase 6 — Student Mobile App MVP Charter

**Phase:** 6  
**Task:** P6-001  
**Status:** Active  
**Branch:** `phase6/P6-001-student-mobile-mvp-charter`  
**Dependency:** P5-086 (Phase 5 Final Review and Handoff — Done)  
**Output:** `docs/phase-6/student-mobile-mvp-charter.md`

---

## 1. Purpose

This charter locks the scope of Phase 6: the Student Mobile App MVP. It is the single authoritative reference for what Phase 6 builds, what it explicitly does not build, and the non-negotiable architectural rules that govern every task.

All Phase 6 agents, contributors, and reviewers must treat this document as the primary contract. Disagreements about scope are resolved against this charter, not against individual task descriptions.

---

## 2. Phase 6 Objective

Build a Flutter-based Student Mobile App MVP that allows students to:

- Authenticate and manage their session.
- Complete a placement test delivered and scored by the backend.
- View their AIM-generated learning plan, weaknesses, and recommendations as provided by the backend.
- Navigate a structured home screen, course list, and session flow.
- Experience all UI in correct RTL/Arabic layout using the AIM Mobile Design System.

Phase 6 does **not** ship a production-complete app. It ships a working MVP that demonstrates the full student journey end-to-end.

---

## 3. Authoritative Architecture Rules

### 3.1 Backend Authority — Non-Negotiable

The backend is the sole authority for all learning intelligence. Flutter must never:

- Calculate placement scores, answer correctness, or subject mastery.
- Calculate weakness labels, difficulty ratings, or topic recommendations.
- Generate review schedules or spaced-repetition decisions.
- Call the AIM Engine or any AI provider (OpenAI, Anthropic, etc.) directly.
- Store or cache AIM outputs as if they were Flutter-owned state.

Flutter's role is to **display** what the backend returns. All computation and intelligence lives server-side.

### 3.2 AIM Mobile Design System — Mandatory

All UI in Phase 6 must use the shared AIM Mobile Design System. This means:

- Colors, typography, and spacing come from shared theme tokens only. No hard-coded hex values, font sizes, or padding literals in feature code.
- Buttons, cards, inputs, loading states, empty states, error states, progress indicators, answer option widgets, feedback containers, and navigation components come from shared widget library.
- If a required component does not exist in the design system, it must be added to the design system layer — not improvised inline.

### 3.3 RTL/Arabic — Non-Negotiable

Every screen must respect RTL and Arabic layout behavior. This includes:

- Text direction: RTL for Arabic content.
- Alignment: leading/trailing (not left/right) everywhere.
- Icon direction: mirrored correctly for RTL.
- Navigation: back-swipe and history direction follow RTL convention.
- Spacing and padding: symmetric or RTL-aware as appropriate.
- Input fields: right-aligned for Arabic text entry.

No screen may be merged without RTL verification.

### 3.4 Flutter Feature-First Architecture

Code is organized by feature, not by layer. Each feature folder owns its models, data sources, repositories, cubits/blocs, and screens. Shared infrastructure (network, theme, routing, storage) lives in `core/`.

---

## 4. In-Scope Features (MVP)

| Area | What Phase 6 Builds |
|---|---|
| Authentication | Login, logout, session persistence, auth gate |
| Placement Test | Question display, answer selection, submit to backend, show backend result |
| Home | Home screen with AIM plan summary from backend |
| Learning Plan | Display backend-returned plan, weaknesses, recommendations |
| Course / Session | Course list, session entry, question answering, backend feedback display |
| Navigation | Bottom nav, routing, deep link stubs |
| Design System | Theme adoption, shared widgets, RTL foundation |
| Quality | Bootstrap review, foundation checks, regression guards |

---

## 5. Out-of-Scope for Phase 6 MVP

The following are explicitly excluded from Phase 6:

- Offline mode or local caching of AIM data.
- Push notifications.
- Student profile editing.
- Payments or subscription management.
- Admin or teacher-facing views.
- Any Flutter-side calculation of learning intelligence (see §3.1).
- Direct integration with OpenAI, Anthropic, or any AI provider from Flutter.
- Production deployment, App Store / Play Store submission.
- Social features (leaderboards, peer comparison).

---

## 6. Phase 6 Entry Criteria

Phase 6 begins only after all of the following are confirmed:

- [x] P5-086 (Phase 5 Final Review and Handoff) is Done.
- [x] Phase 5 backend AIM suite passes (541/541).
- [x] Staging migration (`prisma migrate deploy`) has been run.
- [x] `AIM_ENGINE_SERVICE_TOKEN` is set via env var in staging.
- [x] Production log access controls for AIM persistence are confirmed.

---

## 7. Phase 6 Exit Criteria (MVP Complete)

Phase 6 is complete when:

- All P6 tasks are Done.
- The student journey (auth → placement → home → session → feedback) is functional end-to-end on device.
- All UI uses the AIM Mobile Design System (no rogue styles).
- All screens pass RTL/Arabic verification.
- No Flutter code calls AIM Engine or AI providers directly.
- No Flutter code calculates backend-owned learning values.
- No secrets are committed to the repository.
- Final Phase 6 review doc is produced.

---

## 8. Task Governance

- Tasks are tracked in the Phase 6 Notion database.
- Each task uses its declared branch exactly.
- Each task follows the prompt in `docs/tasks/phase6_prompts.md`.
- Tasks are committed file-by-file with the task ID in the commit message.
- A task moves to Done only after its branch is pushed and output is verified.
- Stop conditions defined in the master instruction take precedence over task-level instructions.

---

## 9. References

- Phase 5 Final Review: `docs/phase-5/final-review.md`
- Phase 6 Prompts: `docs/tasks/phase6_prompts.md`
- Notion Database: https://app.notion.com/p/17276463d164480fa204dc5b524bb012
- Repository: https://github.com/YousefAlgharasi/aim-platform

---

*Charter created: P6-001 | Branch: phase6/P6-001-student-mobile-mvp-charter*
