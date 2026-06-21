// P15-071: Parent Reporting UI Tests
// Verifies the parent analytics reporting UI (P15-068/069/070) never
// computes report content, progress, or assessment outcomes client-side,
// always renders backend-approved loading/empty/error states, and never
// lets a parent view a report run that is not their own.

import fs from 'fs';
import path from 'path';

const PAGES_DIR = path.resolve(__dirname, '..', 'pages');
const API_DIR = path.resolve(__dirname, '..', 'api');

const REPORTING_PAGE_FILES = [
  'ParentAnalyticsReports.js',
  'ParentProgressReport.js',
  'ParentAssessmentReport.js',
];

const FORBIDDEN_AUTHORITY_PATTERNS = [
  /computeProgress/i,
  /calculateScore/i,
  /gradeAssessment/i,
  /computeMastery/i,
  /aggregateMetric/i,
];

function readFile(dir, name) {
  const filePath = path.join(dir, name);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
}

describe('Parent Reporting UI', () => {
  test('reporting pages exist', () => {
    for (const file of REPORTING_PAGE_FILES) {
      expect(fs.existsSync(path.join(PAGES_DIR, file))).toBe(true);
    }
  });

  test('reporting pages do not compute progress, scores, grades, or aggregates locally', () => {
    for (const file of REPORTING_PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      for (const pattern of FORBIDDEN_AUTHORITY_PATTERNS) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  test('reporting pages only import data via the api client', () => {
    for (const file of REPORTING_PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content).toMatch(/from '\.\.\/api'/);
    }
  });

  test('reporting pages handle loading, error, and empty states', () => {
    for (const file of REPORTING_PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content.toLowerCase()).toMatch(/loading/);
      expect(content.toLowerCase()).toMatch(/error/);
      expect(content.toLowerCase()).toMatch(/empty/);
    }
  });

  test('analytics report API client always uses the parent analytics reports route prefix', () => {
    const content = readFile(API_DIR, 'parentAnalyticsApiClient.js');
    expect(content).toContain('/api/v1/parent/analytics/reports');
    expect(content).toContain('Authorization');
    expect(content).toContain('Bearer');
  });

  test('analytics report API client never overrides the requester identity', () => {
    const content = readFile(API_DIR, 'parentAnalyticsApiClient.js');
    expect(content).not.toMatch(/requestedByUserId/i);
    expect(content).not.toMatch(/userId:\s*['"]/);
  });

  test('progress report page scopes the report run to the learning-progress report key', () => {
    const content = readFile(PAGES_DIR, 'ParentProgressReport.js');
    expect(content).toMatch(/learning-progress/);
  });

  test('progress report page forwards childId as a parameter rather than a forbidden scope override', () => {
    const content = readFile(PAGES_DIR, 'ParentProgressReport.js');
    expect(content).toMatch(/childId\s*\?\s*\{\s*childId\s*\}/);
  });

  test('assessment report page only lists report definitions filtered to the assessment category', () => {
    const content = readFile(PAGES_DIR, 'ParentAssessmentReport.js');
    expect(content).toMatch(/category === ASSESSMENT_CATEGORY/);
    expect(content).toMatch(/ASSESSMENT_CATEGORY\s*=\s*'assessment'/);
  });

  test('reports list page renders run status via badges rather than inventing its own status labels for unknown states', () => {
    const content = readFile(PAGES_DIR, 'ParentAnalyticsReports.js');
    expect(content).toMatch(/STATUS_LABEL\[run\.status\] \|\| run\.status/);
  });

  test('reporting pages never hardcode another user id when running or fetching a report', () => {
    for (const file of REPORTING_PAGE_FILES) {
      const content = readFile(PAGES_DIR, file);
      expect(content).not.toMatch(/requestedByUserId\s*:\s*['"]/);
    }
  });
});
