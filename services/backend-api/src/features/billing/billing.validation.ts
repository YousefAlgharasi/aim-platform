import { BadRequestException } from '@nestjs/common';

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'KWD', 'BHD', 'QAR', 'OMR'];

const VALID_BILLING_INTERVALS = ['month', 'year', 'one_time'];

const VALID_PRODUCT_TYPES = ['course', 'subscription', 'feature', 'addon'];

const VALID_PLAN_TYPES = ['free', 'basic', 'premium', 'enterprise'];

const VALID_SUBSCRIPTION_STATUSES = [
  'active', 'past_due', 'canceled', 'expired', 'trialing', 'paused', 'incomplete',
];

const VALID_PAYMENT_STATUSES = [
  'pending', 'succeeded', 'failed', 'refunded', 'partially_refunded',
];

const VALID_INVOICE_STATUSES = ['draft', 'open', 'paid', 'void', 'uncollectible'];

const VALID_REFUND_STATUSES = ['pending', 'succeeded', 'failed', 'canceled', 'denied'];

export function validateCurrency(currency: string): void {
  if (!currency || !/^[A-Z]{3}$/.test(currency)) {
    throw new BadRequestException('Currency must be a valid 3-letter ISO 4217 code');
  }
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new BadRequestException(`Unsupported currency: ${currency}`);
  }
}

export function validateAmount(amount: number): void {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new BadRequestException('Amount must be a non-negative integer (smallest currency unit)');
  }
}

export function validateRefundAmount(refundAmount: number, paymentAmount: number): void {
  validateAmount(refundAmount);
  if (refundAmount <= 0) {
    throw new BadRequestException('Refund amount must be greater than zero');
  }
  if (refundAmount > paymentAmount) {
    throw new BadRequestException('Refund amount cannot exceed payment amount');
  }
}

export function validateUUID(value: string, fieldName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!value || !uuidRegex.test(value)) {
    throw new BadRequestException(`${fieldName} must be a valid UUID`);
  }
}

export function validateBillingInterval(interval: string): void {
  if (!VALID_BILLING_INTERVALS.includes(interval)) {
    throw new BadRequestException(`Invalid billing interval: ${interval}`);
  }
}

export function validateProductType(type: string): void {
  if (!VALID_PRODUCT_TYPES.includes(type)) {
    throw new BadRequestException(`Invalid product type: ${type}`);
  }
}

export function validatePlanType(type: string): void {
  if (!VALID_PLAN_TYPES.includes(type)) {
    throw new BadRequestException(`Invalid plan type: ${type}`);
  }
}

export function validateSubscriptionStatus(status: string): void {
  if (!VALID_SUBSCRIPTION_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid subscription status: ${status}`);
  }
}

export function validatePaymentStatus(status: string): void {
  if (!VALID_PAYMENT_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid payment status: ${status}`);
  }
}

export function validateInvoiceStatus(status: string): void {
  if (!VALID_INVOICE_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid invoice status: ${status}`);
  }
}

export function validateRefundStatus(status: string): void {
  if (!VALID_REFUND_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid refund status: ${status}`);
  }
}

export function validateProviderEventId(eventId: string): void {
  if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
    throw new BadRequestException('Provider event ID is required');
  }
}

export function validatePromotionCode(code: string): void {
  if (!code || typeof code !== 'string' || code.trim() === '') {
    throw new BadRequestException('Promotion code is required');
  }
  if (code.length > 50) {
    throw new BadRequestException('Promotion code must be 50 characters or less');
  }
  if (!/^[A-Z0-9_-]+$/i.test(code)) {
    throw new BadRequestException('Promotion code contains invalid characters');
  }
}
