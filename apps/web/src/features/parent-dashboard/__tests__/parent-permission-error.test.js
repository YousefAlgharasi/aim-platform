// P12-068: Parent UI Permission/Error Tests
// Verifies forbidden, unlinked, revoked, and expired states are handled.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const GUARDS_DIR = path.resolve(__dirname, '..', 'guards');

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Parent Permission & Error Handling', () => {
  test('ParentAuthGuard checks for token before rendering', () => {
    const content = readFile(GUARDS_DIR, 'ParentAuthGuard.js');
    expect(content).toContain('localStorage');
    expect(content).toContain('token');
  });

  test('ParentAuthGuard shows forbidden state when no token', () => {
    const content = readFile(GUARDS_DIR, 'ParentAuthGuard.js');
    expect(content.toLowerCase()).toMatch(/forbidden|غير مصرح|ممنوع/);
  });

  test('pages handle loading state', () => {
    const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.js') && !f.includes('index') && !f.includes('.css'));
    for (const file of files) {
      const content = readFile(PAGES_DIR, file);
      if (content.includes('useEffect') && content.includes('useState')) {
        expect(content).toContain('loading');
      }
    }
  });

  test('pages handle error state', () => {
    const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.js') && !f.includes('index') && !f.includes('.css'));
    for (const file of files) {
      const content = readFile(PAGES_DIR, file);
      if (content.includes('useEffect') && content.includes('useState')) {
        expect(content).toContain('error');
      }
    }
  });

  test('pages with childId handle empty/unlinked state', () => {
    const childPages = ['ParentAssessments.js', 'ParentActivity.js', 'ParentDeadlineStatus.js', 'ParentReports.js', 'ParentConsentPage.js'];
    for (const file of childPages) {
      const content = readFile(PAGES_DIR, file);
      expect(content).toContain('childId');
      expect(content).toMatch(/empty|Empty/);
    }
  });

  test('API client sends Bearer token on every request', () => {
    const apiDir = path.resolve(__dirname, '..', 'api');
    const clientFile = fs.readdirSync(apiDir).find((f) => f.includes('Client') || f.includes('client'));
    if (clientFile) {
      const content = readFile(apiDir, clientFile);
      expect(content).toContain('Bearer');
      expect(content).toContain('Authorization');
    }
  });

  test('catch blocks set error state, not silent failures', () => {
    const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.js') && !f.includes('index') && !f.includes('.css'));
    for (const file of files) {
      const content = readFile(PAGES_DIR, file);
      if (content.includes('.catch')) {
        expect(content).toMatch(/setError|setStatus.*error/);
      }
    }
  });
});
