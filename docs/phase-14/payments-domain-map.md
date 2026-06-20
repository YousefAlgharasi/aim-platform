# Phase 14 — Payments Domain Map

## Overview

This document defines the billing domain entities, their relationships, ownership rules, and lifecycle states.

## Entities

### billing_products

Represents a billable product or feature offered by AIM.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| description | TEXT | Product description |
| product_type | TEXT | Type: course, subscription, feature, addon |
| provider_product_id | TEXT | External provider product ID |
| status | TEXT | active, inactive, archived |
| metadata | JSONB | Safe non-sensitive metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend/admin only. Clients read active products via backend API.

### billing_prices

Represents a price record for a product.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | FK to billing_products |
| amount | INTEGER | Price in smallest currency unit (e.g., cents) |
| currency | TEXT | ISO 4217 currency code |
| billing_interval | TEXT | month, year, one_time |
| provider_price_id | TEXT | External provider price ID |
| status | TEXT | active, inactive, archived |
| metadata | JSONB | Safe non-sensitive metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend/admin only. Clients never submit prices.

### billing_plans

Represents a subscription plan with included features and limits.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Plan name |
| description | TEXT | Plan description |
| price_id | UUID | FK to billing_prices |
| features | JSONB | Included features and limits |
| plan_type | TEXT | free, basic, premium, enterprise |
| status | TEXT | active, inactive, archived |
| metadata | JSONB | Safe metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend/admin only.

### billing_entitlements

Represents a user's access rights derived from subscriptions or payments.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| plan_id | UUID | FK to billing_plans (nullable) |
| subscription_id | UUID | FK to subscriptions (nullable) |
| feature_key | TEXT | Feature identifier |
| granted | BOOLEAN | Whether access is granted |
| usage_limit | INTEGER | Usage limit (nullable) |
| usage_count | INTEGER | Current usage count |
| expires_at | TIMESTAMPTZ | Expiration (nullable) |
| source | TEXT | subscription, payment, admin_grant, promotion |
| status | TEXT | active, expired, revoked |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend only. Clients read entitlement state via backend API.

### subscriptions

Represents a user's subscription lifecycle.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| plan_id | UUID | FK to billing_plans |
| provider_subscription_id | TEXT | External provider subscription ID |
| status | TEXT | active, past_due, canceled, expired, trialing, paused |
| current_period_start | TIMESTAMPTZ | Current billing period start |
| current_period_end | TIMESTAMPTZ | Current billing period end |
| cancel_at_period_end | BOOLEAN | Whether to cancel at period end |
| canceled_at | TIMESTAMPTZ | When canceled (nullable) |
| trial_start | TIMESTAMPTZ | Trial start (nullable) |
| trial_end | TIMESTAMPTZ | Trial end (nullable) |
| metadata | JSONB | Safe metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend and provider events only.

### checkout_sessions

Represents a checkout session for purchasing a product/plan.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| price_id | UUID | FK to billing_prices |
| provider_session_id | TEXT | External provider session ID |
| status | TEXT | pending, completed, expired, failed |
| checkout_url | TEXT | Provider checkout URL |
| success_url | TEXT | Redirect URL on success |
| cancel_url | TEXT | Redirect URL on cancel |
| expires_at | TIMESTAMPTZ | Session expiry |
| metadata | JSONB | Safe metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend creates sessions via provider API. Status updated by provider events.

### payments

Represents a payment record.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| checkout_session_id | UUID | FK to checkout_sessions (nullable) |
| subscription_id | UUID | FK to subscriptions (nullable) |
| amount | INTEGER | Amount in smallest currency unit |
| currency | TEXT | ISO 4217 currency code |
| status | TEXT | pending, succeeded, failed, refunded, partially_refunded |
| provider_payment_id | TEXT | External provider payment ID |
| payment_method_type | TEXT | card, bank_transfer, wallet (safe label only) |
| metadata | JSONB | Safe non-sensitive metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend and provider events only. No raw card data stored.

### invoices

Represents a billing invoice.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| subscription_id | UUID | FK to subscriptions (nullable) |
| provider_invoice_id | TEXT | External provider invoice ID |
| status | TEXT | draft, open, paid, void, uncollectible |
| subtotal | INTEGER | Subtotal in smallest currency unit |
| tax | INTEGER | Tax amount |
| total | INTEGER | Total amount |
| currency | TEXT | ISO 4217 currency code |
| invoice_url | TEXT | Provider-hosted invoice URL |
| period_start | TIMESTAMPTZ | Billing period start |
| period_end | TIMESTAMPTZ | Billing period end |
| due_date | TIMESTAMPTZ | Due date (nullable) |
| paid_at | TIMESTAMPTZ | Payment date (nullable) |
| metadata | JSONB | Safe metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend and provider events only.

### invoice_items

Represents individual line items on an invoice.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| invoice_id | UUID | FK to invoices |
| price_id | UUID | FK to billing_prices (nullable) |
| description | TEXT | Line item description |
| quantity | INTEGER | Quantity |
| unit_amount | INTEGER | Unit price in smallest currency unit |
| amount | INTEGER | Total line item amount |
| currency | TEXT | ISO 4217 currency code |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Authority:** Backend only.

### refunds

Represents a refund record.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| payment_id | UUID | FK to payments |
| amount | INTEGER | Refund amount in smallest currency unit |
| currency | TEXT | ISO 4217 currency code |
| reason | TEXT | Refund reason |
| status | TEXT | pending, succeeded, failed, canceled |
| provider_refund_id | TEXT | External provider refund ID |
| requested_by | UUID | FK to users (who requested) |
| approved_by | UUID | FK to users (admin who approved, nullable) |
| metadata | JSONB | Safe audit metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend and provider events only.

### coupons

Represents a discount coupon.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Coupon name |
| discount_type | TEXT | percentage, fixed_amount |
| discount_value | INTEGER | Discount value |
| currency | TEXT | Currency for fixed_amount (nullable) |
| max_redemptions | INTEGER | Max total uses (nullable) |
| times_redeemed | INTEGER | Current redemption count |
| valid_from | TIMESTAMPTZ | Start date |
| valid_until | TIMESTAMPTZ | End date (nullable) |
| status | TEXT | active, expired, disabled |
| metadata | JSONB | Safe metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend/admin only.

### promotion_codes

Represents a redeemable promotion code linked to a coupon.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| coupon_id | UUID | FK to coupons |
| code | TEXT | Unique promotion code |
| max_redemptions | INTEGER | Max uses for this code (nullable) |
| times_redeemed | INTEGER | Current redemption count |
| eligible_user_ids | UUID[] | Restricted user IDs (nullable) |
| status | TEXT | active, expired, disabled |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Authority:** Backend/admin only.

### payment_provider_events

Represents ingested provider webhook events for idempotent processing.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| provider_event_id | TEXT | External provider event ID (unique) |
| event_type | TEXT | Provider event type |
| provider | TEXT | Provider name (e.g., stripe) |
| processing_status | TEXT | pending, processed, failed, skipped |
| idempotency_key | TEXT | Idempotency key (unique) |
| payload_summary | JSONB | Safe non-sensitive event summary |
| error_message | TEXT | Processing error (nullable) |
| processed_at | TIMESTAMPTZ | Processing timestamp (nullable) |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Authority:** Backend webhook handler only. Verified by signature before processing.

### billing_audit_logs

Represents audit trail for billing actions.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| action | TEXT | Action type |
| entity_type | TEXT | Target entity type |
| entity_id | UUID | Target entity ID |
| actor_id | UUID | User who performed action (nullable) |
| actor_type | TEXT | user, system, provider |
| changes | JSONB | Safe change summary |
| metadata | JSONB | Safe audit metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Authority:** System-generated. Append-only.

## Entity Relationships

```
billing_products 1──N billing_prices
billing_prices   1──N billing_plans
billing_plans    1──N subscriptions
billing_plans    1──N billing_entitlements
users            1──N subscriptions
users            1──N billing_entitlements
users            1──N checkout_sessions
users            1──N payments
users            1──N invoices
subscriptions    1──N payments
subscriptions    1──N invoices
subscriptions    1──N billing_entitlements
checkout_sessions 1──N payments
invoices         1──N invoice_items
payments         1──N refunds
coupons          1──N promotion_codes
```
