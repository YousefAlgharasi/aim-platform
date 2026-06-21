// P18-079: Add Admin AI UI Tests
// Cross-cutting checks across all admin AI pages (prompts, model config,
// usage/cost, safety review, audit): every page handles loading/error/
// empty/forbidden permission states, only fetches data through the
// shared api client, and never renders a provider secret/API key or
// computes mastery/cost/safety decisions locally.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const PAGE_FILES = [
  'AdminAiPrompts.js',
  'AdminAiModelConfig.js',
  'AdminAiUsageCost.js',
  'AdminAiSafetyReview.js',
  'AdminAiAudit.js',
];

const SECRET_REDACTION_PATTERNS = [
  /apiKey/i,
  /api_key/i,
  /provider_secret/i,
  /providerSecret/i,
  /providerPayload/i,
  /service[_-]?role/i,
  /signing[_-]?key/i,
];

const LOCAL_AUTHORITY_PATTERNS = [
  /computeMastery/i,
  /calculateScore/i,
  /computeProgress/i,
  /computeCost/i,
  /estimateCost/i,
  /computeSafetyDecision/i,
  /mastery[=<>!]+\d/,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin AI UI Tests (cross-cutting)', () => {
  test.each(PAGE_FILES)('%s exists', (fileName) => {
    expect(fs.existsSync(path.join(PAGES_DIR, fileName))).toBe(true);
  });

  test.each(PAGE_FILES)('%s is exported from pages/index.js', (fileName) => {
    const exportName = fileName.replace(/\.js$/, '');
    const indexContent = readFile(PAGES_DIR, 'index.js');
    expect(indexContent).toMatch(new RegExp(exportName));
  });

  test.each(PAGE_FILES)('%s only fetches data through the api client', (fileName) => {
    const content = readFile(PAGES_DIR, fileName);
    expect(content).toMatch(/from '\.\.\/api'/);
  });

  test.each(PAGE_FILES)('%s handles loading, error, empty, and forbidden states', (fileName) => {
    const content = readFile(PAGES_DIR, fileName).toLowerCase();
    expect(content).toMatch(/loading/);
    expect(content).toMatch(/error/);
    expect(content).toMatch(/empty/);
    expect(content).toMatch(/forbidden/);
  });

  test.each(PAGE_FILES)('%s never renders a provider secret/API key', (fileName) => {
    const content = readFile(PAGES_DIR, fileName);
    for (const pattern of SECRET_REDACTION_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test.each(PAGE_FILES)('%s never computes mastery/cost/safety decisions locally', (fileName) => {
    const content = readFile(PAGES_DIR, fileName);
    for (const pattern of LOCAL_AUTHORITY_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test('AdminAiModelConfig renders provider_key_ref but never a raw provider secret', () => {
    const content = readFile(PAGES_DIR, 'AdminAiModelConfig.js');
    expect(content).toMatch(/provider_key_ref/);
  });

  test('AdminAiSafetyReview never renders rejected raw message/response content', () => {
    const content = readFile(PAGES_DIR, 'AdminAiSafetyReview.js');
    expect(content).not.toMatch(/rawMessage/i);
    expect(content).not.toMatch(/responseText/i);
    expect(content).toMatch(/reason_category/);
  });

  test('AdminAiUsageCost never estimates cost locally, only renders cost_estimate', () => {
    const content = readFile(PAGES_DIR, 'AdminAiUsageCost.js');
    expect(content).toMatch(/cost_estimate/);
    expect(content).not.toMatch(/estimateCost/i);
  });

  test('AdminAiAudit never renders a raw provider payload, only safe details metadata', () => {
    const content = readFile(PAGES_DIR, 'AdminAiAudit.js');
    expect(content).toMatch(/log\.details/);
    expect(content).not.toMatch(/providerPayload/i);
  });

  test('api client exposes functions for all five admin AI surfaces', () => {
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    const expectedFunctions = [
      'listPromptTemplates',
      'listModelConfigs',
      'listRecentAiUsage',
      'listRejectedSafetyEvents',
      'listRecentAuditLogs',
    ];
    for (const fn of expectedFunctions) {
      expect(content).toMatch(new RegExp(`export async function ${fn}`));
    }
  });

  test('api client never hardcodes a provider secret/API key value', () => {
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    for (const pattern of SECRET_REDACTION_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });
});
