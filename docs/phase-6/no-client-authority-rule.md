# Phase 6 — No Client Authority Rule

**Phase:** 6  
**Task:** P6-004  
**Branch:** `phase6/P6-004-no-client-authority-rule`  
**Dependency:** P6-001 (Student Mobile MVP Charter — Done)  
**Output:** `docs/phase-6/no-client-authority-rule.md`

---

## 1. Purpose

This document establishes the **No Client Authority Rule** for Phase 6. It defines precisely what Flutter may and may not own, and why. All Phase 6 contributors must treat this as a binding architectural constraint.

---

## 2. The Rule

> **Flutter is a display client. The backend is the sole authority for all learning intelligence, scoring, permissions, and AIM outputs.**

Flutter receives data from the backend via API responses and renders it. Flutter does not compute, infer, override, or cache any value that the backend owns.

---

## 3. What the Backend Owns (Flutter Must Never Compute)

| Domain | Backend-Owned Values | Flutter Role |
|---|---|---|
| Placement | Score, pass/fail, level assignment | Display backend response |
| Answer Evaluation | Correctness (right/wrong) | Display backend response |
| Mastery | Mastery level per topic/subject | Display backend response |
| Weakness | Weak topics, weak question types | Display backend response |
| Difficulty | Question difficulty rating | Display backend response |
| Recommendations | Next topics, suggested sessions | Display backend response |
| Review Schedule | Spaced repetition dates and intervals | Display backend response |
| AIM Outputs | All AIM Engine outputs | Display backend response |
| Permissions | Access control, role gates | Display backend response |
| Progress | Completion %, streak counts | Display backend response |

---

## 4. Prohibited Flutter Patterns

The following patterns are **banned** in all Phase 6 Flutter code:

### 4.1 Local Scoring

```dart
// ❌ BANNED — Flutter must not score answers
bool isCorrect = selectedOption == question.correctAnswer;
int score = correctCount / totalQuestions * 100;
```

### 4.2 Local Mastery Calculation

```dart
// ❌ BANNED — Flutter must not calculate mastery
String masteryLevel = correctRate > 0.8 ? 'mastered' : 'learning';
```

### 4.3 Local Weakness Detection

```dart
// ❌ BANNED — Flutter must not detect weaknesses
List<String> weakTopics = topics.where((t) => t.score < 60).toList();
```

### 4.4 Local Recommendation Logic

```dart
// ❌ BANNED — Flutter must not recommend next steps
String nextTopic = topics.firstWhere((t) => !t.completed).name;
```

### 4.5 Local Review Scheduling

```dart
// ❌ BANNED — Flutter must not schedule reviews
DateTime nextReview = lastReview.add(Duration(days: interval * factor));
```

### 4.6 Direct AIM Engine or AI Provider Calls

```dart
// ❌ BANNED — Flutter must not call AIM Engine or AI providers
final response = await http.post('https://aim-engine.internal/analyze', ...);
final aiResult = await openai.complete(prompt: '...');
```

---

## 5. Permitted Flutter Patterns

Flutter may perform the following client-side operations without violating this rule:

| Permitted | Reason |
|---|---|
| Render backend-returned scores | Display only, not computed |
| Format dates/times for display | Presentation logic, not learning logic |
| Sort/filter a list the backend already returned | UI ordering, not authority |
| Show/hide UI elements based on backend boolean flags | Display conditional, not permission logic |
| Cache API responses for performance (read-only) | Transport optimisation, not override |
| Validate form inputs before submission | UX, not scoring |
| Animate progress bars using backend-provided values | Display only |

---

## 6. How to Handle Edge Cases

### "The backend is slow — can Flutter show a temporary score?"

No. Show a loading state. Do not fabricate or estimate values.

### "The backend returned an error — can Flutter fall back to a local calculation?"

No. Show an error state. Escalate to the backend team if needed.

### "The design requires showing correctness immediately after answer selection."

Submit the answer to the backend and await the response before showing correctness. Use an optimistic loading indicator while waiting. Do not pre-compute correctness.

### "Can Flutter cache AIM outputs between sessions?"

Only read-only caching of what the backend returned, with a clear staleness policy. Flutter must never mutate or re-derive cached AIM values.

---

## 7. Enforcement

- Code review must reject any PR that introduces prohibited patterns listed in §4.
- The Done Test for every Flutter task includes: *"Flutter does not calculate backend-owned learning values."*
- Any task that would require Flutter to compute backend-owned values is a stop condition — escalate before coding.

---

## 8. References

- Phase 6 Charter: `docs/phase-6/student-mobile-mvp-charter.md`
- Task Execution Rules: `docs/phase-6/task-execution-rules.md`
- Phase 6 Prompts: `docs/tasks/phase6_prompts.md`

---

*No Client Authority Rule created: P6-004 | Branch: phase6/P6-004-no-client-authority-rule*
