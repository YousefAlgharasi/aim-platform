// P12-067: Parent UI No-Authority Tests
// Verifies the parent UI never computes mastery, scores, progress, weakness, or recommendations client-side.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const COMPONENTS_DIR = path.resolve(__dirname, '..', 'components');

const FORBIDDEN_PATTERNS = [
  /Math\.(round|floor|ceil|min|max)\s*\([^)]*score/i,
  /mastery\s*[=<>!]+\s*\d/i,
  /\.reduce\s*\(/,
  /\.sort\s*\(\s*\(/,
  /calculateProgress/i,
  /computeMastery/i,
  /computeScore/i,
  /generateRecommendation/i,
  /weakness.*=.*filter/i,
  /averageScore/i,
  /totalScore/i,
];

function getJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.endsWith('.test.js'));
}

function scanFiles(dir) {
  const files = getJsFiles(dir);
  const violations = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    for (const pattern of FORBIDDEN_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        violations.push({ file, pattern: pattern.toString(), match: match[0] });
      }
    }
  }
  return violations;
}

describe('Parent UI No-Authority', () => {
  test('page components do not compute mastery, scores, or recommendations', () => {
    const violations = scanFiles(PAGES_DIR);
    expect(violations).toEqual([]);
  });

  test('shared components do not compute mastery, scores, or recommendations', () => {
    const violations = scanFiles(COMPONENTS_DIR);
    expect(violations).toEqual([]);
  });

  test('all data comes from API client, not local computation', () => {
    const files = getJsFiles(PAGES_DIR);
    for (const file of files) {
      const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8');
      if (content.includes('useState') && content.includes('useEffect')) {
        const hasApiImport = content.includes("from '../api'") || content.includes("from '../api/");
        if (content.match(/set\w+\(data/)) {
          expect(hasApiImport).toBe(true);
        }
      }
    }
  });
});
