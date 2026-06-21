# Email Provider Readiness — Phase 13

## Status
Email channel is defined in the notification channel policy but actual provider integration is deferred. A no-op adapter is in place so the delivery worker can process email-channel events without crashing.

## Interface
`EmailProviderAdapter` in `services/backend-api/src/features/notifications/email-provider-adapter.interface.ts`

## Integration Steps (Future)
1. Choose an email provider (e.g. AWS SES, SendGrid, Resend).
2. Implement `EmailProviderAdapter` using provider SDK.
3. Store provider credentials in environment variables — never commit them.
4. Register the real adapter in the notifications module, replacing `NoopEmailProviderAdapter`.
5. Update notification templates with email-specific HTML layouts.

## Security Rules
- Provider API keys must come from environment variables only.
- Keys must never appear in code, logs, migration files, or notification payloads.
- Email content must follow the same privacy rules as push/in-app: no secrets, no raw AIM outputs, no sensitive child data.
