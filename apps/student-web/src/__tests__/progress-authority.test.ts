import * as fs from 'fs';
import * as path from 'path';

const FEATURES_DIR = path.resolve(__dirname, '../features');

const PROHIBITED_PATTERNS = [
  /mastery\s*=\s*.*correct.*\/.*total/i,
  /mastery\s*=\s*.*\.filter\(/i,
  /score\s*=\s*.*\+/i,
  /score\s*\+=\s*/i,
  /isCorrect\s*=\s*.*===.*correctAnswer/i,
  /passResult\s*=\s*.*>=\s*threshold/i,
  /weakness\s*=\s*.*\.sort\(/i,
  /recommendation\s*=\s*.*findWeakest/i,
  /reviewDate\s*=\s*.*interval/i,
  /difficulty\s*=\s*.*adjust/i,
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

describe('Progress Authority Rules', () => {
  const dashboardFiles = getAllTsFiles(path.join(FEATURES_DIR, 'dashboard'));
  const progressFiles = getAllTsFiles(path.join(FEATURES_DIR, 'progress'));
  const allFiles = [...dashboardFiles, ...progressFiles];

  test('dashboard and progress files exist', () => {
    expect(allFiles.length).toBeGreaterThan(0);
  });

  test.each(PROHIBITED_PATTERNS)(
    'no file contains prohibited pattern: %s',
    (pattern) => {
      for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const match = content.match(pattern);
        expect(match).toBeNull();
      }
    }
  );

  test('all progress values come from API calls', () => {
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('mastery') || content.includes('completion') || content.includes('streak')) {
        expect(content).toMatch(/apiClient\.get|apiClient\.post/);
      }
    }
  });

  test('no direct database imports in dashboard/progress', () => {
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/@supabase\/supabase-js/);
      expect(content).not.toMatch(/createClient/);
    }
  });
});
