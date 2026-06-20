import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_LOCALES,
  DEVICE_TOKEN_PLATFORMS,
  REMINDER_TYPES,
  NotificationChannel,
  NotificationCategory,
  NotificationLocale,
  DeviceTokenPlatform,
  ReminderType,
} from './dto';

export function isValidChannel(value: string): value is NotificationChannel {
  return (NOTIFICATION_CHANNELS as readonly string[]).includes(value);
}

export function isValidCategory(value: string): value is NotificationCategory {
  return (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);
}

export function isValidLocale(value: string): value is NotificationLocale {
  return (NOTIFICATION_LOCALES as readonly string[]).includes(value);
}

export function isValidPlatform(value: string): value is DeviceTokenPlatform {
  return (DEVICE_TOKEN_PLATFORMS as readonly string[]).includes(value);
}

export function isValidReminderType(value: string): value is ReminderType {
  return (REMINDER_TYPES as readonly string[]).includes(value);
}

export function isValidTimeFormat(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

export function isValidCronExpression(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  return parts.length === 5;
}

export function isValidDeviceToken(token: string): boolean {
  return typeof token === 'string' && token.length > 0 && token.length <= 512;
}

const SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /api_key/i,
  /apikey/i,
  /service_role/i,
  /supabase_key/i,
  /private_key/i,
  /credential/i,
];

export function containsSensitiveData(payload: Record<string, unknown>): boolean {
  const json = JSON.stringify(payload);
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(json));
}
