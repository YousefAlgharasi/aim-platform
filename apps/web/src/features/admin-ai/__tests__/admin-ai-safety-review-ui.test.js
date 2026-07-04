// P18-077: Create Admin AI Safety Review UI
// Verifies the safety review page only renders the recorded
// decision/reason_category/rating exactly as stored, never exposes
// rejected raw message/response content, always renders backend-
// approved loading/empty/error/forbidden states, and only fetches data
// through the api client.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const FORBIDDEN_PATTERNS = [
  /rejected_content/i,
  /rawMessage/i,
  /raw_message/i,
  /responseText/i,
  /computeMastery/i,
  /calculateScore/i,
  /apiKey/i,
  /api_key/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin AI Safety Review UI', () => {
  test('AdminAiSafetyReview page exists and is exported', () => {
    expect(fs.existsSync(path.join(PAGES_DIR, 'AdminAiSafetyReview.js'))).toBe(true);
    const indexContent = readFile(PAGES_DIR, 'index.js');
    expect(indexContent).toMatch(/AdminAiSafetyReview/);
  });

  test('page only fetches safety data via the api client', () => {
    const content = readFile(PAGES_DIR, 'AdminAiSafetyReview.js');
    expect(content).toMatch(/from '\.\.\/api'/);
    expect(content).toMatch(/listRejectedSafetyEvents/);
    expect(content).toMatch(/listFlaggedFeedback/);
  });

  test('page never renders rejected raw message/response content or secrets', () => {
    const content = readFile(PAGES_DIR, 'AdminAiSafetyReview.js');
    for (const pattern of FORBIDDEN_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });

  test('page handles loading, empty, error, and forbidden states', () => {
    const content = readFile(PAGES_DIR, 'AdminAiSafetyReview.js');
    expect(content.toLowerCase()).toMatch(/loading/);
    expect(content.toLowerCase()).toMatch(/empty/);
    expect(content.toLowerCase()).toMatch(/error/);
    expect(content.toLowerCase()).toMatch(/forbidden/);
  });

  test('page renders reason_category and rating as backend-provided values only', () => {
    const content = readFile(PAGES_DIR, 'AdminAiSafetyReview.js');
    expect(content).toMatch(/reason_category/);
    expect(content).toMatch(/rating/);
  });

  test('api client exposes safety review functions against the admin/ai/safety route', () => {
    const content = readFile(API_DIR, 'adminAiApiClient.js');
    expect(content).toMatch(/export async function listRejectedSafetyEvents/);
    expect(content).toMatch(/export async function listFlaggedFeedback/);
    expect(content).toContain('/safety/events');
    expect(content).toContain('/safety/feedback');
  });
});
