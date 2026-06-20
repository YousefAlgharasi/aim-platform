// P13-068: Admin Notification UI Tests
// Verifies the admin notification monitor/template views are strictly
// read-only and that the admin API client never exposes a mutation
// action (send, retry, cancel, edit, activate, deactivate).

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const PAGE_FILES = ['AdminNotificationMonitor.jsx', 'AdminTemplateMonitor.jsx'];
const API_FILE = 'adminNotificationsApiClient.js';

const FORBIDDEN_MUTATION_PATTERNS = [
  /method:\s*['"](POST|PATCH|PUT|DELETE)['"]/i,
  /sendNotification/i,
  /retryDelivery/i,
  /cancelDelivery/i,
  /activateTemplate/i,
  /deactivateTemplate/i,
  /updateTemplate/i,
  /deleteTemplate/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin Notification UI', () => {
  test('admin notification pages exist', () => {
    for (const file of PAGE_FILES) {
      expect(fs.existsSync(path.join(PAGES_DIR, file))).toBe(true);
    }
  });

  test('admin API client only issues GET requests', () => {
    const content = readFile(API_DIR, API_FILE);
    expect(content).not.toMatch(/method:\s*['"](POST|PATCH|PUT|DELETE)['"]/i);
  });

  test('admin pages never call a mutation action', () => {
    for (const file of PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      for (const pattern of FORBIDDEN_MUTATION_PATTERNS) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  test('admin pages only import data via the admin notifications API client', () => {
    for (const file of PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content).toMatch(/from '\.\.\/api\/adminNotificationsApiClient'/);
    }
  });

  test('admin API client always sends a bearer token', () => {
    const content = readFile(API_DIR, API_FILE);
    expect(content).toContain('Authorization');
    expect(content).toContain('Bearer');
  });

  test('admin API client always targets the admin notifications route prefix', () => {
    const content = readFile(API_DIR, API_FILE);
    expect(content).toContain('/api/v1/admin/notifications');
  });

  test('admin pages handle loading, error, and empty states', () => {
    for (const file of PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content.toLowerCase()).toMatch(/loading/);
      expect(content.toLowerCase()).toMatch(/error/);
      expect(content.toLowerCase()).toMatch(/empty/);
    }
  });

  test('admin pages catch failures and set error state, not silent failures', () => {
    for (const file of PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      if (content.includes('.catch')) {
        expect(content).toMatch(/setError|setStatus.*error/i);
      }
    }
  });

  test('backend admin notifications controller is guarded by an admin-only guard', () => {
    const controllerPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      'services',
      'backend-api',
      'src',
      'features',
      'notifications',
      'notifications-admin.controller.ts',
    );
    const content = fs.existsSync(controllerPath) ? fs.readFileSync(controllerPath, 'utf-8') : '';
    expect(content).toContain('NotificationAdminGuard');
    expect(content).toContain('SupabaseJwtAuthGuard');
  });

  test('backend admin notifications controller only exposes read endpoints', () => {
    const controllerPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      'services',
      'backend-api',
      'src',
      'features',
      'notifications',
      'notifications-admin.controller.ts',
    );
    const content = fs.existsSync(controllerPath) ? fs.readFileSync(controllerPath, 'utf-8') : '';
    expect(content).not.toMatch(/@Post\(/);
    expect(content).not.toMatch(/@Patch\(/);
    expect(content).not.toMatch(/@Put\(/);
    expect(content).not.toMatch(/@Delete\(/);
  });
});
