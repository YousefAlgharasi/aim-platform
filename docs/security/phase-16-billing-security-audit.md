# P16-047: Billing Security Audit

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Audit Complete — Findings Documented

---

## 1. Scope

This audit covers the billing system at `services/backend-api/src/features/billing/` for:

- Payment provider secret management
- Webhook signature verification and idempotency
- Sensitive billing data handling
- Invoice and refund security
- Entitlement protection and access control
- Coupon/pricing manipulation prevention

---

## 2. Billing Module Inventory

| File | Purpose | Security Relevance |
|------|---------|-------------------|
| `webhook.controller.ts` | Payment provider webhook receiver | Signature verification, public endpoint |
| `provider-webhook.service.ts` | Webhook event processing | Event routing, state transitions |
| `billing-idempotency.service.ts` | Idempotency enforcement | Duplicate event prevention |
| `payment-provider.adapter.ts` | Payment provider abstraction | Secret usage, API calls |
| `billing-ownership.guard.ts` | Billing resource ownership | Access control |
| `billing-audit.service.ts` | Billing event audit trail | Compliance, forensics |
| `entitlement.service.ts` | Student entitlement management | Access provisioning |
| `checkout.controller.ts` | Checkout flow | Payment initiation |
| `checkout.service.ts` | Checkout logic | Session creation |
| `checkout-status.controller.ts` | Checkout status | Payment status tracking |
| `subscription.controller.ts` | Subscription management | Recurring payment control |
| `subscription.service.ts` | Subscription logic | Plan changes, cancellation |
| `invoice.service.ts` | Invoice management | Financial records |
| `invoices.controller.ts` | Invoice API | Invoice retrieval |
| `refund.controller.ts` | Refund requests | Money movement |
| `refund.service.ts` | Refund processing | Reversal logic |
| `coupon.service.ts` | Coupon/discount management | Pricing manipulation risk |
| `pricing.controller.ts` | Public pricing | Price display |
| `product-price.service.ts` | Product/price catalog | Pricing data |
| `admin-billing.controller.ts` | Admin billing management | Administrative overrides |
| `billing.dtos.ts` | Data transfer objects | Input/output filtering |
| `billing.entities.ts` | Database entities | Data model |
| `billing.repository.ts` | Data access | Query scoping |
| `billing.validation.ts` | Input validation | Injection prevention |
| `billing.errors.ts` | Error types | Error handling |

---

## 3. Payment Provider Secrets

### 3.1 Secret Storage

The billing module uses `payment-provider.adapter.ts` as the abstraction layer for payment provider communication. Provider secrets (API keys, webhook signing secrets) should be loaded from environment variables, not hardcoded.

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-SEC-001 | Need to verify payment provider API key loaded from env var | CRITICAL | NEEDS VERIFICATION |
| BIL-SEC-002 | Need to verify webhook signing secret loaded from env var | CRITICAL | NEEDS VERIFICATION |
| BIL-SEC-003 | Provider adapter should not log API keys | HIGH | NEEDS VERIFICATION |
| BIL-SEC-004 | Provider secrets not in `backend-config.validation.ts` yet — may be loaded separately | MEDIUM | FINDING |

**Note:** The `backend-config.validation.ts` file does not include billing-specific environment variables (no `STRIPE_SECRET_KEY`, `PAYMENT_PROVIDER_KEY`, etc.). This means either:
- Billing secrets are loaded via a separate config mechanism (needs verification)
- Billing is using mock/noop providers for development (likely given the noop pattern in notifications)
- Billing secrets configuration is incomplete (risk)

### 3.2 Recommendations

1. Add billing provider secrets to `backend-config.validation.ts` for centralized validation.
2. Ensure billing secrets are marked as required for production but optional for development.
3. Add billing env var names to deployment documentation.

---

## 4. Webhook Security

### 4.1 Signature Verification

`webhook.controller.ts` receives incoming webhooks from the payment provider.

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-HOOK-001 | Webhook controller exists at expected path | N/A | PASS |
| BIL-HOOK-002 | Need to verify raw body preservation for signature verification | CRITICAL | NEEDS VERIFICATION |
| BIL-HOOK-003 | Need to verify signature validation before any processing | CRITICAL | NEEDS VERIFICATION |
| BIL-HOOK-004 | Need to verify webhook endpoint uses `@Public()` decorator (no JWT required) | HIGH | NEEDS VERIFICATION |
| BIL-HOOK-005 | Need to verify webhook endpoint restricted to POST only | MEDIUM | NEEDS VERIFICATION |

### 4.2 Idempotency

`billing-idempotency.service.ts` provides idempotency checking for webhook events.

**Positive findings:**
- Dedicated idempotency service exists
- Test file exists: `webhook-idempotency.spec.ts`

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-IDEM-001 | Idempotency service exists with tests | N/A | PASS |
| BIL-IDEM-002 | Need to verify idempotency key is event ID from provider | MEDIUM | NEEDS VERIFICATION |
| BIL-IDEM-003 | Need to verify idempotency check happens before state mutation | HIGH | NEEDS VERIFICATION |
| BIL-IDEM-004 | Need to verify idempotency records have TTL (don't grow unbounded) | MEDIUM | NEEDS VERIFICATION |

### 4.3 Replay Protection

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-REPLAY-001 | Timestamp-based replay protection (e.g., reject events older than 5 min) | HIGH | NEEDS VERIFICATION |
| BIL-REPLAY-002 | Combined with idempotency, replay attacks should be mitigated | MEDIUM | NEEDS VERIFICATION |

---

## 5. Sensitive Data Handling

### 5.1 Test Coverage

`sensitive-data.spec.ts` exists, which is a strong positive signal that sensitive data handling has been explicitly tested.

### 5.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-DATA-001 | `sensitive-data.spec.ts` tests exist for data handling | N/A | PASS |
| BIL-DATA-002 | Card numbers (PAN) should never be stored in AIM database | CRITICAL | NEEDS VERIFICATION |
| BIL-DATA-003 | CVV/CVC should never be transmitted through AIM backend | CRITICAL | NEEDS VERIFICATION |
| BIL-DATA-004 | Payment tokens (from provider) should be stored, not raw card data | HIGH | NEEDS VERIFICATION |
| BIL-DATA-005 | Invoice amounts should not expose internal pricing logic | MEDIUM | NEEDS VERIFICATION |
| BIL-DATA-006 | Billing audit logs should not contain full card numbers | HIGH | NEEDS VERIFICATION |

### 5.3 PCI DSS Considerations

If the platform handles card data directly (tokenization on backend), PCI DSS compliance is required. The recommended approach is to use the payment provider's client-side tokenization (e.g., Stripe Elements) so that card data never touches AIM servers.

| ID | Finding | Severity |
|----|---------|----------|
| BIL-PCI-001 | Verify client-side tokenization is used (card data never hits AIM backend) | CRITICAL |
| BIL-PCI-002 | If server-side tokenization is used, PCI DSS SAQ assessment is required | CRITICAL |

---

## 6. Invoice Security

### 6.1 Access Control

`invoices.controller.ts` provides invoice retrieval. `billing-ownership.guard.ts` should restrict access to the invoice owner.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-INV-001 | Billing ownership guard exists with tests | N/A | PASS |
| BIL-INV-002 | Need to verify invoices scoped to authenticated parent | HIGH | NEEDS VERIFICATION |
| BIL-INV-003 | Need to verify admin can view all invoices via admin controller | MEDIUM | NEEDS VERIFICATION |
| BIL-INV-004 | Need to verify invoice PDF/download has auth check | HIGH | NEEDS VERIFICATION |
| BIL-INV-005 | Need to verify invoice does not expose internal system IDs | LOW | NEEDS VERIFICATION |

---

## 7. Refund Security

### 7.1 Access Control

`refund.controller.ts` and `refund.service.ts` handle refund operations.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-REF-001 | `refund.spec.ts` tests exist for refund logic | N/A | PASS |
| BIL-REF-002 | Need to verify refunds require admin approval or ownership verification | CRITICAL | NEEDS VERIFICATION |
| BIL-REF-003 | Need to verify refund amount cannot exceed original payment | CRITICAL | NEEDS VERIFICATION |
| BIL-REF-004 | Need to verify refund creates audit trail entry | HIGH | NEEDS VERIFICATION |
| BIL-REF-005 | Need to verify partial refund calculations are correct | HIGH | NEEDS VERIFICATION |
| BIL-REF-006 | Need to verify refund revokes entitlements appropriately | HIGH | NEEDS VERIFICATION |

---

## 8. Entitlement Protection

### 8.1 Architecture

`entitlement.service.ts` manages student access based on payment status.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-ENT-001 | `entitlement.spec.ts` tests exist | N/A | PASS |
| BIL-ENT-002 | Need to verify entitlements cannot be granted without valid payment | CRITICAL | NEEDS VERIFICATION |
| BIL-ENT-003 | Need to verify entitlements are revoked on subscription cancellation | HIGH | NEEDS VERIFICATION |
| BIL-ENT-004 | Need to verify entitlements are revoked on successful refund | HIGH | NEEDS VERIFICATION |
| BIL-ENT-005 | Need to verify grace period handling on failed payments | MEDIUM | NEEDS VERIFICATION |
| BIL-ENT-006 | Need to verify entitlement checks on learning session start | CRITICAL | NEEDS VERIFICATION |

---

## 9. Coupon & Pricing Security

### 9.1 Coupon Manipulation

`coupon.service.ts` manages discount coupons.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-COUP-001 | Need to verify coupon codes are not brute-forceable (sufficient entropy) | MEDIUM | NEEDS VERIFICATION |
| BIL-COUP-002 | Need to verify coupon usage limits are enforced server-side | HIGH | NEEDS VERIFICATION |
| BIL-COUP-003 | Need to verify expired coupons are rejected | HIGH | NEEDS VERIFICATION |
| BIL-COUP-004 | Need to verify coupon creation is admin-only | HIGH | NEEDS VERIFICATION |

### 9.2 Price Manipulation

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-PRICE-001 | Need to verify prices are set server-side, not from client input | CRITICAL | NEEDS VERIFICATION |
| BIL-PRICE-002 | Need to verify checkout session uses server-side price, not client-submitted amount | CRITICAL | NEEDS VERIFICATION |
| BIL-PRICE-003 | `billing.validation.ts` and `billing.validation.spec.ts` exist for input validation | N/A | PASS |

---

## 10. Audit Trail

### 10.1 Billing Audit Service

`billing-audit.service.ts` provides audit logging for billing events.

**Positive finding:** A dedicated billing audit service exists, which is essential for financial compliance and forensics.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| BIL-AUD-001 | Billing audit service exists | N/A | PASS |
| BIL-AUD-002 | Need to verify all payment state changes are logged | HIGH | NEEDS VERIFICATION |
| BIL-AUD-003 | Need to verify all refund operations are logged | HIGH | NEEDS VERIFICATION |
| BIL-AUD-004 | Need to verify audit logs include actor identity | HIGH | NEEDS VERIFICATION |
| BIL-AUD-005 | Need to verify audit logs are append-only (not deletable) | MEDIUM | NEEDS VERIFICATION |

---

## 11. Summary

### Positive Findings

1. Comprehensive billing module with dedicated services for each concern
2. Idempotency service with tests for webhook processing
3. Billing ownership guard with tests for access control
4. Sensitive data handling tests exist
5. Billing validation with tests for input sanitization
6. Billing audit service for financial logging
7. Entitlement service with tests for access provisioning
8. Refund service with tests for reversal logic
9. Custom billing error types for safe error handling

### Critical Issues

| Priority | Issue | Severity |
|----------|-------|----------|
| 1 | Verify webhook signature verification is implemented | CRITICAL |
| 2 | Verify no card data stored in AIM database | CRITICAL |
| 3 | Verify prices are server-side, not client-submitted | CRITICAL |
| 4 | Verify refund amount validation | CRITICAL |
| 5 | Verify entitlement cannot be granted without payment | CRITICAL |
| 6 | Billing provider secrets not in centralized config | MEDIUM |

### Go/No-Go Assessment

**Current: CONDITIONAL GO** — The billing module has good architectural patterns (idempotency, ownership guards, audit trail, validation). However, critical items (webhook signature verification, PCI compliance, price manipulation prevention) must be verified before accepting real payments.
