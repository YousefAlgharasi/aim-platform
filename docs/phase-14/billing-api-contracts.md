# Billing API Contracts

Phase 14 — Payments and Billing

## Authority Rules

- Backend and provider events are the final authority for all payment lifecycle states.
- Client/UI may only display backend-approved data and initiate checkout through protected APIs.
- No raw card data is stored or transmitted.

---

## Public Endpoints

### GET /billing/pricing

Returns active products, prices, and plans. No authentication required.

**Response:**
```json
{
  "products": [{ "id": "uuid", "name": "string", "productType": "string", "status": "active" }],
  "prices": [{ "id": "uuid", "productId": "uuid", "amount": 1000, "currency": "USD", "billingInterval": "month" }],
  "plans": [{ "id": "uuid", "name": "string", "priceId": "uuid", "planType": "string", "features": {} }]
}
```

### GET /billing/pricing/plans

Returns active plans only.

### GET /billing/pricing/prices?productId={id}

Returns active prices, optionally filtered by product.

---

## Authenticated User Endpoints

All require valid JWT (`Authorization: Bearer <token>`).

### POST /billing/checkout

Create a checkout session.

**Request:**
```json
{
  "priceId": "uuid",
  "successUrl": "https://...",
  "cancelUrl": "https://...",
  "promotionCode": "WELCOME20"
}
```

**Response:** `201 Created` — CheckoutSession object with `checkoutUrl`.

### GET /billing/checkout/:sessionId/status

Get checkout session status for the authenticated user.

**Response:**
```json
{
  "sessionId": "uuid",
  "status": "pending|completed|expired|failed",
  "subscriptionId": "uuid"
}
```

### GET /billing/checkout/recent

Get recent checkout sessions for the authenticated user.

### GET /billing/subscriptions

Get current user's subscriptions and entitlements.

**Response:**
```json
{
  "subscriptions": [{ "id": "uuid", "planId": "uuid", "status": "active", "currentPeriodEnd": "ISO date" }],
  "entitlements": [{ "id": "uuid", "featureKey": "string", "granted": true }]
}
```

### GET /billing/subscriptions/:id

Get subscription by ID (ownership enforced).

### POST /billing/subscriptions/:id/cancel

Cancel subscription at period end (ownership enforced).

### GET /billing/invoices

List invoices for the authenticated user.

### GET /billing/invoices/:id

Get invoice with items (ownership enforced).

### POST /billing/refunds

Request a refund.

**Request:**
```json
{
  "paymentId": "uuid",
  "amount": 500,
  "currency": "USD",
  "reason": "string"
}
```

**Response:** `201 Created` — Refund object with `status: "pending"`.

### GET /billing/refunds/:id

Get refund status.

---

## Webhook Endpoint

### POST /billing/webhooks/provider

Provider webhook endpoint. Requires signature verification.

**Headers:** `stripe-signature` or `x-webhook-signature`
**Body:** Raw provider payload
**Response:** `200 OK` — `{ "received": true }`

Security:
- Signature verification required.
- Idempotent: duplicate events are skipped.
- No sensitive provider payloads logged.

---

## Admin Endpoints

All require admin role + JWT.

### GET /admin/billing/subscriptions/:userId

List subscriptions for any user.

### GET /admin/billing/payments/:userId

List payments for any user.

### GET /admin/billing/invoices/:userId

List invoices for any user.

### GET /admin/billing/refunds/:paymentId

List refunds for a payment.

### GET /admin/billing/provider-events?status={status}

List provider events by processing status.

### GET /admin/billing/audit-logs?entityType=&entityId=&actorId=&limit=

List billing audit logs with optional filters.

---

## Error Response Format

All billing errors use a consistent format:

```json
{
  "statusCode": 400,
  "error": "BILLING_INVALID_PLAN",
  "message": "Invalid or inactive plan"
}
```

Error codes: `BILLING_INVALID_PLAN`, `BILLING_UNAUTHORIZED_ACCESS`, `BILLING_PROVIDER_FAILURE`, `BILLING_DUPLICATE_EVENT`, `BILLING_PAYMENT_FAILED`, `BILLING_REFUND_INVALID`, `BILLING_WEBHOOK_SIGNATURE_INVALID`, `BILLING_CHECKOUT_EXPIRED`.
