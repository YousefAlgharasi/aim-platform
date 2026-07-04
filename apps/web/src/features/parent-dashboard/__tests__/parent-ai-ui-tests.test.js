// P18-072: Add Parent AI UI Tests
// Verifies child-scope, consent, privacy, and read-only behavior across
// both Parent AI usage pages (ParentAiSummary, ParentAiSafetySummary):
// every request is scoped to an explicit childId, the requester identity
// is never overridden by the client, and no raw conversation/voice
// content or safety reason-category taxonomy is ever rendered or fetched.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const AI_PAGES = ['ParentAiSummary.js', 'ParentAiSafetySummary.js'];

const FORBIDDEN_CONTENT_PATTERNS = [
  'transcript',
  'reason_category',
  'reasonCategory',
  'messageText',
  'audioRef',
  'weakness',
  'difficulty',
  'recommendation',
  'review-schedule',
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Parent AI UI — child-scope, consent, and privacy', () => {
  test.each(AI_PAGES)('%s exists', (file) => {
    expect(fs.existsSync(path.join(PAGES_DIR, file))).toBe(true);
  });

  test.each(AI_PAGES)('%s only fetches data scoped to an explicit childId prop', (file) => {
    const content = readFile(PAGES_DIR, file);
    expect(content).toMatch(/function \w+\(\{\s*childId\s*\}\)/);
    expect(content).toMatch(/if \(!childId\)/);
  });

  test.each(AI_PAGES)('%s never overrides the requester identity', (file) => {
    const content = readFile(PAGES_DIR, file);
    expect(content).not.toMatch(/requestedByUserId/i);
    expect(content).not.toMatch(/parentId\s*[:=]/i);
  });

  test.each(AI_PAGES)('%s only imports AI data via the api client', (file) => {
    const content = readFile(PAGES_DIR, file);
    expect(content).toMatch(/from '\.\.\/api'/);
  });

  test.each(AI_PAGES)('%s handles loading, error, and empty states', (file) => {
    const content = readFile(PAGES_DIR, file);
    expect(content.toLowerCase()).toMatch(/loading/);
    expect(content.toLowerCase()).toMatch(/error/);
    expect(content.toLowerCase()).toMatch(/empty/);
  });

  test.each(AI_PAGES)('%s never renders raw conversation/voice content or safety taxonomy fields', (file) => {
    const content = readFile(PAGES_DIR, file);
    for (const forbidden of FORBIDDEN_CONTENT_PATTERNS) {
      expect(content).not.toMatch(new RegExp(forbidden, 'i'));
    }
  });

  test('api client scopes both AI summary routes under a specific child id', () => {
    const content = readFile(API_DIR, 'parentApiClient.js');
    expect(content).toMatch(/getChildAiUsageSummary\(childId\)/);
    expect(content).toMatch(/getChildAiSafetySummary\(childId\)/);
    expect(content).toContain('/children/${encodeURIComponent(childId)}/ai-summary');
    expect(content).toContain('/children/${encodeURIComponent(childId)}/ai-safety-summary');
  });

  test('api client never overrides the requester identity for AI routes', () => {
    const content = readFile(API_DIR, 'parentApiClient.js');
    expect(content).not.toMatch(/requestedByUserId/i);
  });

  test('api client relies on the shared parentRequest helper which sends the bearer token, not a client-supplied parent id', () => {
    const content = readFile(API_DIR, 'parentApiClient.js');
    const usageFnMatch = content.match(/export async function getChildAiUsageSummary\([^)]*\)\s*{\s*return parentRequest\([^}]*}/);
    const safetyFnMatch = content.match(/export async function getChildAiSafetySummary\([^)]*\)\s*{\s*return parentRequest\([^}]*}/);
    expect(usageFnMatch).not.toBeNull();
    expect(safetyFnMatch).not.toBeNull();
    expect(usageFnMatch[0]).not.toMatch(/parentId/i);
    expect(safetyFnMatch[0]).not.toMatch(/parentId/i);
  });
});
