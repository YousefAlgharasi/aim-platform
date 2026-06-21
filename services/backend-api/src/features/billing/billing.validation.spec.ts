import { BadRequestException } from '@nestjs/common';
import {
  validateCurrency,
  validateAmount,
  validateRefundAmount,
  validateUUID,
  validateBillingInterval,
  validateProductType,
  validatePlanType,
  validateSubscriptionStatus,
  validatePaymentStatus,
  validateInvoiceStatus,
  validateRefundStatus,
  validateProviderEventId,
  validatePromotionCode,
} from './billing.validation';

describe('Billing Validation', () => {
  describe('validateCurrency', () => {
    it('accepts valid currencies', () => {
      expect(() => validateCurrency('USD')).not.toThrow();
      expect(() => validateCurrency('SAR')).not.toThrow();
    });

    it('rejects invalid currencies', () => {
      expect(() => validateCurrency('usd')).toThrow(BadRequestException);
      expect(() => validateCurrency('ABCD')).toThrow(BadRequestException);
      expect(() => validateCurrency('')).toThrow(BadRequestException);
      expect(() => validateCurrency('XXX')).toThrow(BadRequestException);
    });
  });

  describe('validateAmount', () => {
    it('accepts valid amounts', () => {
      expect(() => validateAmount(0)).not.toThrow();
      expect(() => validateAmount(1999)).not.toThrow();
    });

    it('rejects invalid amounts', () => {
      expect(() => validateAmount(-1)).toThrow(BadRequestException);
      expect(() => validateAmount(1.5)).toThrow(BadRequestException);
    });
  });

  describe('validateRefundAmount', () => {
    it('accepts valid refund amounts', () => {
      expect(() => validateRefundAmount(500, 1000)).not.toThrow();
      expect(() => validateRefundAmount(1000, 1000)).not.toThrow();
    });

    it('rejects refund exceeding payment', () => {
      expect(() => validateRefundAmount(1500, 1000)).toThrow(BadRequestException);
    });

    it('rejects zero refund', () => {
      expect(() => validateRefundAmount(0, 1000)).toThrow(BadRequestException);
    });
  });

  describe('validateUUID', () => {
    it('accepts valid UUIDs', () => {
      expect(() => validateUUID('a0000000-0000-0000-0000-000000000001', 'id')).not.toThrow();
    });

    it('rejects invalid UUIDs', () => {
      expect(() => validateUUID('not-a-uuid', 'id')).toThrow(BadRequestException);
      expect(() => validateUUID('', 'id')).toThrow(BadRequestException);
    });
  });

  describe('validateBillingInterval', () => {
    it('accepts valid intervals', () => {
      expect(() => validateBillingInterval('month')).not.toThrow();
      expect(() => validateBillingInterval('year')).not.toThrow();
      expect(() => validateBillingInterval('one_time')).not.toThrow();
    });

    it('rejects invalid intervals', () => {
      expect(() => validateBillingInterval('weekly')).toThrow(BadRequestException);
    });
  });

  describe('validateProductType', () => {
    it('accepts valid types', () => {
      expect(() => validateProductType('course')).not.toThrow();
      expect(() => validateProductType('addon')).not.toThrow();
    });

    it('rejects invalid types', () => {
      expect(() => validateProductType('invalid')).toThrow(BadRequestException);
    });
  });

  describe('validatePlanType', () => {
    it('accepts valid types', () => {
      expect(() => validatePlanType('free')).not.toThrow();
      expect(() => validatePlanType('premium')).not.toThrow();
    });

    it('rejects invalid types', () => {
      expect(() => validatePlanType('invalid')).toThrow(BadRequestException);
    });
  });

  describe('validateSubscriptionStatus', () => {
    it('accepts valid statuses', () => {
      expect(() => validateSubscriptionStatus('active')).not.toThrow();
      expect(() => validateSubscriptionStatus('canceled')).not.toThrow();
    });

    it('rejects invalid statuses', () => {
      expect(() => validateSubscriptionStatus('invalid')).toThrow(BadRequestException);
    });
  });

  describe('validatePaymentStatus', () => {
    it('accepts valid statuses', () => {
      expect(() => validatePaymentStatus('succeeded')).not.toThrow();
      expect(() => validatePaymentStatus('refunded')).not.toThrow();
    });

    it('rejects invalid statuses', () => {
      expect(() => validatePaymentStatus('invalid')).toThrow(BadRequestException);
    });
  });

  describe('validateInvoiceStatus', () => {
    it('accepts valid statuses', () => {
      expect(() => validateInvoiceStatus('paid')).not.toThrow();
    });

    it('rejects invalid statuses', () => {
      expect(() => validateInvoiceStatus('invalid')).toThrow(BadRequestException);
    });
  });

  describe('validateRefundStatus', () => {
    it('accepts valid statuses', () => {
      expect(() => validateRefundStatus('pending')).not.toThrow();
      expect(() => validateRefundStatus('denied')).not.toThrow();
    });

    it('rejects invalid statuses', () => {
      expect(() => validateRefundStatus('invalid')).toThrow(BadRequestException);
    });
  });

  describe('validateProviderEventId', () => {
    it('accepts valid event IDs', () => {
      expect(() => validateProviderEventId('evt_123abc')).not.toThrow();
    });

    it('rejects empty event IDs', () => {
      expect(() => validateProviderEventId('')).toThrow(BadRequestException);
      expect(() => validateProviderEventId('  ')).toThrow(BadRequestException);
    });
  });

  describe('validatePromotionCode', () => {
    it('accepts valid codes', () => {
      expect(() => validatePromotionCode('WELCOME20')).not.toThrow();
      expect(() => validatePromotionCode('SAVE-50')).not.toThrow();
    });

    it('rejects invalid codes', () => {
      expect(() => validatePromotionCode('')).toThrow(BadRequestException);
      expect(() => validatePromotionCode('code with spaces')).toThrow(BadRequestException);
      expect(() => validatePromotionCode('a'.repeat(51))).toThrow(BadRequestException);
    });
  });
});
