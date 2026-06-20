# Phase 14 — Payments and Billing Charter

## Purpose

Phase 14 builds the payments and billing system for AIM Platform, covering products, pricing, subscriptions, checkout, payments, invoices, refunds, coupons/promotions, entitlements, provider webhook processing, idempotent billing operations, billing audit logs, and billing UI for students, parents, and admins.

## Scope

### In Scope

- Billable products and features catalog
- Prices, currencies, and billing intervals
- Subscription plans with feature limits
- Subscription lifecycle (create, activate, cancel, renew, expire)
- Checkout session creation and status tracking
- Payment records and status tracking (no raw card data)
- Invoice generation and status tracking
- Refund requests and processing
- Coupons and promotion codes
- Entitlements derived from subscriptions and payments
- Payment provider abstraction layer
- Provider webhook event ingestion and verification
- Idempotent billing event processing
- Billing audit logs
- Student billing UI (view pricing, start checkout, view subscriptions/invoices)
- Parent billing UI (view pricing, manage child subscriptions, view invoices)
- Admin billing UI (read-only billing overview, controlled refund actions)
- Billing security and compliance reviews

### Out of Scope

- Voice AI implementation
- AI Teacher implementation
- AI Prompt Management
- AI Cost Control
- Student Web App
- Parent Dashboard expansion beyond billing
- Admin Dashboard expansion beyond billing
- Full analytics dashboard implementation
- Phase 15 analytics (except readiness documentation)
- Raw card data storage or processing
- PCI DSS Level 1 card processing (delegated to provider)

## Payment Authority Rules

### Backend/Provider Authority

The backend and payment provider events are the sole authority for:

- Product and price definitions
- Checkout session creation and status
- Payment status and amount
- Subscription status and lifecycle
- Invoice status and totals
- Refund status and amounts
- Entitlement grants and revocations
- Provider event validity and processing
- Coupon/promotion eligibility and application

### Client/UI Restrictions

Client and UI layers must NOT:

- Calculate or decide final price authority
- Set or override payment status
- Set or override subscription status
- Set or override invoice status
- Set or override refund status
- Grant or revoke entitlements
- Validate or trust provider event bodies without backend verification
- Store raw card data (card numbers, CVV/CVC, expiry)

Client and UI layers MAY:

- Display backend-approved products, prices, and plans
- Call protected backend APIs to start checkout
- Display backend-approved checkout, payment, and subscription status
- Display backend-approved invoices
- Submit refund requests through protected backend APIs
- Display backend-approved entitlement state

## Compliance Boundaries

### Sensitive Data

- No raw card data stored in AIM databases
- No provider secret keys committed or exposed in client code
- No webhook signing secrets in client code or logs
- No service-role keys in client code or logs
- No database credentials in client code or logs
- No production tokens in client code or logs
- No sensitive provider payloads logged or exposed to clients

### Logging Restrictions

- Do not log raw card numbers, CVV/CVC, or payment credentials
- Do not log provider secret keys or webhook signing secrets
- Do not log full raw provider webhook payloads containing sensitive data
- Log only safe, non-sensitive billing event metadata for audit purposes

## Provider Boundaries

- Use provider abstraction layer to avoid vendor lock-in
- Support Stripe as initial provider with abstraction for future providers
- Verify webhook signatures before processing provider events
- Enforce idempotency on all webhook/provider event processing
- Do not hardcode provider secrets — use environment variables
- Do not expose provider-specific implementation details to clients

## Dependencies

- Phase 13 readiness documentation (P13-078)
- AIM Design System (DES-001) for all billing UI
- Existing backend feature-based architecture (NestJS modules)
- Existing database infrastructure (Prisma + PostgreSQL)
- Existing authentication and authorization guards

## Design System Requirement

All billing UI must follow the approved AIM design system from `docs/design/source/aim-design-system`, using:

- Approved design tokens (colors, typography, spacing, radius, elevation)
- Shared layout components
- Shared cards, tables, forms, badges, and dialogs
- Responsive layout rules
- Arabic/RTL readiness
- Accessible labels and controls
- Consistent loading, empty, error, and forbidden states

## Success Criteria

- All billing entities have database migrations with constraints
- Backend owns all payment lifecycle authority
- Provider abstraction supports webhook verification and idempotency
- Billing UI follows AIM design system
- No raw card data stored
- No provider secrets committed or exposed
- All billing endpoints protected with auth, ownership, and role guards
- Audit trail exists for billing actions
