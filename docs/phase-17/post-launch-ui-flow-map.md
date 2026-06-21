# Phase 17 — Post-Launch UI Flow Map

**Task:** P17-010
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document help, support tickets, feedback, status, release notes, and admin operations flows. Guide post-launch UI with design-system consistency.

## UI Authority Rule

All operations UI displays backend-provided state only. UI must not compute or override admin-only operational state (support ticket status, incident status, maintenance state, release publishing status, feature flag rollout, operational health).

## Design System Reference

All flows must use:
- Design tokens from `docs/design/source/aim-design-system`
- Shared component patterns (badges, cards, tables, forms)
- Responsive, mobile-first layout with RTL/Arabic readiness
- Loading, empty, error, and forbidden states per P17-008

---

## Flow 1: Help & Support (Student/Parent)

### Entry Points
- Help icon in main navigation
- Help link in settings menu
- Error page "Contact Support" action

### Screens

#### 1.1 Help Center
- Page heading: "Help & Support" (`--type-heading-lg`)
- Quick links to FAQ categories as cards (`--radius-md`, `--shadow-sm`)
- "Create Support Ticket" primary button (`--color-primary`)

#### 1.2 Create Support Ticket
- Form with shared input components
- Fields: Category (select), Severity (select), Subject (text), Description (textarea)
- Labels: `--type-caption`
- Submit button: `--color-primary`
- Validation errors: `--color-error`
- On success: redirect to ticket detail

#### 1.3 My Tickets List
- Table with sortable columns: Subject, Category, Severity, Status, Created
- Status badges: open → `--color-info`, in_progress → `--color-warning`, resolved → `--color-success`
- Empty state: "No tickets yet" (`--color-text-secondary`)
- Pagination from backend

#### 1.4 Ticket Detail
- Card layout with subject as heading (`--type-heading-sm`)
- Status badge in top-right corner
- Metadata: category, severity as badge chips (`--radius-full`)
- Timestamps: `--type-caption`
- Comment thread below ticket details
- "Add Comment" textarea with submit
- Only shows own ticket (403 forbidden state for others)

---

## Flow 2: User Feedback

### Entry Points
- "Give Feedback" link in navigation or settings
- Post-session feedback prompt

### Screens

#### 2.1 Submit Feedback
- Form: Category (select), Rating (1-5 optional), Title (text), Body (textarea), Source Surface (auto-detected)
- Submit button: `--color-primary`
- Success confirmation message

#### 2.2 My Feedback
- List of own feedback submissions as cards
- Category and status badges
- Status: new → `--color-info`, under_review → `--color-warning`, accepted → `--color-success`, declined → `--color-error`
- Empty state: "No feedback submitted yet"

---

## Flow 3: Feature Requests

### Entry Points
- "Feature Requests" link in navigation
- Link from feedback form

### Screens

#### 3.1 Feature Request List
- Table/card list of all feature requests (public)
- Sortable by: vote count, date, status
- Vote button per request
- Status badges: new → info, planned → warning, completed → success, declined → error
- Pagination from backend

#### 3.2 Submit Feature Request
- Form: Title (text, max 300), Description (textarea)
- Submit button: `--color-primary`
- On success: redirect to list

#### 3.3 Feature Request Detail
- Card with title (`--type-heading-sm`)
- Description body text
- Status badge, vote count
- Vote button (one per user)

---

## Flow 4: Operational Status (Public)

### Entry Points
- "System Status" link in footer or navigation
- Status page accessible without login (optional)

### Screens

#### 4.1 Status Dashboard
- Page heading: "System Status" (`--type-heading-lg`)
- List of components as cards
- Status badges per component: operational → `--color-success`, degraded → `--color-warning`, partial_outage/major_outage → `--color-error`, maintenance → `--color-info`
- Last updated timestamp: `--type-caption`
- No user action (read-only, backend authority)

---

## Flow 5: Release Notes (Public)

### Entry Points
- "What's New" link in navigation or footer
- Banner for new releases (optional)

### Screens

#### 5.1 Release Notes List
- Cards per release note: version chip, title heading, date caption
- Only shows published notes (backend filters)
- Audience-scoped (backend returns only relevant audience)
- Pagination from backend
- Empty state: "No release notes yet"

#### 5.2 Release Note Detail
- Version badge chip (`--radius-full`)
- Title: `--type-heading-md`
- Body: `--type-body`
- Published date: `--type-caption`
- Back link to list

---

## Flow 6: Admin — Support Ticket Management

### Entry Points
- Admin dashboard → "Support Tickets" menu item

### Screens

#### 6.1 All Tickets List
- Table: Subject, Requester, Category, Severity, Status, Assigned, Created
- Sortable, filterable, paginated
- Status badges with semantic colors

#### 6.2 Ticket Detail (Admin)
- Full ticket info with all metadata
- Admin actions: Change Status (select), Assign (select agent)
- Comment thread with internal visibility option
- Audit trail from backend

---

## Flow 7: Admin — Incident Management

### Entry Points
- Admin dashboard → "Incidents" menu item

### Screens

#### 7.1 Incident List
- Table: Title, Severity, Status, Started, Resolved
- Create Incident button (`--color-primary`)
- Status badges: investigating → info, identified → warning, resolved → success, postmortem → `--color-text-secondary`

#### 7.2 Create Incident
- Form: Title, Description, Severity (select), Started At (datetime)
- Admin-only access (403 for non-admins)

#### 7.3 Incident Detail (Admin)
- Status update actions
- Postmortem URL field
- Resolve action with timestamp

---

## Flow 8: Admin — Maintenance Windows

### Entry Points
- Admin dashboard → "Maintenance" menu item

### Screens

#### 8.1 Maintenance Window List
- Table: Title, Type, Status, Scheduled Start/End
- Create Window button

#### 8.2 Create Maintenance Window
- Form: Title, Description, Type (planned/emergency), Scheduled Start/End, Affected Services, User Message

#### 8.3 Maintenance Detail (Admin)
- Status updates: scheduled → in_progress → completed/cancelled
- Actual start/end timestamps

---

## Flow 9: Admin — Release Notes Management

### Screens

#### 9.1 Release Notes Admin List
- Table: Version, Title, Audience, Status, Created
- Create Draft button

#### 9.2 Create Draft
- Form: Version, Title, Body, Audience (select)

#### 9.3 Release Note Admin Detail
- Publish action (admin only, sets published_at)
- Archive action
- Status: draft → warning, published → success, archived → `--color-text-secondary`

---

## Flow 10: Admin — Feature Flags

### Screens

#### 10.1 Flag List
- Table: Key, Name, Enabled, Rollout %, Owner
- Create Flag button

#### 10.2 Flag Detail (Admin)
- Toggle enabled/disabled
- Rollout percentage slider (0-100)
- Audience JSON editor (optional)

---

## State Handling Summary

| State | UI Pattern |
|---|---|
| Loading | Shared spinner/skeleton with `--color-primary` |
| Empty | Centered message with `--color-text-secondary` |
| Error | Error card with `--color-error` border, retry action |
| Forbidden (403) | Message: "You don't have access", no data leakage |

## RTL and Accessibility

- All layouts support `dir="rtl"` for Arabic
- Form labels linked to inputs with `for`/`id`
- Keyboard navigation for all interactive elements
- Semantic HTML elements (headings, lists, tables)

## Verdict

**READY** — Post-launch UI flow map documented. All flows follow AIM design system. Backend authority preserved for all operational state.
