import { HttpStatus } from '@nestjs/common';
import {
  BillingError,
  BillingErrorCode,
  InvalidPlanError,
  UnauthorizedBillingAccessError,
  ProviderFailureError,
  DuplicateEventError,
  PaymentFailedError,
  RefundInvalidError,
  WebhookSignatureInvalidError,
  CheckoutExpiredError,
} from './billing.errors';

describe('BillingErrors', () => {
  it('should create BillingError with correct code and status', () => {
    const error = new BillingError(
      BillingErrorCode.INVALID_PLAN,
      'Test message',
      HttpStatus.BAD_REQUEST,
    );
    expect(error.billingCode).toBe(BillingErrorCode.INVALID_PLAN);
    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(error.getResponse()).toEqual({
      statusCode: HttpStatus.BAD_REQUEST,
      error: BillingErrorCode.INVALID_PLAN,
      message: 'Test message',
    });
  });

  it('should create InvalidPlanError', () => {
    const error = new InvalidPlanError();
    expect(error.billingCode).toBe(BillingErrorCode.INVALID_PLAN);
    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should create UnauthorizedBillingAccessError', () => {
    const error = new UnauthorizedBillingAccessError();
    expect(error.billingCode).toBe(BillingErrorCode.UNAUTHORIZED_BILLING_ACCESS);
    expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
  });

  it('should create ProviderFailureError', () => {
    const error = new ProviderFailureError();
    expect(error.billingCode).toBe(BillingErrorCode.PROVIDER_FAILURE);
    expect(error.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
  });

  it('should create DuplicateEventError with event ID', () => {
    const error = new DuplicateEventError('evt_123');
    expect(error.billingCode).toBe(BillingErrorCode.DUPLICATE_EVENT);
    expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
    const response = error.getResponse() as any;
    expect(response.message).toContain('evt_123');
  });

  it('should create PaymentFailedError', () => {
    const error = new PaymentFailedError();
    expect(error.billingCode).toBe(BillingErrorCode.PAYMENT_FAILED);
    expect(error.getStatus()).toBe(HttpStatus.PAYMENT_REQUIRED);
  });

  it('should create RefundInvalidError', () => {
    const error = new RefundInvalidError();
    expect(error.billingCode).toBe(BillingErrorCode.REFUND_INVALID);
    expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should create WebhookSignatureInvalidError', () => {
    const error = new WebhookSignatureInvalidError();
    expect(error.billingCode).toBe(BillingErrorCode.WEBHOOK_SIGNATURE_INVALID);
    expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should create CheckoutExpiredError', () => {
    const error = new CheckoutExpiredError();
    expect(error.billingCode).toBe(BillingErrorCode.CHECKOUT_EXPIRED);
    expect(error.getStatus()).toBe(HttpStatus.GONE);
  });

  it('should allow custom messages', () => {
    const error = new InvalidPlanError('Custom plan error');
    const response = error.getResponse() as any;
    expect(response.message).toBe('Custom plan error');
  });
});
