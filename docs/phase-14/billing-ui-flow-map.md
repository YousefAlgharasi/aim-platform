# Phase 14 — Billing UI Flow Map

## Purpose

Document pricing, checkout, subscription, invoice, refund request, and payment status UI flows. Guide UI tasks with design-system consistency.

## Design System Requirements

All billing UI must follow the AIM design system from `docs/design/source/aim-design-system`:

- Use design tokens for colors, typography, spacing, radius, and elevation
- Use shared layout components (page shells, sidebars, content areas)
- Use shared cards, tables, forms, badges, and dialogs
- Support responsive layout (mobile-first)
- Support Arabic/RTL readiness
- Use accessible labels, keyboard navigation, and ARIA attributes
- Show consistent loading, empty, error, and forbidden states

## UI Flow: Pricing Page

### Student/Parent View

```
[Loading State] → [Pricing Page]
                      │
                      ├── Plan Cards (from GET /api/billing/plans)
                      │     ├── Plan name, description
                      │     ├── Price (from backend)
                      │     ├── Feature list (from backend)
                      │     ├── Current plan badge (if subscribed)
                      │     └── [Subscribe] button → Checkout Flow
                      │
                      └── [Empty State] if no plans available
```

**Rules:**
- Prices displayed are from backend API only
- No client-side price calculation
- Current subscription status from backend
- Subscribe button calls backend checkout API

## UI Flow: Checkout

```
User clicks [Subscribe]
     │
     ├── POST /api/billing/checkout { priceId, successUrl, cancelUrl }
     │
     ├── [Loading] while creating session
     │
     ├── Success → Redirect to provider checkout URL
     │     │
     │     ├── Provider handles card input
     │     └── Provider redirects to successUrl or cancelUrl
     │
     ├── Success callback → GET /api/billing/checkout/:id
     │     │
     │     ├── status: completed → Show success page
     │     ├── status: pending → Show processing message
     │     └── status: failed → Show failure message
     │
     └── Error → Show error message (no sensitive details)
```

**Rules:**
- Checkout session created by backend
- Card input on provider-hosted page only
- Status comes from backend after redirect
- No client-side payment status decisions

## UI Flow: Subscription Management

### Student View

```
[Subscriptions Page]
     │
     ├── GET /api/billing/subscriptions
     │
     ├── Active subscriptions list
     │     ├── Plan name
     │     ├── Status badge (active, trialing, past_due, canceled)
     │     ├── Current period dates
     │     ├── Next billing date
     │     └── [Cancel] button → Cancel confirmation dialog
     │
     ├── Cancel flow
     │     ├── Confirmation dialog with warning
     │     ├── POST /api/billing/subscriptions/:id/cancel
     │     └── Show updated status (cancels at period end)
     │
     └── [Empty State] if no subscriptions
```

### Parent View

```
[Parent Billing Dashboard]
     │
     ├── Child selector (linked children)
     │
     ├── GET /api/billing/parent/children/:childId/subscriptions
     │
     └── Same subscription display as student view
```

**Rules:**
- Status badges use design system badge component
- Cancel goes through backend API
- Status reflects backend state only

## UI Flow: Payment History

```
[Payments Page]
     │
     ├── GET /api/billing/payments
     │
     ├── Payments table
     │     ├── Date
     │     ├── Amount (formatted with currency)
     │     ├── Status badge (succeeded, pending, failed, refunded)
     │     ├── Payment method type (card, wallet — safe label)
     │     └── [View] → Payment detail
     │
     ├── Payment detail
     │     ├── Amount, currency, status
     │     ├── Related subscription/checkout
     │     ├── Related invoice link
     │     └── [Request Refund] if eligible
     │
     └── [Empty State] if no payments
```

**Rules:**
- No raw card data displayed (only safe labels like "Visa •••• 4242")
- Status from backend only
- Amount from backend only

## UI Flow: Invoices

```
[Invoices Page]
     │
     ├── GET /api/billing/invoices
     │
     ├── Invoices table
     │     ├── Invoice number/date
     │     ├── Amount (formatted with currency)
     │     ├── Status badge (draft, open, paid, void)
     │     ├── Period dates
     │     └── [View] → Invoice detail / provider invoice URL
     │
     └── [Empty State] if no invoices
```

**Rules:**
- Invoice data from backend only
- Status from backend only
- Invoice URL is provider-hosted (safe)

## UI Flow: Refund Request

```
[Payment Detail] → [Request Refund]
     │
     ├── Refund request form
     │     ├── Payment reference (read-only)
     │     ├── Amount (read-only, from backend)
     │     ├── Reason (text input, required)
     │     └── [Submit Request] button
     │
     ├── POST /api/billing/refunds { paymentId, reason }
     │
     ├── Success → Show "Refund request submitted" message
     │
     └── Error → Show error message
```

```
[Refund Requests Page]
     │
     ├── GET /api/billing/refunds
     │
     ├── Refund requests list
     │     ├── Date
     │     ├── Amount
     │     ├── Reason
     │     └── Status badge (pending, succeeded, failed, denied)
     │
     └── [Empty State] if no refund requests
```

**Rules:**
- Refund amount is not editable by client
- Refund status from backend only
- Request goes through backend review

## UI Flow: Admin Billing Dashboard

```
[Admin Billing Overview]
     │
     ├── Summary cards (total revenue, active subscriptions, pending refunds)
     │
     ├── Navigation tabs
     │     ├── Products → Product management
     │     ├── Plans → Plan management
     │     ├── Subscriptions → All subscriptions (read-only)
     │     ├── Payments → All payments (read-only)
     │     ├── Invoices → All invoices (read-only)
     │     ├── Refunds → Refund review and approval
     │     ├── Coupons → Coupon management
     │     └── Audit Logs → Billing audit trail (read-only)
     │
     └── Refund review
           ├── Pending refund requests
           ├── [Approve] → POST /api/billing/admin/refunds/:id/approve
           └── [Deny] → POST /api/billing/admin/refunds/:id/deny
```

**Rules:**
- Admin UI is read-only except product/plan management and refund approval
- No provider secrets displayed
- No raw provider payloads displayed
- Uses design system tables, cards, badges, and dialogs

## Common UI States

| State | Component | Description |
|-------|-----------|-------------|
| Loading | Skeleton / Spinner | Design system loading component |
| Empty | Empty state illustration + message | "No subscriptions yet" |
| Error | Error banner / toast | "Failed to load billing data" |
| Forbidden | 403 page | "You don't have access to this page" |
| Success | Success toast / banner | "Checkout completed successfully" |

## Responsive Layout

- Mobile: single column, stacked cards, collapsible tables
- Tablet: two-column layout where appropriate
- Desktop: full layout with sidebar navigation
- All breakpoints follow design system responsive rules

## RTL/Arabic Readiness

- All text direction follows `dir` attribute
- Layout mirrors for RTL
- Currency formatting respects locale
- Date formatting respects locale
- Form labels and inputs support RTL
