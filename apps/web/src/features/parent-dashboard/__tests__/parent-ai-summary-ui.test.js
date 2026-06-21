// P18-070: Parent AI Read-Only Summary UI Tests
// Verifies the parent AI usage summary page never computes mastery,
// scores, or conversation content client-side, always renders backend-
// approved loading/empty/error states, and only calls the AI summary
// route via the parent API client.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const FORBIDDEN_AUTHORITY_PATTERNS = [
  /computeMastery/i,
  /calculateScore/i,
  /computeProgress/i,
  /aggregateMetric/i,
  /mastery\s*[=<>!]+\s*\d/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Parent AI Summary UI', () => {
  test('ParentAiSummary page exists', () => {
    expect(fs.existsSync(path.join(PAGES_DIR, 'ParentAiSummary.js'))).toBe(true);
  });

  test('page does not compute mastery, scores, or progress locally', () => {
    const content = readFile(PAGES_DIR, 'ParentAiSummary.js');
    for (const pattern of FORBIDDEN_AUTHORITY_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test('page only imports AI usage data via the api client', () => {
    const content = readFile(PAGES_DIR, 'ParentAiSummary.js');
    expect(content).toMatch(/from '\.\.\/api'/);
    expect(content).toMatch(/getChildAiUsageSummary/);
  });

  test('page handles loading, error, and empty states', () => {
    const content = readFile(PAGES_DIR, 'ParentAiSummary.js');
    expect(content.toLowerCase()).toMatch(/loading/);
    expect(content.toLowerCase()).toMatch(/error/);
    expect(content.toLowerCase()).toMatch(/empty/);
  });

  test('page never renders raw conversation/voice content or safety taxonomy fields', () => {
    const content = readFile(PAGES_DIR, 'ParentAiSummary.js');
    for (const forbidden of [
      'transcript',
      'reason_category',
      'messageText',
      'audioRef',
      'weakness',
      'difficulty',
      'recommendation',
      'review-schedule',
    ]) {
      expect(content).not.toMatch(new RegExp(forbidden, 'i'));
    }
  });

  test('api client exposes getChildAiUsageSummary against the parent ai-summary route', () => {
    const content = readFile(API_DIR, 'parentApiClient.js');
    expect(content).toMatch(/export async function getChildAiUsageSummary/);
    expect(content).toContain('/ai-summary');
  });

  test('api client never overrides the requester identity', () => {
    const content = readFile(API_DIR, 'parentApiClient.js');
    expect(content).not.toMatch(/requestedByUserId/i);
  });
});
