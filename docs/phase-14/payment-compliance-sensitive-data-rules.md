# Phase 14 — Payment Compliance and Sensitive Data Rules

## Purpose

Document rules for protecting payment data, preventing raw card storage, excluding provider secrets from clients, and restricting sensitive payload logging.

## No Raw Card Data Storage

AIM Platform does NOT store, process, or transmit raw card data:

- **Card numbers (PAN):** Never stored in any AIM database, log, or file
- **CVV/CVC:** Never stored, logged, or transmitted through AIM systems
- **Card expiry dates:** Never stored in AIM databases
- **Full magnetic stripe data:** Never captured or stored
- **PIN data:** Never captured or stored

Card data is handled exclusively by the payment provider (Stripe) through their hosted checkout and tokenization. AIM stores only:

- Safe payment method type labels (e.g., "card", "bank_transfer")
- Last four digits of card (if provided by provider in safe metadata)
- Card brand (if provided by provider in safe metadata)
- Provider token/payment method IDs (opaque references, not card data)

## Provider Secrets Protection

The following must NEVER appear in:

- Client-side code (frontend, mobile apps)
- Version control (git commits, branches)
- Client-facing API responses
- Browser-accessible configuration
- Log output

### Protected Secrets

| Secret | Storage Location | Access |
|--------|-----------------|--------|
| Provider secret API key | Environment variable only | Backend server only |
| Webhook signing secret | Environment variable only | Backend webhook handler only |
| Service-role keys | Environment variable only | Backend server only |
| Database credentials | Environment variable only | Backend server only |
| Production tokens | Environment variable only | Backend server only |

### Environment Variable Convention

```
STRIPE_SECRET_KEY=sk_...          # Never committed
STRIPE_WEBHOOK_SECRET=whsec_...   # Never committed
STRIPE_PUBLISHABLE_KEY=pk_...     # Safe for client (publishable only)
```

Only publishable keys may be used in client-side code.

## Logging Restrictions

### Never Log

- Raw card numbers, CVV/CVC, or expiry dates
- Provider secret keys or webhook signing secrets
- Service-role keys or database credentials
- Full raw provider webhook payloads containing sensitive data
- Payment credentials or tokens that could be replayed
- Customer bank account numbers

### Safe to Log

- Provider event IDs (e.g., `evt_xxx`)
- Event types (e.g., `payment_intent.succeeded`)
- Processing status (pending, processed, failed)
- Non-sensitive entity IDs (payment ID, subscription ID)
- Timestamps and action types
- Error messages (without sensitive context)
- Safe billing audit metadata

### Log Format

```
[billing] event_id=evt_xxx type=payment_intent.succeeded status=processed
[billing] subscription_id=sub_xxx action=canceled
[billing] refund_id=ref_xxx status=succeeded amount=1000 currency=USD
```

## PCI Compliance Boundaries

AIM Platform operates under **PCI DSS SAQ-A** requirements by delegating all card processing to the payment provider:

- AIM never handles raw card data
- Payment forms are provider-hosted (Stripe Checkout / Elements)
- AIM receives only safe tokens and event notifications
- AIM stores only non-sensitive payment metadata

### AIM Responsibilities

- Protect provider API keys as secrets
- Use HTTPS for all API communication
- Verify webhook signatures
- Do not log sensitive payment data
- Do not store raw card data
- Maintain access controls on billing endpoints
- Audit billing actions

### Provider Responsibilities

- Card data tokenization
- PCI DSS compliant card processing
- Secure checkout UI hosting
- Webhook event delivery with signatures
- Refund processing
- Invoice generation

## Webhook Security Rules

1. Every webhook endpoint verifies the provider signature before processing
2. Unverified webhook payloads are rejected with 400 status
3. Webhook endpoints do not expose processing details in error responses
4. Webhook signing secrets are stored in environment variables only
5. Raw webhook payloads are not logged (only safe summaries)
6. Webhook processing is idempotent (duplicate events are safely handled)

## Data Retention

- Payment records are retained for compliance and audit purposes
- Audit logs are append-only and never deleted
- Provider event records track processing status for idempotency
- Expired checkout sessions are retained with expired status
- Canceled subscriptions retain history for audit trail

## Access Control

- All billing data access requires authentication
- Users can only view their own billing data
- Parents can view billing data for linked children
- Admins can view all billing data (read-only unless explicit refund authority)
- No anonymous access to billing endpoints
- No public billing data endpoints
