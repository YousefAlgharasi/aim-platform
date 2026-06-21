// P18-078: Create Admin AI Audit UI
// Verifies the audit page only renders backend-recorded safe metadata
// via the api client, never raw provider payloads or secrets, and
// always renders backend-approved loading/empty/error/forbidden states.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const FORBIDDEN_PATTERNS = [
  /apiKey/i,
  /api_key/i,
  /provider_secret/i,
  /providerSecret/i,
  /providerPayload/i,
  /computeMastery/i,
  /calculateScore/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin AI Audit UI', () => {
  test('AdminAiAudit page exists and is exported', () => {
    expect(fs.existsSync(path.join(PAGES_DIR, 'AdminAiAudit.js'))).toBe(true);
    const indexContent = readFile(PAGES_DIR, 'index.js');
    expect(indexContent).toMatch(/AdminAiAudit/);
  });

  test('page only fetches audit data via the api client', () => {
    const content = readFile(PAGES_DIR, 'AdminAiAudit.js');
    expect(content).toMatch(/from '\.\.\/api'/);
    expect(content).toMatch(/listRecentAuditLogs/);
  });

  test('page never renders raw provider payloads or secrets', () => {
    const content = readFile(PAGES_DIR, 'AdminAiAudit.js');
    for (const pattern of FORBIDDEN_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test('page handles loading, empty, error, and forbidden states', () => {
    const content = readFile(PAGES_DIR, 'AdminAiAudit.js');
    expect(content.toLowerCase()).toMatch(/loading/);
    expect(content.toLowerCase()).toMatch(/empty/);
    expect(content.toLowerCase()).toMatch(/error/);
    expect(content.toLowerCase()).toMatch(/forbidden/);
  });

  test('page renders action, resource_type, and details as backend-provided values only', () => {
    const content = readFile(PAGES_DIR, 'AdminAiAudit.js');
    expect(content).toMatch(/log\.action/);
    expect(content).toMatch(/resource_type/);
    expect(content).toMatch(/log\.details/);
  });

  test('api client exposes the audit logs function against the admin/ai/audit route', () => {
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    expect(content).toMatch(/export async function listRecentAuditLogs/);
    expect(content).toContain('/audit/logs');
  });
});
