import {
  isValidChannel,
  isValidCategory,
  isValidLocale,
  isValidPlatform,
  isValidReminderType,
  isValidTimeFormat,
  isValidCronExpression,
  isValidDeviceToken,
  containsSensitiveData,
} from './notification-validation.helpers';

describe('Notification Validation Helpers', () => {
  describe('isValidChannel', () => {
    it('accepts valid channels', () => {
      expect(isValidChannel('in_app')).toBe(true);
      expect(isValidChannel('push')).toBe(true);
      expect(isValidChannel('email')).toBe(true);
    });
    it('rejects invalid channels', () => {
      expect(isValidChannel('sms')).toBe(false);
      expect(isValidChannel('')).toBe(false);
    });
  });

  describe('isValidCategory', () => {
    it('accepts valid categories', () => {
      expect(isValidCategory('learning_reminder')).toBe(true);
      expect(isValidCategory('parent_summary')).toBe(true);
    });
    it('rejects invalid categories', () => {
      expect(isValidCategory('marketing')).toBe(false);
    });
  });

  describe('isValidLocale', () => {
    it('accepts en and ar', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('ar')).toBe(true);
    });
    it('rejects others', () => {
      expect(isValidLocale('fr')).toBe(false);
    });
  });

  describe('isValidPlatform', () => {
    it('accepts valid platforms', () => {
      expect(isValidPlatform('ios')).toBe(true);
      expect(isValidPlatform('android')).toBe(true);
    });
    it('rejects invalid', () => {
      expect(isValidPlatform('web')).toBe(false);
      expect(isValidPlatform('windows')).toBe(false);
    });
  });

  describe('isValidReminderType', () => {
    it('accepts valid types', () => {
      expect(isValidReminderType('learning_plan')).toBe(true);
      expect(isValidReminderType('streak')).toBe(true);
    });
    it('rejects invalid', () => {
      expect(isValidReminderType('unknown')).toBe(false);
    });
  });

  describe('isValidTimeFormat', () => {
    it('accepts HH:mm format', () => {
      expect(isValidTimeFormat('22:00')).toBe(true);
      expect(isValidTimeFormat('07:30')).toBe(true);
    });
    it('rejects invalid', () => {
      expect(isValidTimeFormat('7:30')).toBe(false);
      expect(isValidTimeFormat('22:00:00')).toBe(false);
    });
  });

  describe('isValidCronExpression', () => {
    it('accepts 5-part cron', () => {
      expect(isValidCronExpression('0 9 * * *')).toBe(true);
      expect(isValidCronExpression('30 17 * * 1-5')).toBe(true);
    });
    it('rejects invalid', () => {
      expect(isValidCronExpression('* *')).toBe(false);
    });
  });

  describe('isValidDeviceToken', () => {
    it('accepts valid tokens', () => {
      expect(isValidDeviceToken('abc123')).toBe(true);
    });
    it('rejects empty or too long', () => {
      expect(isValidDeviceToken('')).toBe(false);
      expect(isValidDeviceToken('x'.repeat(513))).toBe(false);
    });
  });

  describe('containsSensitiveData', () => {
    it('detects sensitive patterns', () => {
      expect(containsSensitiveData({ api_key: 'abc' })).toBe(true);
      expect(containsSensitiveData({ password: '123' })).toBe(true);
      expect(containsSensitiveData({ service_role: 'key' })).toBe(true);
    });
    it('allows safe payloads', () => {
      expect(containsSensitiveData({ title: 'Reminder', body: 'Time to study' })).toBe(false);
    });
  });
});
