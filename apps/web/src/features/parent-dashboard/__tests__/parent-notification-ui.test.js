// P13-065: Parent Notification UI Tests
// Verifies the parent notification inbox/preferences/deadline reminder UI
// never computes eligibility, delivery state, or quiet-hour enforcement
// client-side, and never overrides recipient scope with a child id.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');
const NOTIFICATIONS_DIR = path.resolve(__dirname, '..', 'notifications');

const NOTIFICATION_PAGE_FILES = [
  'ParentNotifications.js',
  'ParentNotificationSettings.js',
  'ParentDeadlineReminders.js',
];

const FORBIDDEN_AUTHORITY_PATTERNS = [
  /isEligible\s*=/i,
  /computeDeliveryState/i,
  /isWithinQuietHours/i,
  /shouldSuppress/i,
  /shouldDeliver/i,
  /computeNextRunAt/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Parent Notification UI', () => {
  test('notification pages exist', () => {
    for (const file of NOTIFICATION_PAGE_FILES) {
      expect(fs.existsSync(path.join(PAGES_DIR, file))).toBe(true);
    }
  });

  test('notification pages do not compute eligibility, delivery state, or quiet-hour enforcement', () => {
    for (const file of NOTIFICATION_PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      for (const pattern of FORBIDDEN_AUTHORITY_PATTERNS) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  test('notification pages only import data via the api client', () => {
    for (const file of NOTIFICATION_PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content).toMatch(/from '\.\.\/api'/);
    }
  });

  test('notification API client never sends a child id or recipient scope override', () => {
    const content = readFile(API_DIR, 'notificationsApiClient.js');
    expect(content).not.toMatch(/childId/i);
    expect(content).not.toMatch(/child_id/i);
    expect(content).not.toMatch(/recipientId/i);
    expect(content).not.toMatch(/scopeOverride/i);
  });

  test('notification API client always uses the notifications route prefix', () => {
    const content = readFile(API_DIR, 'notificationsApiClient.js');
    expect(content).toContain('/api/v1/notifications');
    expect(content).toContain('Authorization');
    expect(content).toContain('Bearer');
  });

  test('inbox page never computes read/unread or dismissed state locally', () => {
    const content = readFile(PAGES_DIR, 'ParentNotifications.js');
    expect(content).not.toMatch(/isUnread\s*=\s*true/);
    expect(content).toMatch(/readAt|read_at/);
    expect(content).toMatch(/dismissedAt|dismissed_at/);
  });

  test('preferences page reflects backend rows instead of inventing defaults beyond opt-out fallback', () => {
    const content = readFile(PAGES_DIR, 'ParentNotificationSettings.js');
    expect(content).toMatch(/getChannelPreferences/);
    expect(content).toMatch(/getQuietHours/);
    expect(content).toMatch(/updateChannelPreference/);
    expect(content).toMatch(/updateQuietHours/);
  });

  test('deadline reminders page only shows schedules of kind "deadline" and never sets status locally', () => {
    const content = readFile(PAGES_DIR, 'ParentDeadlineReminders.js');
    expect(content).toMatch(/kind === 'deadline'/);
    expect(content).not.toMatch(/status:\s*'(active|paused|completed|cancelled)'/);
  });

  test('deadline reminder actions call the reminder API client functions, not local mutation logic', () => {
    const content = readFile(PAGES_DIR, 'ParentDeadlineReminders.js');
    expect(content).toMatch(/pauseReminderSchedule/);
    expect(content).toMatch(/resumeReminderSchedule/);
    expect(content).toMatch(/cancelReminderSchedule/);
  });

  test('notification pages handle loading, error, and empty states', () => {
    for (const file of NOTIFICATION_PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content.toLowerCase()).toMatch(/loading/);
      expect(content.toLowerCase()).toMatch(/error/);
      expect(content.toLowerCase()).toMatch(/empty/);
    }
  });

  test('notifications shell renders loading/error/empty states without local data computation', () => {
    const content = readFile(NOTIFICATIONS_DIR, 'ParentNotificationsShell.js');
    expect(content).toMatch(/status/);
    expect(content).not.toMatch(/isEligible|computeDeliveryState/i);
  });
});
