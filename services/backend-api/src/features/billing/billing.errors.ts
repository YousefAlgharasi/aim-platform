import { HttpException, HttpStatus } from '@nestjs/common';

export enum BillingErrorCode {
  INVALID_PLAN = 'BILLING_INVALID_PLAN',
  PLAN_NOT_FOUND = 'BILLING_PLAN_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'BILLING_PRODUCT_NOT_FOUND',
  PRICE_NOT_FOUND = 'BILLING_PRICE_NOT_FOUND',
  SUBSCRIPTION_NOT_FOUND = 'BILLING_SUBSCRIPTION_NOT_FOUND',
  PAYMENT_NOT_FOUND = 'BILLING_PAYMENT_NOT_FOUND',
  INVOICE_NOT_FOUND = 'BILLING_INVOICE_NOT_FOUND',
  REFUND_NOT_FOUND = 'BILLING_REFUND_NOT_FOUND',
  CHECKOUT_NOT_FOUND = 'BILLING_CHECKOUT_NOT_FOUND',
  UNAUTHORIZED_BILLING_ACCESS = 'BILLING_UNAUTHORIZED_ACCESS',
  PROVIDER_FAILURE = 'BILLING_PROVIDER_FAILURE',
  DUPLICATE_EVENT = 'BILLING_DUPLICATE_EVENT',
  PAYMENT_FAILED = 'BILLING_PAYMENT_FAILED',
  REFUND_INVALID = 'BILLING_REFUND_INVALID',
  REFUND_EXCEEDS_AMOUNT = 'BILLING_REFUND_EXCEEDS_AMOUNT',
  COUPON_INVALID = 'BILLING_COUPON_INVALID',
  COUPON_EXPIRED = 'BILLING_COUPON_EXPIRED',
  PROMOTION_CODE_INVALID = 'BILLING_PROMOTION_CODE_INVALID',
  WEBHOOK_SIGNATURE_INVALID = 'BILLING_WEBHOOK_SIGNATURE_INVALID',
  IDEMPOTENCY_CONFLICT = 'BILLING_IDEMPOTENCY_CONFLICT',
  INVALID_STATUS_TRANSITION = 'BILLING_INVALID_STATUS_TRANSITION',
  SUBSCRIPTION_ALREADY_ACTIVE = 'BILLING_SUBSCRIPTION_ALREADY_ACTIVE',
  CHECKOUT_EXPIRED = 'BILLING_CHECKOUT_EXPIRED',
}

export class BillingError extends HttpException {
  public readonly billingCode: BillingErrorCode;

  constructor(
    code: BillingErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode,
        error: code,
        message,
      },
      statusCode,
    );
    this.billingCode = code;
  }
}

export class InvalidPlanError extends BillingError {
  constructor(message = 'Invalid or inactive plan') {
    super(BillingErrorCode.INVALID_PLAN, message, HttpStatus.BAD_REQUEST);
  }
}

export class UnauthorizedBillingAccessError extends BillingError {
  constructor(message = 'Not authorized to access this billing resource') {
    super(BillingErrorCode.UNAUTHORIZED_BILLING_ACCESS, message, HttpStatus.FORBIDDEN);
  }
}

export class ProviderFailureError extends BillingError {
  constructor(message = 'Payment provider operation failed') {
    super(BillingErrorCode.PROVIDER_FAILURE, message, HttpStatus.BAD_GATEWAY);
  }
}

export class DuplicateEventError extends BillingError {
  constructor(eventId: string) {
    super(
      BillingErrorCode.DUPLICATE_EVENT,
      `Duplicate event: ${eventId}`,
      HttpStatus.CONFLICT,
    );
  }
}

export class PaymentFailedError extends BillingError {
  constructor(message = 'Payment processing failed') {
    super(BillingErrorCode.PAYMENT_FAILED, message, HttpStatus.PAYMENT_REQUIRED);
  }
}

export class RefundInvalidError extends BillingError {
  constructor(message = 'Refund request is not valid') {
    super(BillingErrorCode.REFUND_INVALID, message, HttpStatus.BAD_REQUEST);
  }
}

export class WebhookSignatureInvalidError extends BillingError {
  constructor() {
    super(
      BillingErrorCode.WEBHOOK_SIGNATURE_INVALID,
      'Invalid webhook signature',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class CheckoutExpiredError extends BillingError {
  constructor() {
    super(
      BillingErrorCode.CHECKOUT_EXPIRED,
      'Checkout session has expired',
      HttpStatus.GONE,
    );
  }
}
