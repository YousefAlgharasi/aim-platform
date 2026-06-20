# Phase 13 Readiness from Phase 12

**Task:** P12-076
**Date:** 2026-06-20
**Author:** yo0sf

## Summary

Phase 12 delivers the complete parent dashboard UI layer. Phase 13 can build on this foundation.

## What Phase 12 Delivers

- **Layout system** with responsive sidebar, header, mobile nav
- **13 page components** covering all parent-facing views
- **API client** with all parent endpoints wired
- **Auth guard** for token-based access control
- **Reusable components** (Card, Table, Badge, ProgressBlock, ChartShell, state components)
- **Design system compliance** with AIM tokens throughout
- **RTL/Arabic readiness** with logical CSS properties
- **Test suites** for no-authority and permission/error handling

## What Phase 13 Should Add

| Area | Description |
|---|---|
| **Routing** | Replace `activeKey` navigation with React Router |
| **Notifications** | Send actual notifications (preferences UI ready) |
| **Real-time updates** | WebSocket or polling for live dashboard data |
| **Token refresh** | Handle JWT expiry and refresh flow |
| **Re-invitation** | Flow for expired invitation tokens |
| **Charts** | Replace `ParentChartShell` placeholders with real charts |
| **Data retention** | Define and enforce data retention policies |
| **Offline support** | Service worker for cached dashboard access |
| **E2E tests** | Cypress/Playwright tests against running backend |

## Integration Points

- Backend endpoints at `/api/v1/parent/*` are stable
- DTOs defined and validated on backend
- Guards (SupabaseJwtAuthGuard, ParentChildAccessGuard) enforced
- Consent model operational

## Risks

- No token refresh mechanism yet — sessions may expire silently
- Chart placeholders need data format specification from backend team
- Notification delivery infrastructure not yet built
