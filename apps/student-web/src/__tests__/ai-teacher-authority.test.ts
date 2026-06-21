import * as fs from 'fs';
import * as path from 'path';

const AI_TEACHER_DIR = path.resolve(__dirname, '../features/ai-teacher');

const PROHIBITED_PATTERNS = [
  /mastery\s*=\s*.*\+/i,
  /mastery\s*\+=\s*/i,
  /progress\s*=\s*.*\+/i,
  /progress\s*\+=\s*/i,
  /score\s*=\s*.*\+/i,
  /score\s*\+=\s*/i,
  /supabase\.from\(/,
  /supabase\.rpc\(/,
  /createClient\(.*SERVICE_ROLE/i,
  /aim-engine/i,
  /openai\./i,
  /anthropic\./i,
  /OPENAI_API_KEY/,
  /ANTHROPIC_API_KEY/,
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

describe('AI Teacher Authority Rules', () => {
  const files = getAllTsFiles(AI_TEACHER_DIR);

  test('AI teacher files exist', () => {
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

  test('messages sent through API client only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('message') && content.includes('send')) {
        expect(content).toMatch(/apiClient\.post/);
      }
    }
  });

  test('conversation history from API only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('conversations') && content.includes('fetch')) {
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
