# Phase 7 — Student Web Assessment E2E Check

## Review Date
2026-06-21

## Scope
End-to-end verification of assessment list, detail, attempt, submission, and result display.

## Test Scenarios

### 1. Assessment List
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.1 | Navigate to `/assessments` | Assessment list loaded from API with type/status badges | PASS |
| 1.2 | No assessments | EmptyState displayed | PASS |
| 1.3 | Click assessment | Navigate to `/assessments/:assessmentId` | PASS |

### 2. Assessment Detail
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1 | View detail | Rules, time limit, attempt count, eligibility from API | PASS |
| 2.2 | Eligible to attempt | Start button enabled | PASS |
| 2.3 | Not eligible | Start button disabled with reason from backend | PASS |
| 2.4 | View past attempts | Attempt history list with scores from API | PASS |
| 2.5 | Click Start | Attempt created via backend API, navigate to attempt screen | PASS |

### 3. Attempt Screen
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1 | Load attempt | Timer starts, questions loaded from API | PASS |
| 3.2 | Navigate questions | Dot navigation shows answered/unanswered status | PASS |
| 3.3 | Answer question | Answer stored in local state (not scored) | PASS |
| 3.4 | Timer countdown | Visual timer from backend deadline — no client-side deadline enforcement | PASS |
| 3.5 | Timer expires | Auto-submit triggered via backend API | PASS |
| 3.6 | Manual submit | Confirmation modal, submit to backend API | PASS |
| 3.7 | Submit success | Redirect to result page | PASS |

### 4. Assessment Result
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1 | View result | Score, grade, pass/fail from backend API | PASS |
| 4.2 | Score breakdown | Per-section scores from backend | PASS |
| 4.3 | No review allowed | Questions not displayed if backend disallows review | PASS |

## Authority Verification
- No local score calculation — all scores from backend API
- No local pass/fail determination — grade from backend
- No client-side deadline enforcement — timer is visual only, auto-submit calls backend
- No local answer correctness checking — answers submitted to backend for evaluation
- Attempt creation goes through backend API — no client-generated attempt IDs

## Verdict
PASS — Assessment flows correctly delegate scoring, grading, deadline enforcement, and eligibility to backend.
