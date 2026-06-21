# Phase 16 Design System Release Gate

**Task:** P16-008
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Define UI release requirements for AIM design system compliance across all
user-facing surfaces: mobile app, admin dashboard, parent dashboard, and
reporting/billing/notification UIs. The AIM design system lives at
`docs/design/source/aim-design-system/` and provides the canonical source
for tokens, components, and foundations.

## Design System Inventory

**Location:** `docs/design/source/aim-design-system/`

| Artifact | Path | Description |
|----------|------|-------------|
| Overview | `overview.html` | Design system landing page |
| Full preview | `AIM Design System.html` | Complete rendered preview |
| Manifest | `_ds_manifest.json` | Component and token registry |
| Bundle | `_ds_bundle.js` | Pre-built design system JavaScript |
| Styles | `styles.css` | Global design system styles |
| Tokens | `tokens/` | Design tokens (colors, spacing, typography, etc.) |
| Components | `components/` | Reusable UI component definitions |
| Foundations | `foundations/` | Layout, grid, RTL, typography foundations |
| Adherence config | `_adherence.oxlintrc.json` | Lint rules for design system compliance |
| Skill doc | `SKILL.md` | Design system usage guide |

## Release Gate Requirements

### Gate 1: Token Usage Compliance

All user-facing surfaces must use design system tokens for:

| Token Category | Requirement | Mobile | Admin | Parent |
|----------------|-------------|--------|-------|--------|
| Colors | Use `tokens/` color definitions, no hardcoded hex values | Requires audit | Requires audit | Requires audit |
| Typography | Use defined font families, sizes, weights | Requires audit | Requires audit | Requires audit |
| Spacing | Use defined spacing scale (4px, 8px, 16px, etc.) | Requires audit | Requires audit | Requires audit |
| Border radius | Use defined radius values | Requires audit | Requires audit | Requires audit |
| Shadows | Use defined elevation/shadow values | Requires audit | Requires audit | Requires audit |

### Gate 2: Component Usage

| Component Area | Mobile (`apps/mobile/lib/features/`) | Admin (`apps/admin-dashboard/components/`) | Parent (`apps/web/src/features/`) |
|----------------|--------------------------------------|-------------------------------------------|-----------------------------------|
| Navigation | Feature-specific navigation | `admin-navigation.tsx` | Feature routing |
| Layout shell | App scaffold | `admin-shell-layout.tsx`, `layout/` | App layout |
| Buttons | Custom widgets | `common/` components | Shared components |
| Forms | Input widgets | Form components | Form components |
| Cards | Content cards | Placeholder pages | Dashboard cards |
| Data tables | N/A (mobile) | Admin list views | Report tables |
| Modals/dialogs | Dialog widgets | Error handling components | Alert dialogs |
| Status indicators | Progress widgets | `content-status-workflow.tsx` | Status indicators |
| Error states | Error screens | `error-handling/` | Error boundaries |

### Gate 3: RTL/Arabic Support

| Requirement | Verification | Status |
|-------------|-------------|--------|
| All text renders correctly in Arabic | Manual testing with Arabic content | Requires testing |
| Layout mirrors in RTL mode | Visual inspection of all screens | Requires testing |
| Icons do not flip incorrectly | RTL-aware icon review | Requires testing |
| Form inputs support RTL text entry | Arabic text input testing | Requires testing |
| Navigation direction follows locale | LTR/RTL layout switching | Requires testing |
| Numbers display correctly | Mixed numeral system handling | Requires testing |

### Gate 4: Per-Surface Compliance

#### Mobile App (`apps/mobile/`)

| Feature | DS Compliance | Notes |
|---------|---------------|-------|
| `achievements/` | Requires audit | Custom achievement badges may need DS tokens |
| `ai_teacher/` | Requires audit | Chat UI should follow DS message components |
| `aim_results/` | Requires audit | Results display with DS data visualization |
| `analytics_summary/` | Requires audit | Charts and summaries with DS tokens |
| `assessments/` | Requires audit | Question rendering, answer input, feedback display |
| `auth/` | Requires audit | Login/signup forms |
| `billing/` | Requires audit | Plan selection, checkout flow |
| `design_system_preview/` | Reference implementation | This feature IS the DS preview |
| `home/` | Requires audit | Home screen layout |
| `learning_path/` | Requires audit | Path visualization |
| `lessons/` | Requires audit | Lesson content rendering |
| `notifications/` | Requires audit | Notification list, preference toggles |
| `onboarding/` | Requires audit | Welcome flow screens |
| `placement/` | Requires audit | Test flow, progress indicators |
| `practice/` | Requires audit | Practice session UI |
| `profile/` | Requires audit | Profile display and edit forms |
| `progress/` | Requires audit | Progress charts and indicators |
| `question_answer/` | Requires audit | Question display, answer submission |
| `reviews/` | Requires audit | Review session UI |

#### Admin Dashboard (`apps/admin-dashboard/`)

| Area | DS Compliance | Notes |
|------|---------------|-------|
| Shell layout | Requires audit | `admin-shell-layout.tsx` — main app frame |
| Navigation | Requires audit | `admin-navigation.tsx` — sidebar/header nav |
| Billing pages | Requires audit | `components/billing/` — billing management |
| Content workflow | Requires audit | `content-status-workflow.tsx` — status management |
| Error handling | Requires audit | `components/error-handling/` — error states |
| Auth pages | Requires audit | `app/admin-auth-required/`, `app/admin-auth-unavailable/`, `app/admin-unauthorized/` |
| Admin pages | Requires audit | `app/admin/` — main admin area |

#### Parent Dashboard (`apps/web/`)

| Area | DS Compliance | Notes |
|------|---------------|-------|
| Admin analytics | Requires audit | `src/features/admin-analytics/` |
| Admin notifications | Requires audit | `src/features/admin-notifications/` |
| Parent dashboard | Requires audit | `src/features/parent-dashboard/` |
| Status page | Requires audit | `src/features/status/` |
| Shared components | Requires audit | `src/shared/` |

### Gate 5: Reporting/Billing/Notifications UI

| UI Surface | Backend Support | Frontend Location | DS Compliance |
|------------|-----------------|-------------------|---------------|
| Admin analytics dashboard | `admin-analytics-dashboard.controller.ts` | `apps/web/src/features/admin-analytics/` | Requires audit |
| Admin learning reports | `admin-learning-reports.controller.ts` | Admin dashboard pages | Requires audit |
| Admin assessment reports | `admin-assessment-reports.controller.ts` | Admin dashboard pages | Requires audit |
| Admin revenue reports | `admin-revenue-reports.controller.ts` | Admin dashboard pages | Requires audit |
| Parent reports | `parent-reports.controller.ts` | `apps/web/src/features/parent-dashboard/` | Requires audit |
| Billing checkout | `checkout.controller.ts` | Mobile billing feature | Requires audit |
| Billing invoices | `invoices.controller.ts` | Admin billing components | Requires audit |
| Billing subscriptions | `subscription.controller.ts` | Admin billing components | Requires audit |
| Notification inbox | `inbox.controller.ts` | Mobile notifications feature | Requires audit |
| Notification preferences | `preferences.controller.ts` | Mobile + parent notification settings | Requires audit |

## Adherence Tooling

The design system includes `_adherence.oxlintrc.json` which defines lint
rules for detecting non-compliant styling patterns. This should be
integrated into CI for frontend projects.

**Recommendation:** Add an `oxlint` step to the admin-dashboard CI workflow
that checks against `_adherence.oxlintrc.json`.

## Release Gate Checklist

- [ ] All design system tokens documented in `tokens/` directory
- [ ] Component library covers all common UI patterns
- [ ] Mobile app audit complete — all features use DS tokens
- [ ] Admin dashboard audit complete — all pages use DS tokens
- [ ] Parent dashboard audit complete — all features use DS tokens
- [ ] RTL/Arabic rendering tested on all surfaces
- [ ] No hardcoded colors, font sizes, or spacing values in UI code
- [ ] Design system adherence lint passes in CI
- [ ] `_ds_manifest.json` is up to date with all components
- [ ] Design system version tagged for release
