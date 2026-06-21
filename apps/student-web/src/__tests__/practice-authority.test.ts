import * as fs from 'fs';
import * as path from 'path';

const PRACTICE_DIR = path.resolve(__dirname, '../features/practice');

const PROHIBITED_PATTERNS = [
  /score\s*=\s*.*\+/i,
  /score\s*\+=\s*/i,
  /isCorrect\s*=\s*.*===.*correct/i,
  /mastery\s*=\s*.*\+/i,
  /mastery\s*\+=\s*/i,
  /weakness\s*=\s*.*filter/i,
  /difficulty\s*=\s*.*calc/i,
  /recommendation\s*=\s*.*score/i,
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

describe('Practice Authority Rules', () => {
  const files = getAllTsFiles(PRACTICE_DIR);

  test('practice files exist', () => {
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

  test('practice submit uses API client only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('submit') && content.includes('answer')) {
        expect(content).toMatch(/apiClient\.post/);
      }
    }
  });

  test('feedback comes from API response only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('feedback') && content.includes('correct')) {
        expect(content).not.toMatch(/===\s*['"]correct['"]/);
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
