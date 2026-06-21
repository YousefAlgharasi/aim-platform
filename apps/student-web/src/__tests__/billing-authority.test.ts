import * as fs from 'fs';
import * as path from 'path';

const BILLING_DIR = path.resolve(__dirname, '../features/billing');

const PROHIBITED_PATTERNS = [
  /entitlement\s*=\s*/i,
  /isSubscribed\s*=\s*.*plan/i,
  /chargeCard\s*\(/i,
  /processPayment\s*\(/i,
  /stripe\./i,
  /STRIPE_SECRET/i,
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

describe('Billing Authority Rules', () => {
  const files = getAllTsFiles(BILLING_DIR);

  test('billing files exist', () => {
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

  test('checkout uses API client only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('checkout') && content.includes('confirm')) {
        expect(content).toMatch(/apiClient\.post/);
      }
    }
  });

  test('billing data from API only', () => {
    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('billing') && content.includes('fetch')) {
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
