// P18-058: Add No AI Authority Regression Tests
//
// Static regression guard for docs/phase-8/no-aim-replacement-rule.md and
// docs/phase-9/no-aim-authority-change-rule.md: the AI Teacher and Voice
// Tutor backend code (ai-teacher/, voice-teacher/) must never write
// mastery, weakness, difficulty, recommendation, review-schedule, progress,
// assessment-result, or placement-result data directly — those remain the
// AIM Engine's exclusive write authority (features/aim/, features/
// assessments/, features/placement/).
//
// Unlike the many existing per-service "never leaks mastery/weakness/..."
// response-shape tests scattered across ai-teacher/voice-teacher specs
// (which check what is returned to the client), this suite statically
// scans the AI Teacher/Voice Tutor source trees for any SQL write
// statement or AIM-table reference that would indicate the rule has been
// violated, so a future change cannot silently reintroduce a write path.

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const AI_TEACHER_ROOT = join(__dirname, '..');
const VOICE_TEACHER_ROOT = join(__dirname, '../../voice-teacher');

const FORBIDDEN_AIM_TABLES = [
  'mastery',
  'weaknesses',
  'recommendations',
  'review_schedule',
  'progress',
  'assessment_results',
  'placement_results',
  'curriculum_state',
];

const WRITE_VERBS = ['INSERT INTO', 'UPDATE', 'DELETE FROM'];

function listSourceFiles(root: string): string[] {
  const files: string[] = [];

  function walk(dir: string): void {
    for (const entry of readdirSync(dir)) {
      if (entry === 'tests' || entry === 'node_modules') continue;
      const fullPath = join(dir, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts')) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files;
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('AI Teacher / Voice Tutor — no AIM authority write regression', () => {
  const aiTeacherFiles = listSourceFiles(AI_TEACHER_ROOT);
  const voiceTeacherFiles = listSourceFiles(VOICE_TEACHER_ROOT);
  const allFiles = [...aiTeacherFiles, ...voiceTeacherFiles];

  it('scans a non-trivial number of source files (sanity check that the scan is not vacuous)', () => {
    expect(allFiles.length).toBeGreaterThan(20);
  });

  it.each(FORBIDDEN_AIM_TABLES)(
    'never issues a SQL write (INSERT/UPDATE/DELETE) against the "%s" AIM table',
    (table) => {
      const offendingFiles: string[] = [];

      for (const file of allFiles) {
        const codeOnly = stripComments(readFileSync(file, 'utf8'));
        for (const verb of WRITE_VERBS) {
          const pattern = new RegExp(`${verb}\\s+(?:INTO\\s+)?${table}\\b`, 'i');
          if (pattern.test(codeOnly)) {
            offendingFiles.push(`${file} (${verb})`);
          }
        }
      }

      expect(offendingFiles).toEqual([]);
    },
  );

  it('never imports a repository or service from features/aim, features/assessments, or features/placement', () => {
    const forbiddenImportRoots = ['features/aim/', 'features/assessments/', 'features/placement/'];
    const offendingImports: string[] = [];

    for (const file of allFiles) {
      const codeOnly = stripComments(readFileSync(file, 'utf8'));
      for (const root of forbiddenImportRoots) {
        if (codeOnly.includes(root)) {
          offendingImports.push(`${file} imports from ${root}`);
        }
      }
    }

    expect(offendingImports).toEqual([]);
  });

  it('never defines a method named set/update/write/record/save Mastery|Weakness|Recommendation|ReviewSchedule|Progress', () => {
    const forbiddenMethodPattern =
      /\b(set|update|write|record|save)(Mastery|Weakness|Recommendation|ReviewSchedule|Progress|AssessmentResult|PlacementResult)\s*\(/i;
    const offendingMethods: string[] = [];

    for (const file of allFiles) {
      const codeOnly = stripComments(readFileSync(file, 'utf8'));
      if (forbiddenMethodPattern.test(codeOnly)) {
        offendingMethods.push(file);
      }
    }

    expect(offendingMethods).toEqual([]);
  });
});
