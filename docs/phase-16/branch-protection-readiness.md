# Branch Protection Readiness

**Task:** P16-016
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document required protected branch rules, required status checks, review
gates, and merge rules for the AIM Platform repository before production
release.

## Current State

### Branch Structure

The repository currently triggers CI on push/PR to `main`. No branch
protection rules have been documented or confirmed as configured in
GitHub.

### Existing CI Status Checks

These are the workflow job names that can be configured as required status
checks:

| Workflow | Job Name | Scope |
|----------|----------|-------|
| Backend API CI | `Build and Test` | `services/backend-api/**` |
| Flutter Mobile CI | `Analyze and Test` | `apps/mobile/**` |
| Admin Dashboard CI | `Typecheck and Build` | `apps/admin-dashboard/**` |
| AIM Engine CI | `Lint and Test` | `services/aim-engine/**` |
| Docs Consistency CI | `Docs Consistency Checks` | `docs/**` |

Note: These workflows are path-scoped, meaning they only run when their
respective paths are changed. GitHub required checks handle this by
treating skipped checks as passing (when configured appropriately).

## Recommended Branch Protection Rules

### `main` Branch (Primary)

| Rule | Setting | Rationale |
|------|---------|-----------|
| **Require pull request reviews** | Enabled | Prevent direct push to main |
| **Required approving reviews** | 1 minimum | At least one reviewer must approve |
| **Dismiss stale reviews** | Enabled | New commits invalidate existing approvals |
| **Require review from code owners** | Enabled (if CODEOWNERS file exists) | Ensure module owners review their areas |
| **Require status checks to pass** | Enabled | CI must pass before merge |
| **Require branches to be up to date** | Enabled | Merge conflicts must be resolved |
| **Require conversation resolution** | Enabled | All review comments must be addressed |
| **Restrict push access** | Admin and release managers only | Prevent direct pushes |
| **Allow force push** | Disabled | Prevent history rewriting |
| **Allow deletion** | Disabled | Prevent accidental branch deletion |
| **Require linear history** | Recommended | Squash merges keep history clean |

### Required Status Checks for `main`

| Status Check | Required? | Notes |
|-------------|-----------|-------|
| `Build and Test` (backend-api) | Required | Must pass when backend code changes |
| `Analyze and Test` (mobile) | Required | Must pass when mobile code changes |
| `Typecheck and Build` (admin-dashboard) | Required | Must pass when admin code changes |
| `Lint and Test` (aim-engine) | Required | Must pass when AIM Engine changes |
| `Docs Consistency Checks` (docs) | Required | Must pass when docs change |

### Path-Scoped Check Behavior

GitHub's behavior with path-scoped required checks:

- When a PR only changes `services/backend-api/`, only the Backend API CI
  workflow runs. The other workflows are skipped.
- For skipped required checks, GitHub needs to be configured to treat them
  as passing. This can be done by:
  1. Using `paths-filter` action to conditionally skip jobs (leaving them
     as "success" rather than "skipped"), or
  2. Enabling "Do not require" for status checks that are path-filtered

**Recommendation:** Keep path-scoped triggers for efficiency, but ensure
the GitHub branch protection rule is configured to handle skipped checks
correctly.

## Suggested Release Branch Strategy

### Branch Types

| Branch Pattern | Purpose | Protection |
|----------------|---------|------------|
| `main` | Primary development branch | Full protection (see above) |
| `release/*` | Release candidates | Full protection, same as main |
| `hotfix/*` | Production hotfixes | Requires 1 review, all checks pass |
| `feature/*` | Feature development | No protection (developer branches) |
| `claude/*` | AI-assisted development | No protection |

### Merge Rules

| Merge Type | When to Use |
|------------|-------------|
| **Squash merge** | Feature branches to main (keeps history clean) |
| **Merge commit** | Release branches to main (preserves release history) |
| **Rebase** | Avoid (complicates path-scoped CI triggers) |

### Release Flow

```
feature/* ──squash──> main ──merge──> release/v1.0
                                        │
hotfix/* ──squash──> release/v1.0 ──merge──> main
```

## CODEOWNERS Recommendation

Create `.github/CODEOWNERS` to enforce module-specific review requirements:

```
# Backend API
services/backend-api/              @backend-team

# AIM Engine
services/aim-engine/               @algorithm-team

# Mobile App
apps/mobile/                       @mobile-team

# Admin Dashboard
apps/admin-dashboard/              @frontend-team

# Web App (Parent Dashboard)
apps/web/                          @frontend-team

# CI Workflows
.github/workflows/                 @platform-team

# Documentation
docs/                              @tech-lead

# Design System
docs/design/                       @design-team @frontend-team

# Database Migrations
services/backend-api/prisma/       @backend-team @dba

# Infrastructure
infra/                             @platform-team

# Security-sensitive files
services/backend-api/src/auth/     @backend-team @security-lead
services/backend-api/src/features/billing/  @backend-team @security-lead
.env.example                       @backend-team @security-lead
scripts/check-env-safety.sh        @platform-team @security-lead
```

## Pre-Merge Checklist

Before merging any PR to `main`, the following should be verified:

- [ ] All required CI status checks pass
- [ ] At least 1 approving review
- [ ] All review conversations resolved
- [ ] Branch is up to date with `main`
- [ ] No merge conflicts
- [ ] PR description includes summary of changes
- [ ] Security-sensitive changes reviewed by security lead
- [ ] Database migrations reviewed by backend team + DBA
- [ ] Breaking API changes documented

## Implementation Steps

1. **Configure `main` branch protection** in GitHub repository Settings >
   Branches > Branch protection rules
2. **Create CODEOWNERS file** at `.github/CODEOWNERS` with the recommended
   content above
3. **Verify CI check names** match the job names listed in this document
4. **Test path-scoped check behavior** by creating a PR that only changes
   one service and verifying other checks are correctly handled
5. **Document the release branch strategy** in a CONTRIBUTING.md file
6. **Enable merge method restrictions** — allow squash merge only for
   feature branches

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Path-scoped checks block PRs when other services' checks are "skipped" | PRs cannot be merged | Configure GitHub to allow skipped checks |
| CODEOWNERS blocks PRs when team members are unavailable | Merge delays | Add multiple owners per path; use a fallback team |
| Required reviews slow down urgent hotfixes | Deployment delays | Allow admin override for emergency hotfixes (documented, audited) |
