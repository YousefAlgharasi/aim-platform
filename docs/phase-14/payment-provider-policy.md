# Phase 14 — Payment Provider Policy

## Purpose

Define provider abstraction, supported payment methods, provider event handling, and fallback boundaries to avoid vendor lock-in.

## Provider Abstraction

AIM uses a provider abstraction layer so billing logic does not depend on a specific provider's API:

```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────┐
│  Backend     │────▶│  PaymentProvider     │────▶│  Stripe      │
│  Services    │     │  Interface           │     │  Adapter     │
└─────────────┘     └──────────────────────┘     └──────────────┘
                              │
                              ├──▶ Future Provider Adapter
                              └──▶ Test/Mock Adapter
```

### PaymentProvider Interface

The provider interface defines operations that any payment provider must support:

- **Products:** Create, update, deactivate products
- **Prices:** Create, update, deactivate prices
- **Checkout:** Create checkout session, retrieve session status
- **Subscriptions:** Create, cancel, update subscriptions
- **Payments:** Retrieve payment status
- **Invoices:** Retrieve invoice data
- **Refunds:** Initiate refund
- **Webhooks:** Verify signature, parse event
- **Customers:** Create or retrieve customer

### Provider Configuration

Provider selection and credentials are configured through environment variables:

```
PAYMENT_PROVIDER=stripe              # Provider name
STRIPE_SECRET_KEY=sk_...             # Provider-specific secret (env only)
STRIPE_PUBLISHABLE_KEY=pk_...        # Client-safe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...      # Webhook signing secret (env only)
```

No provider secrets are hardcoded or committed.

## Supported Payment Methods

### Initial Support (Stripe)

| Method | Type | Notes |
|--------|------|-------|
| Credit/debit card | card | Via Stripe Checkout (hosted) |
| Apple Pay | wallet | Via Stripe Checkout |
| Google Pay | wallet | Via Stripe Checkout |

### Future Consideration

| Method | Type | Notes |
|--------|------|-------|
| Bank transfer | bank_transfer | Provider-dependent |
| Local payment methods | local | Region-specific |

AIM stores only the safe payment method type label (e.g., "card", "wallet"), never raw payment credentials.

## Provider Event Handling

### Webhook Flow

```
Provider ──▶ POST /api/billing/webhooks/{provider}
                │
                ├── 1. Verify signature
                ├── 2. Check idempotency (skip if already processed)
                ├── 3. Parse event type
                ├── 4. Route to handler
                ├── 5. Update local records
                ├── 6. Log safe audit entry
                └── 7. Return 200 OK
```

### Supported Event Types

| Provider Event | AIM Action |
|---------------|------------|
| checkout.session.completed | Update checkout session, create payment |
| payment_intent.succeeded | Update payment status |
| payment_intent.payment_failed | Update payment status |
| customer.subscription.created | Create/update subscription |
| customer.subscription.updated | Update subscription status |
| customer.subscription.deleted | Cancel subscription, revoke entitlements |
| invoice.paid | Update invoice status |
| invoice.payment_failed | Update invoice status |
| charge.refunded | Update payment and refund status |

### Signature Verification

Every webhook request must be verified before processing:

1. Extract signature header from request
2. Compute expected signature using webhook signing secret and request body
3. Compare signatures using constant-time comparison
4. Reject unverified requests with 400 status
5. Never process events with invalid or missing signatures

### Idempotency

Every provider event is processed at most once:

1. Extract provider event ID from payload
2. Check if event ID exists in `payment_provider_events` table
3. If exists and processed, return 200 (skip)
4. If new, insert with "pending" status
5. Process event
6. Update status to "processed" or "failed"

## Fallback Boundaries

### What AIM Controls

- Local billing records (products, prices, plans, subscriptions, payments, invoices)
- Entitlement grants and revocations
- Audit logging
- User-facing billing UI
- Webhook event ingestion and processing

### What the Provider Controls

- Card tokenization and storage
- Payment processing and settlement
- Hosted checkout UI
- Invoice PDF generation
- Subscription billing cycle execution
- Refund processing with card networks
- Webhook event delivery

### Provider Unavailability

If the provider is temporarily unavailable:

- Checkout session creation fails gracefully with user-friendly error
- Existing subscriptions and entitlements remain active (based on local state)
- Webhook events are retried by the provider
- No entitlements are granted or revoked without provider confirmation
- Backend logs provider unavailability for monitoring

### Provider Migration

The abstraction layer enables future provider migration:

1. Implement new provider adapter conforming to PaymentProvider interface
2. Run parallel testing with new provider
3. Migrate customers and subscriptions
4. Switch PAYMENT_PROVIDER environment variable
5. Deprecate old adapter

No billing service code changes are needed — only the adapter implementation.
