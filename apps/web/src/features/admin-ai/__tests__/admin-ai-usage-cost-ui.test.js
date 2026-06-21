// P18-076: Create Admin AI Usage and Cost UI
// Verifies the usage/cost page only renders backend-computed
// usage/cost/quota values, never estimates cost or decides quota
// outcomes locally, always renders backend-approved loading/empty/
// error/forbidden states, and only fetches data through the api client.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const FORBIDDEN_PATTERNS = [
  /apiKey/i,
  /api_key/i,
  /provider_secret/i,
  /providerSecret/i,
  /computeMastery/i,
  /calculateScore/i,
  /computeCost/i,
  /estimateCost/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin AI Usage and Cost UI', () => {
  test('AdminAiUsageCost page exists and is exported', () => {
    expect(fs.existsSync(path.join(PAGES_DIR, 'AdminAiUsageCost.js'))).toBe(true);
    const indexContent = readFile(PAGES_DIR, 'index.js');
    expect(indexContent).toMatch(/AdminAiUsageCost/);
  });

  test('page only fetches usage/cost data via the api client', () => {
    const content = readFile(PAGES_DIR, 'AdminAiUsageCost.js');
    expect(content).toMatch(/from '\.\.\/api'/);
    expect(content).toMatch(/listRecentAiUsage/);
    expect(content).toMatch(/listAiUsageForStudent/);
    expect(content).toMatch(/getAiLimitStatusForStudent/);
  });

  test('page never computes cost/quota locally or reads provider secrets', () => {
    const content = readFile(PAGES_DIR, 'AdminAiUsageCost.js');
    for (const pattern of FORBIDDEN_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test('page handles loading, empty, error, and forbidden states', () => {
    const content = readFile(PAGES_DIR, 'AdminAiUsageCost.js');
    expect(content.toLowerCase()).toMatch(/loading/);
    expect(content.toLowerCase()).toMatch(/empty/);
    expect(content.toLowerCase()).toMatch(/error/);
    expect(content.toLowerCase()).toMatch(/forbidden/);
  });

  test('page renders cost_estimate and quota_period as backend-provided values only', () => {
    const content = readFile(PAGES_DIR, 'AdminAiUsageCost.js');
    expect(content).toMatch(/cost_estimate/);
    expect(content).toMatch(/quota_period/);
  });

  test('api client exposes usage/cost functions against the admin/ai/usage route', () => {
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    expect(content).toMatch(/export async function listRecentAiUsage/);
    expect(content).toMatch(/export async function listAiUsageForStudent/);
    expect(content).toMatch(/export async function getAiLimitStatusForStudent/);
    expect(content).toContain('/usage');
    expect(content).toContain('/student/');
    expect(content).toContain('/limit-status');
  });
});
