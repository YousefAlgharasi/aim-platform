import * as fs from 'fs';
import * as path from 'path';

const ASSESSMENT_DIR = path.resolve(__dirname, '../features/assessments');

const PROHIBITED_PATTERNS = [
  /score\s*=\s*.*\+/i,
  /score\s*\+=\s*/i,
  /isCorrect\s*=\s*.*===.*correct/i,
  /passed\s*=\s*.*>=\s*threshold/i,
  /grade\s*=\s*.*score\s*[><=]/i,
  /mastery\s*=\s*.*\+/i,
  /mastery\s*\+=\s*/i,
  /deadline\s*=\s*.*new\s+Date/i,
  /isExpired\s*=\s*.*Date\.now/i,
  /supabase\.from\(/,
  /supabase\.rpc\(/,
  /createClient\(.*SERVICE_ROLE/i,
  /aim-engine/i,
];

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.test.')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Assessment Authority Rules', () => {
  const files = getAllTsFiles(ASSESSMENT_DIR);

  test('assessment files exist', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test.each(PROHIBITED_PATTERNS)(
    'no file contains prohibited pattern: %s',
    (pattern) => {
      for (const filePath of files) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const match = content.match(pattern);
        expect(match).toBeNull();
      }
    }
  );

  test('attempt start uses API client only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('attempt') && content.includes('start')) {
        expect(content).toMatch(/apiClient\.post/);
      }
    }
  });

  test('attempt submit uses API client only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('submit') && content.includes('answers')) {
        expect(content).toMatch(/apiClient\.post/);
      }
    }
  });

  test('result comes from API only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('result') && content.includes('score')) {
        expect(content).toMatch(/apiClient\.get/);
      }
    }
  });

  test('no direct database imports', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/@supabase\/supabase-js/);
    }
  });
});
