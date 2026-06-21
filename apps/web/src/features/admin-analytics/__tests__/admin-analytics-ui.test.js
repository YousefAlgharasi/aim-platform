// P15-067: Admin Analytics UI Tests
// Verifies the admin analytics UI (P15-057 through P15-066) never computes
// metrics, aggregates, reports, or exports client-side, always renders
// backend-approved loading/empty/error/forbidden states, uses the API
// client for all data, and follows AIM design system tokens.

import fs from 'fs';
import path from 'path';

const FEATURE_DIR = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(FEATURE_DIR, 'pages');
const COMPONENTS_DIR = path.join(FEATURE_DIR, 'components');
const API_DIR = path.join(FEATURE_DIR, 'api');

const PAGE_FILES = [
  'AdminPlatformOverview.js',
  'AdminLearningReports.js',
  'AdminCurriculumReports.js',
  'AdminAssessmentReports.js',
  'AdminNotificationReports.js',
  'AdminRevenueReports.js',
  'AdminUserReports.js',
  'AdminExportManager.js',
];

const COMPONENT_FILES = [
  'AnalyticsKpiCard.js',
  'AnalyticsChartShell.js',
  'AnalyticsTableShell.js',
  'AnalyticsFilterBar.js',
  'AnalyticsPageLayout.js',
];

const FORBIDDEN_AUTHORITY_PATTERNS = [
  /computeMetric/i,
  /calculateScore/i,
  /calculateAverage/i,
  /computeAggregate/i,
  /aggregateMetric/i,
  /sumRevenue/i,
  /countUsers\b/i,
  /computeProgress/i,
  /gradeAssessment/i,
  /computeMastery/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Admin Analytics Feature Structure', () => {
  test('feature shell exists', () => {
    expect(fs.existsSync(path.join(FEATURE_DIR, 'AdminAnalyticsShell.js'))).toBe(true);
  });

  test('feature shell CSS exists', () => {
    expect(fs.existsSync(path.join(FEATURE_DIR, 'AdminAnalyticsShell.css'))).toBe(true);
  });

  test('feature index barrel exists', () => {
    expect(fs.existsSync(path.join(FEATURE_DIR, 'index.js'))).toBe(true);
  });

  test('all page files exist', () => {
    for (const file of PAGE_FILES) {
      expect(fs.existsSync(path.join(PAGES_DIR, file))).toBe(true);
    }
  });

  test('all component files exist', () => {
    for (const file of COMPONENT_FILES) {
      expect(fs.existsSync(path.join(COMPONENTS_DIR, file))).toBe(true);
    }
  });

  test('API client exists', () => {
    expect(fs.existsSync(path.join(API_DIR, 'adminAnalyticsApiClient.js'))).toBe(true);
  });
});

describe('Admin Analytics — No Client Authority', () => {
  test('pages do not compute metrics, scores, aggregates, or grades locally', () => {
    for (const file of PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      for (const pattern of FORBIDDEN_AUTHORITY_PATTERNS) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  test('components do not compute authoritative values', () => {
    for (const file of COMPONENT_FILES) {
      const content = readFile(COMPONENTS_DIR, file);
      for (const pattern of FORBIDDEN_AUTHORITY_PATTERNS) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  test('shell does not compute authoritative values', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.js');
    for (const pattern of FORBIDDEN_AUTHORITY_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });
});

describe('Admin Analytics — API Usage', () => {
  test('all pages import data via the API client', () => {
    for (const file of PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content).toMatch(/from ['"]\.\.\/api['"]/);
    }
  });

  test('API client uses admin analytics route prefix', () => {
    const content = readFile(API_DIR, 'adminAnalyticsApiClient.js');
    expect(content).toContain('/api/analytics/admin');
  });

  test('API client sends Authorization header', () => {
    const content = readFile(API_DIR, 'adminAnalyticsApiClient.js');
    expect(content).toContain('Authorization');
    expect(content).toContain('Bearer');
  });

  test('API client handles error responses', () => {
    const content = readFile(API_DIR, 'adminAnalyticsApiClient.js');
    expect(content).toMatch(/response\.ok/);
    expect(content).toMatch(/throw/);
  });

  test('API client does not override requester identity', () => {
    const content = readFile(API_DIR, 'adminAnalyticsApiClient.js');
    expect(content).not.toMatch(/requestedByUserId\s*:\s*['"]/);
    expect(content).not.toMatch(/userId:\s*['"]/);
  });
});

describe('Admin Analytics — State Handling', () => {
  test('shell handles loading, error, empty, and forbidden states', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.js');
    expect(content).toMatch(/loading/);
    expect(content).toMatch(/error/i);
    expect(content).toMatch(/empty/);
    expect(content).toMatch(/forbidden/);
  });

  test('pages handle loading, error, and empty states', () => {
    for (const file of PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content.toLowerCase()).toMatch(/loading/);
      expect(content.toLowerCase()).toMatch(/error/);
      expect(content.toLowerCase()).toMatch(/empty/);
    }
  });

  test('pages detect 403 and show forbidden state', () => {
    for (const file of PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content).toMatch(/403/);
      expect(content).toMatch(/forbidden/);
    }
  });
});

describe('Admin Analytics — Accessibility', () => {
  test('shell has Arabic aria-label attributes', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.js');
    expect(content).toMatch(/aria-label/);
    expect(content).toMatch(/لوحة التحليلات/);
  });

  test('shell uses role attributes for status messages', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.js');
    expect(content).toMatch(/role="status"/);
    expect(content).toMatch(/role="alert"/);
  });

  test('shell supports dir="auto" for RTL', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.js');
    expect(content).toMatch(/dir="auto"/);
  });

  test('sidebar navigation has aria-current for active page', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.js');
    expect(content).toMatch(/aria-current/);
  });
});

describe('Admin Analytics — Design System', () => {
  test('shell CSS uses design system tokens', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.css');
    expect(content).toMatch(/--color-/);
    expect(content).toMatch(/--space-/);
  });

  test('components CSS uses design system tokens', () => {
    const content = readFile(COMPONENTS_DIR, 'AnalyticsComponents.css');
    expect(content).toMatch(/--color-/);
    expect(content).toMatch(/--space-/);
  });

  test('shell CSS uses RTL-safe properties', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.css');
    expect(content).toMatch(/border-inline|inset-inline|margin-inline|padding-inline/);
  });

  test('shell CSS has responsive breakpoint', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.css');
    expect(content).toMatch(/@media/);
    expect(content).toMatch(/max-width/);
  });
});

describe('Admin Analytics — Navigation', () => {
  test('shell defines nav items for all report sections', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.js');
    expect(content).toMatch(/overview/);
    expect(content).toMatch(/learning/);
    expect(content).toMatch(/curriculum/);
    expect(content).toMatch(/assessment/i);
    expect(content).toMatch(/notification/i);
    expect(content).toMatch(/revenue/i);
    expect(content).toMatch(/user/i);
    expect(content).toMatch(/export/i);
  });

  test('shell has mobile menu toggle', () => {
    const content = readFile(FEATURE_DIR, 'AdminAnalyticsShell.js');
    expect(content).toMatch(/mobileMenuOpen/);
    expect(content).toMatch(/setMobileMenuOpen/);
  });
});

describe('Admin Analytics — Export Manager', () => {
  test('export manager imports export API functions', () => {
    const content = readFile(PAGES_DIR, 'AdminExportManager.js');
    expect(content).toMatch(/listExports|createExport|getExportStatus/);
  });

  test('export manager does not generate export data locally', () => {
    const content = readFile(PAGES_DIR, 'AdminExportManager.js');
    expect(content).not.toMatch(/generateCsv/i);
    expect(content).not.toMatch(/generateXlsx/i);
    expect(content).not.toMatch(/new Blob/i);
  });

  test('export manager has format selection', () => {
    const content = readFile(PAGES_DIR, 'AdminExportManager.js');
    expect(content).toMatch(/csv|xlsx|json/i);
  });
});
