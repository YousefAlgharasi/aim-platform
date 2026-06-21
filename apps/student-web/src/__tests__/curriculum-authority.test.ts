import * as fs from 'fs';
import * as path from 'path';

const CURRICULUM_DIR = path.resolve(__dirname, '../features/curriculum');
const LESSONS_DIR = path.resolve(__dirname, '../features/lessons');

const PROHIBITED_PATTERNS = [
  /mastery\s*=\s*.*\+/i,
  /mastery\s*\+=\s*/i,
  /isComplete\s*=\s*.*===.*finished/i,
  /progress\s*=\s*.*count\s*\/\s*total/i,
  /score\s*=\s*.*\+/i,
  /score\s*\+=\s*/i,
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

describe('Curriculum Authority Rules', () => {
  const curriculumFiles = getAllTsFiles(CURRICULUM_DIR);
  const lessonFiles = getAllTsFiles(LESSONS_DIR);
  const allFiles = [...curriculumFiles, ...lessonFiles];

  test('curriculum and lesson files exist', () => {
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

  test('lesson completion uses API client only', () => {
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('complete') && content.includes('lesson')) {
        expect(content).toMatch(/apiClient\.(post|get)/);
      }
    }
  });

  test('progress sync uses API client only', () => {
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('progress') && content.includes('sync')) {
        expect(content).toMatch(/apiClient\.post/);
      }
    }
  });

  test('no direct database imports', () => {
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toMatch(/@supabase\/supabase-js/);
    }
  });
});
