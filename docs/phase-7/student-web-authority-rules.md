# Phase 7 — Student Web Authority Rules

**Phase:** 7 (Deferred)
**Date:** 2026-06-21

## Purpose

Define the authority boundaries between the Student Web App (browser client) and the backend/AIM Engine. The web app is a presentation layer only — all authoritative decisions remain server-side.

## Core Principle

**The Student Web App displays data. It does not decide data.**

Every value the student sees — mastery percentage, skill level, recommendation, score, placement result, billing status — comes from the backend API as a final, authoritative value. The web app renders it unchanged.

## Authority Matrix

### Backend/AIM Engine Authority (Server-Side Only)

| Domain | Authoritative Operations | Web App Role |
|--------|-------------------------|-------------|
| Mastery | Calculate mastery level, update mastery | Display backend value |
| Weakness | Identify weaknesses, compute weakness scores | Display backend value |
| Difficulty | Set question difficulty, adjust difficulty | Display backend value |
| Recommendations | Generate next lesson/topic recommendations | Display backend list |
| Review Schedules | Compute spaced repetition intervals | Display backend schedule |
| Progress | Calculate completion %, update progress | Display backend value |
| Placement Score | Score placement responses, determine level | Display backend result |
| Assessment Score | Score answers, compute assessment result | Display backend result |
| Pass/Fail | Determine pass or fail outcome | Display backend verdict |
| Billing State | Process payments, activate/deactivate plans | Display backend status |
| Entitlements | Grant or revoke feature access | Check backend entitlement |
| Notification Delivery | Send push/email/SMS notifications | Display delivered notifications |
| Analytics Outputs | Compute analytics, generate reports | Display backend reports |
| AIM Outputs | All AIM Engine decisions | Display AIM results |

### Student Web App Authority (Client-Side Allowed)

| Domain | Allowed Operations |
|--------|-------------------|
| UI State | Toggle sidebar, switch tabs, open modals, scroll position |
| Form Input | Collect user input before submission to backend |
| Local Preferences | Theme preference, sidebar collapsed state (cosmetic only) |
| Navigation | Route between pages, back/forward navigation |
| Token Storage | Store/retrieve auth token in browser |
| Locale Selection | Switch between English/Arabic display language |
| Input Validation | Client-side format validation (email format, required fields) before API call |
| Pagination | Track current page number for paginated API requests |
| Search/Filter | Collect search terms and filter values to send as API query parameters |

## Prohibited Operations

The Student Web App must NEVER:

1. **Calculate mastery** — no `mastery = correct / total` or similar formulas
2. **Compute scores** — no `score = sum(points)` for assessments or placement
3. **Determine pass/fail** — no `if (score >= threshold) pass`
4. **Generate recommendations** — no `nextLesson = findWeakest(skills)`
5. **Schedule reviews** — no spaced repetition interval computation
6. **Modify billing** — no plan activation, cancellation, or payment processing
7. **Deliver notifications** — no push notification sending
8. **Access database** — no Supabase service-role calls, no direct SQL
9. **Call AIM Engine** — no direct AIM API calls bypassing the backend
10. **Store secrets** — no service-role keys, provider API keys, or DB credentials in client code

## Validation Pattern

For every data display in the web app:

```
✅ CORRECT:
const { mastery } = await api.get('/students/me/progress');
display(mastery);  // Show backend value as-is

❌ WRONG:
const responses = await api.get('/students/me/responses');
const mastery = responses.filter(r => r.correct).length / responses.length;
display(mastery);  // Locally computed — VIOLATION
```

## Input Submission Pattern

```
✅ CORRECT:
// Collect answer, send to backend, display backend result
const result = await api.post('/assessments/123/answer', { answerId: selected });
display(result.score);  // Backend-computed score

❌ WRONG:
// Check answer locally
const isCorrect = selected === question.correctAnswer;
const score = isCorrect ? score + 1 : score;
display(score);  // Locally computed — VIOLATION
```

## Enforcement

- Code review must verify no local authority computation
- Authority tests (P7-024) validate no prohibited patterns exist
- CI checks should scan for prohibited patterns in student-web code
- Any violation blocks the task from being marked Done
