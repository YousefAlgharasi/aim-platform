# Phase 12 — Parent Dashboard Flow Map

**Date:** 2026-06-20
**Task:** P12-007
**Author:** GHOST3030
**Dependency:** P12-006 (API Contract Map)

---

## 1. Purpose

Document the user flows for parent onboarding, child linking, dashboard navigation, progress viewing, assessment viewing, and report access. Each flow respects privacy rules and backend authority.

---

## 2. Flow 1 — Parent Onboarding

```
[Parent registers / logs in]
    │
    ▼
[Auth Guard: JWT valid, role = parent?]
    │ No → Redirect to /login
    │ Yes ▼
[Check onboarding_completed]
    │ No → Redirect to /parent/onboarding
    │ Yes → Redirect to /parent (dashboard)
    ▼
[Onboarding Page]
    │
    ├── Step 1: Confirm profile (display_name, phone)
    ├── Step 2: Set notification preferences (stored only, no sending)
    └── Step 3: Send first child invitation (optional)
    │
    ▼
[POST /api/v1/parent/onboarding/complete]
    │
    ▼
[Redirect to /parent (dashboard)]
```

**Rules:**
- Onboarding sets `onboarding_completed = true`.
- Notification preferences are stored but not acted on (Phase 13).
- Invitation in step 3 is optional — parent can skip and invite later.

---

## 3. Flow 2 — Child Linking (Invitation)

```
[Parent navigates to /parent/invitations]
    │
    ▼
[View existing invitations: pending, accepted, rejected, expired]
    │
    ▼
[Parent clicks "Invite Child"]
    │
    ▼
[Enter child email + select relationship type]
    │
    ▼
[POST /api/v1/parent/invitations]
    │ Validation error → Show error message
    │ Duplicate pending → Show "invitation already pending"
    │ Success ▼
[Invitation created with status = pending]
    │
    ▼
[Child/Student or Admin accepts/rejects invitation]
    │ Accepted → parent_child_link created (status = active)
    │ Rejected → invitation status = rejected
    │ Expired → invitation status = expired
    │
    ▼
[Parent sees updated invitation status on refresh]
```

**Rules:**
- Parent cannot accept their own invitation.
- Invitation codes are backend-generated and unguessable.
- Duplicate pending invitations to the same child are blocked.
- Expired invitations cannot be reused.

---

## 4. Flow 3 — Dashboard Home (Child Selector)

```
[Parent navigates to /parent]
    │
    ▼
[GET /api/v1/parent/children]
    │ No linked children → Show empty state with "Invite a child" CTA
    │ Has children ▼
[Show child selector: cards/list of linked children]
    │
    ▼
[Parent selects a child]
    │
    ▼
[Navigate to /parent/children/:childId]
    │
    ▼
[Check consent for this child]
    │ No consent → Show "consent required" state
    │ Has consent ▼
[Show child overview with consented data categories]
```

**Rules:**
- Only children with active links appear in the selector.
- Pending/revoked links are not shown.
- Each child card shows a consent summary (which data categories are accessible).

---

## 5. Flow 4 — Child Progress View

```
[Parent on /parent/children/:childId]
    │
    ▼
[GET /api/v1/parent/children/:childId/overview]
    │ 403 → Show "access denied" or "consent required"
    │ Success ▼
[Display progress overview card]
    │
    ├── Overall progress %
    ├── Courses enrolled count
    ├── Lessons completed count
    ├── Current level
    ├── Last activity date
    ├── Active weaknesses count
    └── Upcoming deadlines count
    │
    ▼
[Parent clicks "View Details"]
    │
    ▼
[Navigate to /parent/children/:childId/progress]
    │
    ▼
[GET /api/v1/parent/children/:childId/progress (paginated)]
    │
    ▼
[Display per-course progress table]
```

**Rules:**
- All values are backend-calculated and read-only.
- Parent UI does not compute progress percentages.
- Loading states use Skeleton components.

---

## 6. Flow 5 — Skill States View

```
[Parent navigates to /parent/children/:childId/skills]
    │
    ▼
[GET /api/v1/parent/children/:childId/skills (paginated, filterable)]
    │ 403 → Show "consent required" for progress_view
    │ Success ▼
[Display skill state table/cards]
    │
    ├── Skill name
    ├── Mastery level badge (mastered/learning/weak/new)
    ├── Confidence score
    ├── Last reviewed date
    └── Next review date
```

**Rules:**
- Mastery levels come from backend — never calculated in UI.
- Filter by state is a query param, not client-side filtering.

---

## 7. Flow 6 — Weaknesses and Recommendations View

```
[Parent navigates to /parent/children/:childId/weaknesses]
    │
    ▼
[GET /api/v1/parent/children/:childId/weaknesses]
    │ 403 → "consent required"
    │ Empty → Show "no weaknesses detected" empty state
    │ Success ▼
[Display weakness cards]
    │
    ├── Skill name
    ├── Severity badge (high/medium/low)
    ├── Recommendation text
    └── Recommended action
```

**Rules:**
- Weakness detection and severity are backend AIM outputs.
- Recommendations are backend-generated text — parent UI only displays them.

---

## 8. Flow 7 — Assessment Results View

```
[Parent navigates to /parent/children/:childId/assessments]
    │
    ▼
[GET /api/v1/parent/children/:childId/assessments (paginated)]
    │ 403 → "consent required" for assessment_view
    │ Success ▼
[Display assessment results table]
    │
    ├── Assessment name
    ├── Type (quiz/exam)
    ├── Score / Max score
    ├── Pass/Fail badge
    ├── Attempt date
    └── Attempt number
```

**Rules:**
- Scores, pass/fail, and max scores are backend values.
- Parent UI does not calculate percentages, correctness, or pass/fail.

---

## 9. Flow 8 — Deadline View

```
[Parent navigates to /parent/children/:childId/deadlines]
    │
    ▼
[GET /api/v1/parent/children/:childId/deadlines]
    │ 403 → "consent required" for assessment_view
    │ Success ▼
[Display deadline list]
    │
    ├── Assessment name
    ├── Deadline date
    ├── Status badge (upcoming/due_soon/overdue/completed)
    └── Overdue indicator
```

**Rules:**
- `is_overdue` and `status` are backend-determined.
- Parent UI does not compare dates to determine overdue state.

---

## 10. Flow 9 — Activity Log View

```
[Parent navigates to /parent/children/:childId/activity]
    │
    ▼
[GET /api/v1/parent/children/:childId/activity (paginated, date range)]
    │ 403 → "consent required" for activity_view
    │ Success ▼
[Display activity timeline/table]
    │
    ├── Activity date
    ├── Activity type (lesson/quiz/review/practice)
    ├── Duration
    ├── Lesson name
    └── Course name
```

---

## 11. Flow 10 — Reports View

```
[Parent navigates to /parent/children/:childId/reports]
    │
    ▼
[GET /api/v1/parent/children/:childId/reports]
    │ 403 → "consent required" for report_view
    │ Success ▼
[Display report cards]
    │
    ├── Report type (weekly/monthly)
    ├── Report period
    ├── Summary stats
    └── Generated date
```

---

## 12. Flow 11 — Consent Status View

```
[Parent navigates to /parent/children/:childId/consent]
    │
    ▼
[GET /api/v1/parent/children/:childId/consent]
    │
    ▼
[Display consent status per category]
    │
    ├── progress_view: granted/revoked
    ├── assessment_view: granted/revoked
    ├── activity_view: granted/revoked
    ├── report_view: granted/revoked
    └── full_access: granted/revoked
```

**Rules:**
- Parent can view consent status but cannot grant or revoke consent.
- Shows who granted consent and when.

---

## 13. Flow 12 — Notification Preferences

```
[Parent navigates to /parent/preferences]
    │
    ▼
[GET /api/v1/parent/preferences]
    │
    ▼
[Display preference toggles per channel × category]
    │
    ▼
[Parent toggles preferences]
    │
    ▼
[PUT /api/v1/parent/preferences]
    │
    ▼
[Show success confirmation]
```

**Rules:**
- Preferences are stored only — no notifications are sent in Phase 12.
- Default preferences are set during onboarding.

---

## 14. Error and Edge Case Flows

| Scenario | Flow |
|---|---|
| JWT expired mid-session | API returns 401 → redirect to /login |
| Child link revoked while viewing | Next API call returns 403 → show "access revoked" |
| Consent revoked while viewing | Next API call returns 403 → show "consent revoked" |
| Network error | Show error banner with retry button |
| Empty data | Show appropriate empty state per view |
| Forbidden (403) | Show generic "access denied" — never reveal guard details |
