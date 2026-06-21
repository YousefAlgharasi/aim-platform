# Phase 14 — Billing API Contract Map

## Purpose

Document backend APIs required by student, parent, and admin billing flows. All billing endpoints require authentication and enforce ownership/role guards.

## Public Billing APIs (Authenticated)

### Products and Pricing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/billing/products | Authenticated | List active products |
| GET | /api/billing/products/:id | Authenticated | Get product details |
| GET | /api/billing/prices | Authenticated | List active prices |
| GET | /api/billing/plans | Authenticated | List active plans with features |
| GET | /api/billing/plans/:id | Authenticated | Get plan details |

**Notes:** Returns backend-approved products/prices only. No sensitive provider data exposed.

### Checkout

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/billing/checkout | Authenticated + Owner | Create checkout session |
| GET | /api/billing/checkout/:id | Authenticated + Owner | Get checkout session status |

**Request (POST):**
```json
{
  "priceId": "uuid",
  "successUrl": "https://...",
  "cancelUrl": "https://...",
  "promotionCode": "SAVE10"
}
```

**Response:**
```json
{
  "id": "uuid",
  "checkoutUrl": "https://provider-checkout-url",
  "status": "pending",
  "expiresAt": "2026-01-01T00:00:00Z"
}
```

**Notes:** Backend validates price ID, creates provider checkout session, returns provider URL. Client redirects to checkout URL.

### Subscriptions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/billing/subscriptions | Authenticated + Owner | List user subscriptions |
| GET | /api/billing/subscriptions/:id | Authenticated + Owner | Get subscription details |
| POST | /api/billing/subscriptions/:id/cancel | Authenticated + Owner | Request subscription cancellation |

**Notes:** Status is backend-approved. Cancellation sets `cancel_at_period_end = true`. Backend processes via provider.

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/billing/payments | Authenticated + Owner | List user payments |
| GET | /api/billing/payments/:id | Authenticated + Owner | Get payment details |

**Notes:** Returns backend-approved payment status. No raw card data.

### Invoices

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/billing/invoices | Authenticated + Owner | List user invoices |
| GET | /api/billing/invoices/:id | Authenticated + Owner | Get invoice details |

**Notes:** Returns backend-approved invoice status and totals.

### Entitlements

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/billing/entitlements | Authenticated + Owner | List user entitlements |
| GET | /api/billing/entitlements/:featureKey | Authenticated + Owner | Check specific entitlement |

**Notes:** Returns backend-derived entitlement state.

### Refunds

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/billing/refunds | Authenticated + Owner | Submit refund request |
| GET | /api/billing/refunds | Authenticated + Owner | List user refund requests |
| GET | /api/billing/refunds/:id | Authenticated + Owner | Get refund status |

**Request (POST):**
```json
{
  "paymentId": "uuid",
  "reason": "Reason for refund request"
}
```

**Notes:** Refund request goes through backend review. Not automatically approved.

## Parent Billing APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/billing/parent/children | Authenticated + Parent | List linked children billing summary |
| GET | /api/billing/parent/children/:childId/subscriptions | Authenticated + Parent + Link | Child subscriptions |
| GET | /api/billing/parent/children/:childId/payments | Authenticated + Parent + Link | Child payments |
| GET | /api/billing/parent/children/:childId/invoices | Authenticated + Parent + Link | Child invoices |
| GET | /api/billing/parent/children/:childId/entitlements | Authenticated + Parent + Link | Child entitlements |

**Notes:** Parent must have verified link to child. Same data as student APIs but scoped by parent-child relationship.

## Admin Billing APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/billing/admin/products | Admin | List all products |
| POST | /api/billing/admin/products | Admin | Create product |
| PATCH | /api/billing/admin/products/:id | Admin | Update product |
| GET | /api/billing/admin/prices | Admin | List all prices |
| POST | /api/billing/admin/prices | Admin | Create price |
| GET | /api/billing/admin/plans | Admin | List all plans |
| POST | /api/billing/admin/plans | Admin | Create plan |
| PATCH | /api/billing/admin/plans/:id | Admin | Update plan |
| GET | /api/billing/admin/subscriptions | Admin | List all subscriptions |
| GET | /api/billing/admin/payments | Admin | List all payments |
| GET | /api/billing/admin/invoices | Admin | List all invoices |
| GET | /api/billing/admin/refunds | Admin | List all refund requests |
| POST | /api/billing/admin/refunds/:id/approve | Admin | Approve refund |
| POST | /api/billing/admin/refunds/:id/deny | Admin | Deny refund |
| GET | /api/billing/admin/coupons | Admin | List coupons |
| POST | /api/billing/admin/coupons | Admin | Create coupon |
| GET | /api/billing/admin/audit-logs | Admin | View billing audit logs |

**Notes:** Admin UI is read-only except for product/price/plan management and controlled refund approval. No provider secrets exposed.

## Webhook Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/billing/webhooks/stripe | Signature verification | Stripe webhook receiver |

**Notes:** Webhook endpoints verify provider signature. No user auth required. Idempotent processing.

## Common Response Patterns

### Pagination
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Invalid price ID",
  "error": "Bad Request"
}
```

### Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized / not owner |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Internal error (no sensitive details) |
