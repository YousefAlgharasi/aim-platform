// P20-013 — AimFocusDirectiveService tests.
//
// Verifies the deterministic, template-based directive_text generation and
// its documented source priority (weakness_record > difficulty_decision >
// recommendation), and that no candidate leaves ai_focus_directives
// untouched rather than clearing the existing active row.

import { AimFocusDirectiveService } from './aim-focus-directive.service';
import { DatabaseService } from '../../../database/database.service';
import { SkillsService } from '../../curriculum/skills/skills.service';
import { UsersService } from '../../users/users.service';
import { StudentProfileService } from '../../students/student-profile.service';
import {
  AimValidatedCategories,
  AimValidatedDifficultyDecision,
  AimValidatedRecommendation,
  AimValidatedWeaknessRecord,
} from '../adapter/aim-response-mapper.types';

// STUDENT_ID is the raw Supabase Auth UID (this service's studentId
// parameter, matching every other AIM pipeline caller). PROFILE_ID is the
// distinct student_profiles.id that ai_focus_directives.student_id's FK
// actually requires — deliberately different values so a test fails loudly
// if the resolution step were ever dropped.
const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const INTERNAL_USER_ID = '990e8400-e29b-41d4-a716-446655440099';
const PROFILE_ID = 'aa0e8400-e29b-41d4-a716-446655440077';

function makeCategories(overrides: Partial<AimValidatedCategories> = {}): AimValidatedCategories {
  return {
    skillState: [],
    weaknessRecords: [],
    difficultyDecision: null,
    recommendations: [],
    reviewSchedule: [],
    sessionSummary: null,
    ...overrides,
  };
}

function makeWeaknessRecord(overrides: Partial<AimValidatedWeaknessRecord> = {}): AimValidatedWeaknessRecord {
  return {
    weaknessId: 'weak-1',
    skillId: 'skill:english:a1:grammar.past-simple',
    severity: 'developing',
    status: 'open',
    triggerAttemptIds: ['attempt-1'],
    detectedAt: '2026-06-17T10:00:00Z',
    resolvedAt: null,
    ...overrides,
  };
}

function makeDifficultyDecision(
  overrides: Partial<AimValidatedDifficultyDecision> = {},
): AimValidatedDifficultyDecision {
  return {
    decisionId: 'decision-1',
    skillId: 'skill:english:a1:grammar.past-simple',
    nextDifficulty: 1,
    previousDifficulty: 2,
    rationale: 'mastery_decrease',
    basedOnAttemptIds: ['attempt-1'],
    decidedAt: '2026-06-17T10:00:00Z',
    ...overrides,
  };
}

function makeRecommendation(overrides: Partial<AimValidatedRecommendation> = {}): AimValidatedRecommendation {
  return {
    recommendationId: 'rec-1',
    kind: 'review_session',
    targetSkillId: 'skill:english:a1:grammar.past-simple',
    targetLessonId: null,
    rank: 1,
    reason: 'review_due',
    basedOnWeaknessId: null,
    generatedAt: '2026-06-17T10:00:00Z',
    expiresAt: null,
    ...overrides,
  };
}

function makeService(skillTitle: string | null = 'Past Simple') {
  const query = jest.fn().mockResolvedValue({ rows: [] });
  const db = { query } as unknown as DatabaseService;

  const skills = {
    getSkillByKey: jest.fn().mockImplementation(async (key: string) => {
      if (skillTitle === null) {
        throw new Error('not found');
      }
      return { id: 'skill-uuid-1', key, title: skillTitle, description: null, domain: 'grammar', parentSkillId: null, status: 'published', createdAt: '', updatedAt: '' };
    }),
  } as unknown as SkillsService;

  const users = {
    findBySupabaseUid: jest.fn().mockResolvedValue({ id: INTERNAL_USER_ID }),
  } as unknown as UsersService;

  const studentProfiles = {
    findByUserId: jest.fn().mockResolvedValue({ id: PROFILE_ID }),
  } as unknown as StudentProfileService;

  return {
    service: new AimFocusDirectiveService(db, skills, users, studentProfiles),
    query,
    skills,
  };
}

describe('AimFocusDirectiveService', () => {
  it('generates deterministic text from a weakness record, superseding any prior active directive', async () => {
    const { service, query } = makeService('Past Simple');

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({ weaknessRecords: [makeWeaknessRecord({ severity: 'critical' })] }),
    );

    expect(query).toHaveBeenCalledTimes(2);
    const [updateSql, updateParams] = query.mock.calls[0];
    expect(updateSql).toMatch(/UPDATE ai_focus_directives SET active = false/);
    expect(updateParams).toEqual([PROFILE_ID]);

    const [insertSql, insertParams] = query.mock.calls[1];
    expect(insertSql).toMatch(/INSERT INTO ai_focus_directives/);
    const [studentId, skillId, directiveText, source, sourceId] = insertParams;
    expect(studentId).toBe(PROFILE_ID);
    expect(skillId).toBe('skill:english:a1:grammar.past-simple');
    expect(source).toBe('weakness_record');
    expect(sourceId).toBe('weak-1');
    expect(directiveText).toBe(
      'The student is showing difficulty with Past Simple (severity: critical). ' +
        'Provide extra examples and check understanding before moving on.',
    );
  });

  it('falls back to the raw skill id when no matching skill exists (never fabricates a name)', async () => {
    const { service, query } = makeService(null);

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({ weaknessRecords: [makeWeaknessRecord({ skillId: 'skill:unmapped' })] }),
    );

    const [, , directiveText] = query.mock.calls[1][1];
    expect(directiveText).toContain('skill:unmapped');
  });

  it('picks the highest-severity open weakness record when several exist', async () => {
    const { service, query } = makeService('X');

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({
        weaknessRecords: [
          makeWeaknessRecord({ weaknessId: 'w-emerging', severity: 'emerging' }),
          makeWeaknessRecord({ weaknessId: 'w-critical', severity: 'critical' }),
          makeWeaknessRecord({ weaknessId: 'w-developing', severity: 'developing' }),
        ],
      }),
    );

    const insertParams = query.mock.calls[1][1];
    expect(insertParams[4]).toBe('w-critical');
  });

  it('ignores resolved weakness records', async () => {
    const { service, query } = makeService('X');

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({
        weaknessRecords: [makeWeaknessRecord({ status: 'resolved', severity: 'critical' })],
      }),
    );

    expect(query).not.toHaveBeenCalled();
  });

  it('falls back to a mastery_decrease difficulty decision when there is no open weakness record', async () => {
    const { service, query } = makeService('Past Simple');

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({ difficultyDecision: makeDifficultyDecision() }),
    );

    const insertParams = query.mock.calls[1][1];
    expect(insertParams[3]).toBe('difficulty_decision');
    expect(insertParams[4]).toBe('decision-1');
    expect(insertParams[2]).toContain('reduced');
  });

  it('does not generate a directive for a mastery_increase difficulty decision', async () => {
    const { service, query } = makeService('X');

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({
        difficultyDecision: makeDifficultyDecision({ rationale: 'mastery_increase' }),
      }),
    );

    expect(query).not.toHaveBeenCalled();
  });

  it('falls back to the top-ranked review_due recommendation when nothing else qualifies', async () => {
    const { service, query } = makeService('Past Simple');

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({ recommendations: [makeRecommendation({ reason: 'review_due' })] }),
    );

    const insertParams = query.mock.calls[1][1];
    expect(insertParams[3]).toBe('recommendation');
    expect(insertParams[4]).toBe('rec-1');
  });

  it('does not generate a directive for a routine next_in_sequence recommendation', async () => {
    const { service, query } = makeService('X');

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({ recommendations: [makeRecommendation({ reason: 'next_in_sequence' })] }),
    );

    expect(query).not.toHaveBeenCalled();
  });

  it('leaves any existing active directive untouched when no candidate exists this run', async () => {
    const { service, query } = makeService('X');

    await service.generateAndPersist(STUDENT_ID, makeCategories());

    expect(query).not.toHaveBeenCalled();
  });

  it('prioritizes weakness records over a qualifying difficulty decision and recommendation', async () => {
    const { service, query } = makeService('X');

    await service.generateAndPersist(
      STUDENT_ID,
      makeCategories({
        weaknessRecords: [makeWeaknessRecord({ weaknessId: 'w-1' })],
        difficultyDecision: makeDifficultyDecision(),
        recommendations: [makeRecommendation({ reason: 'review_due' })],
      }),
    );

    const insertParams = query.mock.calls[1][1];
    expect(insertParams[3]).toBe('weakness_record');
    expect(insertParams[4]).toBe('w-1');
  });
});
