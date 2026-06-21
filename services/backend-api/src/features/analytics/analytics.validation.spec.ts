import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  validateUUID,
  validateActorRole,
  validateMetricDomain,
  validateScopeType,
  validatePeriodType,
  validatePeriodRange,
  validateExportType,
  validateDashboardKey,
  validateEventType,
  assertMinimumAggregateSize,
  assertRoleAllowed,
} from './analytics.validation';

describe('Analytics Validation', () => {
  describe('validateUUID', () => {
    it('accepts a valid UUID', () => {
      expect(() => validateUUID('a0000000-0000-0000-0000-000000000001', 'id')).not.toThrow();
    });

    it('rejects an invalid UUID', () => {
      expect(() => validateUUID('not-a-uuid', 'id')).toThrow(BadRequestException);
      expect(() => validateUUID('', 'id')).toThrow(BadRequestException);
    });
  });

  describe('validateActorRole', () => {
    it('accepts valid roles', () => {
      expect(() => validateActorRole('student')).not.toThrow();
      expect(() => validateActorRole('system')).not.toThrow();
    });

    it('rejects invalid roles', () => {
      expect(() => validateActorRole('superadmin')).toThrow(BadRequestException);
    });
  });

  describe('validateMetricDomain', () => {
    it('accepts valid domains', () => {
      expect(() => validateMetricDomain('learning')).not.toThrow();
      expect(() => validateMetricDomain('billing')).not.toThrow();
    });

    it('rejects invalid domains', () => {
      expect(() => validateMetricDomain('marketing')).toThrow(BadRequestException);
    });
  });

  describe('validateScopeType', () => {
    it('accepts valid scope types', () => {
      expect(() => validateScopeType('platform')).not.toThrow();
      expect(() => validateScopeType('cohort')).not.toThrow();
    });

    it('rejects invalid scope types', () => {
      expect(() => validateScopeType('global')).toThrow(BadRequestException);
    });
  });

  describe('validatePeriodType', () => {
    it('accepts valid period types', () => {
      expect(() => validatePeriodType('day')).not.toThrow();
    });

    it('rejects invalid period types', () => {
      expect(() => validatePeriodType('year')).toThrow(BadRequestException);
    });
  });

  describe('validatePeriodRange', () => {
    it('accepts a valid range', () => {
      expect(() => validatePeriodRange(new Date('2026-01-01'), new Date('2026-01-02'))).not.toThrow();
    });

    it('rejects a non-positive range', () => {
      expect(() => validatePeriodRange(new Date('2026-01-02'), new Date('2026-01-01'))).toThrow(BadRequestException);
      expect(() => validatePeriodRange(new Date('2026-01-01'), new Date('2026-01-01'))).toThrow(BadRequestException);
    });
  });

  describe('validateExportType', () => {
    it('accepts valid export types', () => {
      expect(() => validateExportType('csv')).not.toThrow();
    });

    it('rejects invalid export types', () => {
      expect(() => validateExportType('xlsx')).toThrow(BadRequestException);
    });
  });

  describe('validateDashboardKey', () => {
    it('accepts valid dashboard keys', () => {
      expect(() => validateDashboardKey('admin_overview')).not.toThrow();
    });

    it('rejects invalid dashboard keys', () => {
      expect(() => validateDashboardKey('unknown_dashboard')).toThrow(BadRequestException);
    });
  });

  describe('validateEventType', () => {
    it('accepts a valid event type', () => {
      expect(() => validateEventType('lesson.completed')).not.toThrow();
    });

    it('rejects an empty event type', () => {
      expect(() => validateEventType('')).toThrow(BadRequestException);
    });

    it('rejects an overly long event type', () => {
      expect(() => validateEventType('a'.repeat(101))).toThrow(BadRequestException);
    });
  });

  describe('assertMinimumAggregateSize', () => {
    it('allows aggregates at or above the minimum size', () => {
      expect(() => assertMinimumAggregateSize(5)).not.toThrow();
      expect(() => assertMinimumAggregateSize(20)).not.toThrow();
    });

    it('denies aggregates below the minimum size', () => {
      expect(() => assertMinimumAggregateSize(4)).toThrow(ForbiddenException);
      expect(() => assertMinimumAggregateSize(0)).toThrow(ForbiddenException);
    });
  });

  describe('assertRoleAllowed', () => {
    it('allows a role present in the allowed list', () => {
      expect(() => assertRoleAllowed('admin', ['admin', 'system'])).not.toThrow();
    });

    it('denies a role not present in the allowed list', () => {
      expect(() => assertRoleAllowed('student', ['admin'])).toThrow(ForbiddenException);
    });
  });
});
