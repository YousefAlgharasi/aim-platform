import * as fs from 'fs';
import * as path from 'path';

const PLACEMENT_DIR = path.resolve(__dirname, '../features/placement');

const PROHIBITED_PATTERNS = [
  /score\s*=\s*.*\+/i,
  /score\s*\+=\s*/i,
  /isCorrect\s*=\s*.*===.*correct/i,
  /passResult\s*=\s*.*>=\s*threshold/i,
  /level\s*=\s*.*score\s*[><=]/i,
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

describe('Placement Authority Rules', () => {
  const files = getAllTsFiles(PLACEMENT_DIR);

  test('placement files exist', () => {
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

  test('placement submit uses API client only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('answer') && content.includes('submit')) {
        expect(content).toMatch(/apiClient\.post/);
      }
    }
  });

  test('placement result comes from API', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('result') && content.includes('level')) {
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
