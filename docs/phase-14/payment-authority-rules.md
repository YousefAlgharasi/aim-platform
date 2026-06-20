# Phase 14 — Payment Authority Rules

## Purpose

Define which system layer has authority over each billing decision. Prevent client-side payment or entitlement authority.

## Authority Matrix

| Domain | Authority | Client/UI May |
|--------|-----------|---------------|
| Product definitions | Backend/admin | Read active products |
| Price values | Backend/admin | Display approved prices |
| Plan configuration | Backend/admin | Display approved plans |
| Checkout session creation | Backend via provider API | Request checkout via backend API |
| Checkout session status | Provider events via backend | Display backend-approved status |
| Payment status | Provider events via backend | Display backend-approved status |
| Payment amount | Backend (from provider) | Display backend-approved amount |
| Subscription status | Provider events via backend | Display backend-approved status |
| Subscription lifecycle | Backend + provider events | Request cancel via backend API |
| Invoice status | Provider events via backend | Display backend-approved status |
| Invoice totals | Backend (from provider) | Display backend-approved totals |
| Refund status | Provider events via backend | Display backend-approved status |
| Refund approval | Backend (admin action) | Submit refund request via backend API |
| Entitlement grants | Backend (derived from subscription/payment) | Read entitlement state |
| Entitlement revocations | Backend (on cancel/expire/refund) | Read entitlement state |
| Coupon/promotion application | Backend at checkout | Submit promotion code via backend API |
| Webhook event validity | Backend (signature verification) | Never |
| Provider event processing | Backend (idempotent handler) | Never |

## Price Authority

- Backend and provider define all prices
- Client must never submit, calculate, or override prices
- Discounts are applied server-side only, verified against coupon/promotion rules
- The price displayed to the user comes from the backend API
- The price charged is determined by the provider at checkout time

## Payment Status Authority

- Payment status transitions are driven by provider events (webhook)
- Backend processes provider events and updates local payment records
- Client displays only backend-approved payment status
- Client must never set a payment to "succeeded", "failed", or "refunded"

## Subscription Status Authority

- Subscription status is owned by provider events processed through backend
- Status transitions: trialing → active → past_due → canceled → expired
- Backend updates subscription status based on verified provider events
- Client may request cancellation via protected backend endpoint
- Client must never directly set subscription status

## Invoice Status Authority

- Invoice status follows provider events: draft → open → paid → void
- Backend updates invoice records from verified provider events
- Client displays backend-approved invoice status and totals
- Client must never mark an invoice as paid

## Refund Authority

- Refund requests are submitted through protected backend API
- Admin reviews and approves/denies refund requests
- Backend initiates refund with provider upon approval
- Provider events confirm refund status
- Client must never set refund status

## Entitlement Authority

- Entitlements are derived by backend from active subscriptions and payments
- Backend grants entitlements when subscription activates or payment succeeds
- Backend revokes entitlements when subscription cancels, expires, or payment is refunded
- Client reads entitlement state from backend API
- Client must never grant or revoke entitlements

## Webhook Event Authority

- All provider webhook events must be verified via signature before processing
- Events are processed idempotently (duplicate events are safely skipped)
- Client never receives raw provider events
- Client never validates or processes provider events
- Backend logs safe event metadata to audit trail

## Enforcement Rules

1. Every billing endpoint requires authentication
2. Every billing endpoint verifies user ownership or admin role
3. Every state-changing billing operation is backend-initiated
4. Every provider event is signature-verified before processing
5. Every provider event is processed with idempotency keys
6. No billing DTO accepts client-submitted status, price, or entitlement fields
7. No client-facing API exposes provider secrets or raw provider payloads
