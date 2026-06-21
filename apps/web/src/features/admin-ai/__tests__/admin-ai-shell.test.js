// P18-073: Create Admin AI Management Feature Shell
// Verifies the admin AI feature shell boundary exists, never computes
// mastery/cost/safety decisions client-side, renders backend-approved
// loading/empty/error/forbidden states, and follows AIM design system
// tokens. Page-level tests for prompts/model-config/usage-cost/safety-
// review/audit are added by their respective tasks (P18-074–P18-079).

import fs from 'fs';
import path from 'path';

const FEATURE_DIR = path.resolve(__dirname, '..');
const API_DIR = path.join(FEATURE_DIR, 'api');

const FORBIDDEN_AUTHORITY_PATTERNS = [
  /computeMastery/i,
  /calculateScore/i,
  /computeProgress/i,
  /aggregateMetric/i,
  /computeCost/i,
  /computeSafetyDecision/i,
  /mastery\s*[=<>!]+\s*\d/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin AI Feature Shell', () => {
  test('feature shell exists', () => {
    expect(fs.existsSync(path.join(FEATURE_DIR, 'AdminAiShell.js'))).toBe(true);
  });

  test('feature shell CSS exists', () => {
    expect(fs.existsSync(path.join(FEATURE_DIR, 'AdminAiShell.css'))).toBe(true);
  });

  test('feature index barrel exists', () => {
    expect(fs.existsSync(path.join(FEATURE_DIR, 'index.js'))).toBe(true);
  });

  test('api client exists and targets the admin AI route prefix', () => {
    expect(fs.existsSync(path.join(API_DIR, 'adminAiApiClient.js'))).toBe(true);
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    expect(content).toContain('/api/v1/admin/ai');
    expect(content).toContain('Authorization');
    expect(content).toContain('Bearer');
  });

  test('api client does not override requester identity', () => {
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    expect(content).not.toMatch(/requestedByUserId/i);
  });

  test('shell does not compute mastery, cost, or safety decisions locally', () => {
    const content = readFile(FEATURE_DIR, 'AdminAiShell.js');
    for (const pattern of FORBIDDEN_AUTHORITY_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test('shell handles loading, error, empty, and forbidden states', () => {
    const content = readFile(FEATURE_DIR, 'AdminAiShell.js');
    expect(content).toMatch(/loading/);
    expect(content).toMatch(/error/i);
    expect(content).toMatch(/empty/);
    expect(content).toMatch(/forbidden/);
  });

  test('shell defines nav items for prompts, model config, usage/cost, safety review, and audit', () => {
    const content = readFile(FEATURE_DIR, 'AdminAiShell.js');
    expect(content).toMatch(/prompts/);
    expect(content).toMatch(/model-config/);
    expect(content).toMatch(/usage-cost/);
    expect(content).toMatch(/safety-review/);
    expect(content).toMatch(/audit/);
  });

  test('shell has mobile menu toggle and RTL/accessibility support', () => {
    const content = readFile(FEATURE_DIR, 'AdminAiShell.js');
    expect(content).toMatch(/mobileMenuOpen/);
    expect(content).toMatch(/setMobileMenuOpen/);
    expect(content).toMatch(/dir="auto"/);
    expect(content).toMatch(/aria-current/);
    expect(content).toMatch(/role="status"/);
    expect(content).toMatch(/role="alert"/);
  });

  test('shell CSS uses design system tokens and RTL-safe properties', () => {
    const content = readFile(FEATURE_DIR, 'AdminAiShell.css');
    expect(content).toMatch(/--color-/);
    expect(content).toMatch(/--space-/);
    expect(content).toMatch(/border-inline|inset-inline|margin-inline|padding-inline/);
    expect(content).toMatch(/@media/);
  });
});
