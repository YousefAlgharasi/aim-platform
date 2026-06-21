# Phase 7 — Student Web Learning E2E Check

## Review Date
2026-06-21

## Scope
End-to-end verification of course catalog, course detail, lesson player, practice sessions, and progress sync.

## Test Scenarios

### 1. Course Catalog
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.1 | Navigate to `/curriculum` | Course list loaded from API with progress indicators | PASS |
| 1.2 | Empty catalog | EmptyState component displayed | PASS |
| 1.3 | Click course card | Navigate to `/curriculum/:subjectId` | PASS |

### 2. Course Detail
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1 | View course detail | Chapter list with lessons, progress bar from API | PASS |
| 2.2 | Locked lesson | Lock icon shown, click disabled | PASS |
| 2.3 | Completed lesson | Checkmark badge shown | PASS |
| 2.4 | Click available lesson | Navigate to `/lessons/:lessonId` | PASS |

### 3. Lesson Player
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1 | Load lesson | Top bar with title, content blocks rendered (text, image, video, code, callout) | PASS |
| 3.2 | Scroll through content | Progress track updates via debounced `useLessonProgress` API call | PASS |
| 3.3 | Click Next | Navigate to next lesson via backend state | PASS |
| 3.4 | Click Previous | Navigate to previous lesson | PASS |
| 3.5 | Click Complete | Completion submitted to backend API, redirect to course detail | PASS |
| 3.6 | Video content block | Video element rendered with backend CDN source | PASS |
| 3.7 | Code content block | Preformatted code block with language label | PASS |

### 4. Practice Session
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1 | Start practice at `/practice/:sessionId` | First question loaded from API | PASS |
| 4.2 | Answer multiple choice | Selection stored in draft (sessionStorage), no scoring | PASS |
| 4.3 | Answer true/false | Radio selection stored in draft | PASS |
| 4.4 | Answer fill-in-blank | Text input stored in draft | PASS |
| 4.5 | Submit answer | Answer sent to backend via `usePracticeSubmit`, feedback received | PASS |
| 4.6 | View feedback | Correct/incorrect status from backend, explanation shown | PASS |
| 4.7 | Complete all questions | Results summary from backend displayed | PASS |
| 4.8 | Navigate away and back | Draft answer restored from sessionStorage | PASS |

### 5. Progress Sync
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1 | Complete lesson | Progress updated on backend, reflected in course detail | PASS |
| 5.2 | Complete practice | Practice stats updated on backend | PASS |
| 5.3 | View progress summary | All progress values from backend API | PASS |

## Authority Verification
- No local lesson completion logic — backend determines completion
- No local practice scoring — correct/incorrect from backend response only
- No local mastery calculation — progress percentages from API
- `useAnswerDraft` stores unsent answers only — no evaluation
- `useLessonProgress` syncs scroll position to backend — no local progress computation

## Verdict
PASS — Learning flows (catalog, lessons, practice, progress) correctly delegate all authority to backend.
