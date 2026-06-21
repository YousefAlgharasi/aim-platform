# Phase 14 — Admin Billing Readiness Notes

**Date:** 2026-06-20
**Author:** GHOST3030
**Scope:** Document future payment/billing admin needs for Phase 14

## Purpose

Define billing and payment management capabilities needed for the admin
dashboard in Phase 14 without implementing them in Phase 11. This
prevents payment scope creep while documenting requirements.

## Billing Data Identified

### 1. Subscription Management

| Data | Description | Sensitivity |
|------|-------------|------------|
| Subscription plans | Plan definitions, pricing tiers | Low |
| Student subscriptions | Active/cancelled subscriptions per student | Medium |
| Billing cycles | Renewal dates, billing frequency | Medium |
| Plan changes | Upgrade/downgrade history | Low |

### 2. Payment Records

| Data | Description | Sensitivity |
|------|-------------|------------|
| Payment history | Transaction records | High — financial PII |
| Payment status | Success/failed/pending/refunded | Medium |
| Payment method | Card type (last 4 digits only) | High — must be masked |
| Invoices | Generated invoice records | Medium |

### 3. Revenue Reporting

| Data | Description | Sensitivity |
|------|-------------|------------|
| Revenue summaries | Aggregate revenue by period | Medium |
| Refund totals | Aggregate refund amounts | Medium |
| Churn metrics | Cancellation rates | Low |
| Plan distribution | Students per plan tier | Low |

## Admin Management Capabilities Needed

### Subscription Overview
- View all active subscriptions with status
- Filter by plan, status, date range
- View individual student subscription details
- No client-side subscription modification

### Payment History
- View payment transactions with filters
- Search by student, date range, status
- View payment detail (masked card info only)
- No client-side payment processing

### Refund Management
- View refund requests and history
- Initiate refund via backend API (admin action)
- Refund status tracking
- Audit trail for all refund actions

### Revenue Dashboard
- Summary cards: total revenue, refunds, net revenue
- Period comparison (month over month)
- Plan distribution breakdown
- All metrics backend-computed

## API Endpoints Needed (Phase 14)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/subscriptions` | GET | List subscriptions with filters |
| `/admin/subscriptions/:id` | GET | Subscription detail |
| `/admin/payments` | GET | List payment transactions |
| `/admin/payments/:id` | GET | Payment detail |
| `/admin/refunds` | GET | List refunds |
| `/admin/refunds` | POST | Initiate refund (admin action) |
| `/admin/billing/summary` | GET | Revenue summary metrics |

## Safety Restrictions

### Must Do
1. **Payment provider integration:** All payment processing must go through
   a PCI-compliant payment provider (e.g., Stripe) — never handle raw card data
2. **Masked display:** Card numbers must show last 4 digits only, masked by backend
3. **Role-scoped access:** Only `project_owner` role may initiate refunds
4. **Audit logging:** Every billing action (refund, plan change) must be audit-logged
5. **Backend authority:** All financial calculations (totals, taxes, prorations)
   must be backend-computed

### Must Not Do
1. **No client-side payment processing** — never collect or transmit card details
2. **No raw financial data in exports** — mask sensitive fields
3. **No client-side price calculation** — backend computes all amounts
4. **No direct database queries** — use backend API layer only
5. **No payment secrets** — API keys, webhook secrets, provider tokens must
   never appear in the admin UI code

## Payment Provider Considerations

| Provider | Notes |
|----------|-------|
| Stripe | Recommended — PCI-compliant, good API, dashboard |
| PayPal | Alternative — wider regional support |
| Local providers | May be needed for specific regions |

## Phase 11 Status

**No billing or payment system is implemented in Phase 11.** This document
defines requirements for Phase 14 implementation. The admin dashboard has
no billing UI, payment API clients, or financial data display.

## Dependencies for Phase 14

- Payment provider selection and integration
- Backend billing service and database schema
- PCI compliance review
- Subscription plan definitions from product owner
- Tax/VAT handling requirements by region
- Refund policy definition
