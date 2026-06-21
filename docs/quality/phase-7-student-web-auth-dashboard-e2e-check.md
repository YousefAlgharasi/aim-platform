# Phase 7 — Student Web Auth and Dashboard E2E Check

## Review Date
2026-06-21

## Scope
End-to-end verification of authentication flows, dashboard, progress, profile, and settings in student-web.

## Test Scenarios

### 1. Login Flow
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.1 | Navigate to `/login` | Login form displayed with email and password fields | PASS |
| 1.2 | Submit empty form | Validation errors shown | PASS |
| 1.3 | Submit invalid credentials | Error message from backend displayed | PASS |
| 1.4 | Submit valid credentials | Redirect to `/dashboard`, auth token stored in memory | PASS |
| 1.5 | Access protected route without auth | Redirect to `/login` with `returnTo` state | PASS |

### 2. Registration Flow
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1 | Navigate to `/register` | Registration form displayed | PASS |
| 2.2 | Submit with valid data | Account created via API, redirect to login or dashboard | PASS |
| 2.3 | Submit with existing email | Backend error displayed | PASS |

### 3. Forgot Password
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1 | Navigate to `/forgot-password` | Reset form displayed | PASS |
| 3.2 | Submit valid email | Success message, reset initiated via backend | PASS |

### 4. Session Expiry
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1 | Token expires during session | Redirect to `/session-expired` | PASS |
| 4.2 | Click login again | Redirect to `/login` | PASS |

### 5. Dashboard
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1 | Navigate to `/dashboard` | Stats grid, recent activity, recommendations loaded from API | PASS |
| 5.2 | Click quick action | Navigation to correct feature page | PASS |
| 5.3 | Dashboard shows loading state | LoadingSpinner displayed while API fetches | PASS |
| 5.4 | API error on dashboard | ErrorState component displayed | PASS |

### 6. Progress Summary
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.1 | Navigate to `/progress` | Overall progress, subject breakdown from API | PASS |
| 6.2 | Navigate to `/progress/skills` | Skill state grid with mastery levels from API | PASS |
| 6.3 | No progress data | EmptyState component displayed | PASS |

### 7. Profile
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.1 | Navigate to `/profile` | Profile data loaded from API | PASS |
| 7.2 | Update profile fields | Changes submitted via API, success feedback | PASS |

### 8. Settings
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 8.1 | Navigate to `/settings` | Settings loaded from API | PASS |
| 8.2 | Toggle settings | Changes saved via API | PASS |

## Authority Verification
- No local auth token generation — tokens come from backend
- No local progress calculation — all values from API
- No local mastery computation — displayed from backend
- Dashboard widgets display-only — no data mutation

## Verdict
PASS — Auth flows, dashboard, progress, profile, and settings follow correct E2E patterns with backend authority.
