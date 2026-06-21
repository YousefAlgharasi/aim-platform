# Phase 7 — Student Web Architecture Review

## Review Date
2026-06-21

## Scope
Architecture review of student-web SPA covering structure, feature boundaries, API usage, design system, authority, and maintainability.

## Application Architecture

### Technology Stack
- **Framework**: React 19 + TypeScript
- **Routing**: React Router v7 (declarative routes)
- **Styling**: CSS Modules with AIM design system tokens
- **API**: Typed `apiClient` wrapper over fetch
- **Auth**: In-memory token via AuthContext/AuthProvider
- **Build**: Vite (configured via `vite.config.ts`)

### Directory Structure
```
apps/student-web/src/
├── components/common/     # Shared UI components (Button, Card, Modal, etc.)
├── contexts/              # AuthContext, AuthProvider
├── features/              # Feature modules (one directory per domain)
│   ├── auth/              # Login, Register, ForgotPassword, SessionExpired
│   ├── dashboard/         # DashboardHome with widgets
│   ├── profile/           # ProfilePage
│   ├── settings/          # SettingsPage
│   ├── progress/          # ProgressSummary, SkillStatePage
│   ├── placement/         # PlacementEntry, QuestionUI, ResultPage
│   ├── curriculum/        # CourseCatalog, CourseDetail, ChapterLessonList
│   ├── lessons/           # LessonPlayerShell, ContentBlockRenderer, Navigation
│   ├── practice/          # PracticeShell, QuestionRenderer, Feedback
│   ├── assessments/       # List, Detail, AttemptScreen, ResultPage
│   ├── ai-teacher/        # EntryPage, ChatPage, HistoryPage
│   ├── notifications/     # CenterPage, PreferencesPage
│   ├── billing/           # BillingPage, CheckoutPage
│   ├── reports/           # ReportsSummaryPage
│   └── support/           # SupportPage
├── guards/                # AuthGuard
├── hooks/                 # useAuth
├── i18n/                  # useLocale
├── layouts/               # AppLayout, PublicLayout
├── routes/                # AppRoutes
├── services/              # apiClient
├── styles/                # Global CSS (accessibility, responsive, RTL)
└── __tests__/             # Authority test suites
```

## Feature Boundaries

### Encapsulation
- Each feature directory contains its own pages, components, CSS modules, and hooks
- No cross-feature imports (features communicate through routing and shared API client)
- Shared components live in `components/common/`
- Shared hooks in `hooks/` and `i18n/`

### Route Organization
- Public routes wrapped in `PublicLayout` (login, register, forgot-password, session-expired)
- Protected routes wrapped in `AuthGuard` + `AppLayout`
- Error routes (403, 404) accessible without auth
- Clean URL structure matching feature domains

## API Usage

### Pattern
- All data access through `apiClient.get()`, `apiClient.post()`, `apiClient.patch()`, `apiClient.delete()`
- Bearer token attached automatically via `Authorization` header
- `credentials: 'include'` for cookie-based session support
- API base URL from environment variable (`VITE_API_BASE_URL`)
- No direct `fetch()` calls outside `apiClient`

### Data Flow
```
User Action → Component → apiClient → Backend API → Response → Component State → UI
```
- No intermediate data transformation or authority logic
- Loading/error/empty states handled consistently across features

## Design System Compliance
- All colors: `var(--color-*)` tokens
- All typography: `var(--type-*)`, `var(--weight-*)` tokens
- All spacing: `var(--space-*)`, `var(--section-gap)`, `var(--component-gap)` tokens
- All radius: `var(--radius-*)` tokens
- Shared components: Card, Button, Input, Modal, Banner, LoadingSpinner, EmptyState, ErrorState
- Responsive: CSS Grid with 768px/1024px breakpoints, mobile-first
- RTL: Logical CSS properties, `useLocale` hook with `dir` attribute
- Accessibility: focus-visible, reduced-motion, forced-colors, ARIA labels, semantic HTML

## Authority Boundaries

### Client Does NOT
- Calculate mastery, weakness, difficulty, or recommendations
- Compute scores, grades, or pass/fail status
- Enforce deadlines or time limits (visual countdown only)
- Determine placement levels or answer correctness
- Process payments or check entitlements
- Send notifications or schedule deliveries
- Aggregate analytics or metrics
- Call AI providers directly
- Access database directly
- Import AIM Engine modules

### Client DOES
- Display data from backend API responses
- Submit user input to backend for processing
- Store unsent draft answers in sessionStorage
- Manage visual UI state (loading, error, empty, selected tab)
- Handle routing and navigation
- Manage auth token in memory

### Authority Tests
10 authority test suites scan source files for prohibited patterns:
- `progress-authority.test.ts`
- `placement-authority.test.ts`
- `curriculum-authority.test.ts`
- `practice-authority.test.ts`
- `assessment-authority.test.ts`
- `ai-teacher-authority.test.ts`
- `notification-authority.test.ts`
- `billing-authority.test.ts`
- `reports-authority.test.ts`
- `support-authority.test.ts`

## Maintainability

### Strengths
- Feature-based directory structure enables independent development
- Consistent patterns across all features (page + CSS module + hooks)
- Typed API client prevents runtime type errors
- Authority tests act as guardrails against scope creep
- CSS Modules prevent style collisions
- No complex state management library — React state + context sufficient

### Risks
- No client-side caching (SWR/React Query) — may impact perceived performance
- No error boundary implementation at feature level
- No route-level code splitting configured yet

## Verdict
PASS — Student Web App architecture is clean, maintainable, and correctly scoped as a display-only client with all authority delegated to backend.
