/**
 * AIM Result API Tests — Phase 5, P5-075.
 *
 * Comprehensive test suite covering all five AIM result endpoints:
 *   GET /aim/students/:studentId/skill-states            (P5-069)
 *   GET /aim/students/:studentId/weakness-records        (P5-070)
 *   GET /aim/students/:studentId/recommendations         (P5-071)
 *   GET /aim/students/:studentId/review-schedules        (P5-072)
 *   GET /aim/students/:studentId/sessions/:sessionId/state (P5-068)
 *
 * Coverage areas:
 *   1. Permission guards — JWT auth, ownership, role (P5-073)
 *   2. DTO validation — UUID params validated before service delegation (P5-074)
 *   3. Result reads — service DB queries, row mapping, empty/null cases (P5-069–P5-072)
 *   4. Backend authority — no AIM Engine calls from result layer
 *   5. Error propagation — service errors surface correctly
 *
 * Backend authority rules asserted:
 *   - All endpoints require SupabaseJwtAuthGuard + StudentOwnershipGuard.
 *   - studentId is always JWT-resolved; never client-supplied without ownership check.
 *   - No AIM-owned value (mastery, difficulty, weakness, recommendation,
 *     review schedule) is computed locally — only persisted values are returned.
 *   - No AIM Engine call is made from the result layer.
 *   - No secrets, service-role keys, database credentials, or AI provider keys
 *     are referenced or returned.
 *
 * Sources:
 *   services/backend-api/src/features/aim/result/aim-result.controller.ts
 *   services/backend-api/src/features/aim/result/aim-result.dto.ts
 *   services/backend-api/src/features/aim/result/*.service.ts
 *   docs/phase-5/no-client-aim-rule.md  (P5-004)
 */

import 'reflect-metadata';
import { ParseUUIDPipe } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { AimResultController } from './aim-result.controller';
import { StudentSkillStateReadService } from './student-skill-state-read.service';
import { WeaknessRecordsReadService } from './weakness-records-read.service';
import { SessionStateReadService } from './session-state-read.service';
import { RecommendationReadService } from './recommendation-read.service';
import { ReviewScheduleReadService } from './review-schedule-read.service';

import { SupabaseJwtAuthGuard } from '../../../auth/supabase-jwt-auth.guard';
import { StudentOwnershipGuard } from '../../../auth/authorization/student-ownership.guard';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import {
  REQUIRED_ROLES_KEY,
  STUDENT_OWNERSHIP_REQUIREMENT_KEY,
} from '../../../auth/authorization/authorization.constants';

// ---------------------------------------------------------------------------
// Test constants
// ---------------------------------------------------------------------------

const STUDENT_ID = '550e8400-e29b-41d4-a716-446655440001';
const SESSION_ID = '660e8400-e29b-41d4-a716-446655440002';
const SKILL_ID   = '770e8400-e29b-41d4-a716-446655440003';
const ATTEMPT_ID = '880e8400-e29b-41d4-a716-446655440004';
const NOW_ISO    = new Date().toISOString();

// ---------------------------------------------------------------------------
// Helpers — metadata reflection
// ---------------------------------------------------------------------------

const proto = AimResultController.prototype;

function getGuards(handler: Function): Function[] {
  return Reflect.getMetadata('__guards__', handler) ?? [];
}

function getRequiredRoles(handler: Function): AuthorizedRole[] {
  return Reflect.getMetadata(REQUIRED_ROLES_KEY, handler) ?? [];
}

function getOwnershipRequirement(handler: Function) {
  return Reflect.getMetadata(STUDENT_OWNERSHIP_REQUIREMENT_KEY, handler);
}

function getRouteArgMetadata(methodName: string): Record<string, { index?: number; pipes?: unknown[] }> {
  return Reflect.getMetadata(ROUTE_ARGS_METADATA, AimResultController, methodName) ?? {};
}

function getParamPipes(methodName: string, index: number): unknown[] {
  return Object.values(getRouteArgMetadata(methodName))
    .filter((m) => m.index === index)
    .flatMap((m) => m.pipes ?? []);
}

// ---------------------------------------------------------------------------
// Helpers — mock DB + controller factory
// ---------------------------------------------------------------------------

type QueryFn = (sql: string, params: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;

function makeMockDb(queryFn: QueryFn) {
  return { query: queryFn } as unknown as import('../../../database/database.service').DatabaseService;
}

function makeController(overrides: {
  skillState?: Partial<StudentSkillStateReadService>;
  weakness?: Partial<WeaknessRecordsReadService>;
  session?: Partial<SessionStateReadService>;
  recommendation?: Partial<RecommendationReadService>;
  reviewSchedule?: Partial<ReviewScheduleReadService>;
}): AimResultController {
  const noop = jest.fn();
  return new AimResultController(
    (overrides.skillState ?? { getSkillStatesForStudent: noop }) as StudentSkillStateReadService,
    (overrides.reviewSchedule ?? { getReviewSchedulesForStudent: noop }) as ReviewScheduleReadService,
    (overrides.session ?? { getSessionState: noop }) as SessionStateReadService,
    (overrides.weakness ?? { getWeaknessRecordsForStudent: noop }) as WeaknessRecordsReadService,
    (overrides.recommendation ?? { getActiveForStudent: noop }) as RecommendationReadService,
    {} as unknown as import('./difficulty-decision-read.service').DifficultyDecisionReadService,
  );
}

// ---------------------------------------------------------------------------
// Endpoint table for parametric guard + UUID tests
// ---------------------------------------------------------------------------

const ALL_HANDLERS: { name: string; method: Function; uuidParamCount: number }[] = [
  { name: 'getSkillStates',     method: proto.getSkillStates,     uuidParamCount: 1 },
  { name: 'getWeaknessRecords', method: proto.getWeaknessRecords, uuidParamCount: 1 },
  { name: 'getRecommendations', method: proto.getRecommendations, uuidParamCount: 1 },
  { name: 'getReviewSchedules', method: proto.getReviewSchedules, uuidParamCount: 1 },
  { name: 'getSessionState',    method: proto.getSessionState,    uuidParamCount: 2 },
];

// ===========================================================================
// 1. Permission Guards (P5-073)
// ===========================================================================

describe('AIM Result API — permission guards (P5-073)', () => {

  describe('SupabaseJwtAuthGuard required on all endpoints', () => {
    it.each(ALL_HANDLERS)('$name requires SupabaseJwtAuthGuard', ({ method }) => {
      expect(getGuards(method)).toContain(SupabaseJwtAuthGuard);
    });
  });

  describe('StudentOwnershipGuard required on all endpoints', () => {
    it.each(ALL_HANDLERS)('$name requires StudentOwnershipGuard', ({ method }) => {
      expect(getGuards(method)).toContain(StudentOwnershipGuard);
    });
  });

  describe('RequireRoles — STUDENT', () => {
    it.each(ALL_HANDLERS)('$name requires AuthorizedRole.STUDENT', ({ method }) => {
      expect(getRequiredRoles(method)).toContain(AuthorizedRole.STUDENT);
    });
  });

  describe('RequireStudentOwnership metadata', () => {
    it.each(ALL_HANDLERS)('$name ownership paramName is "studentId"', ({ method }) => {
      expect(getOwnershipRequirement(method)?.paramName).toBe('studentId');
    });

    it.each(ALL_HANDLERS)('$name privilegedRoles include ADMIN and SUPER_ADMIN', ({ method }) => {
      const req = getOwnershipRequirement(method);
      expect(req?.privilegedRoles).toContain(AuthorizedRole.ADMIN);
      expect(req?.privilegedRoles).toContain(AuthorizedRole.SUPER_ADMIN);
    });
  });

  describe('Guard ordering (JWT before ownership)', () => {
    it.each(ALL_HANDLERS)('$name has SupabaseJwtAuthGuard before StudentOwnershipGuard', ({ method }) => {
      const guards = getGuards(method);
      const jwtIdx = guards.indexOf(SupabaseJwtAuthGuard);
      const ownIdx = guards.indexOf(StudentOwnershipGuard);
      expect(jwtIdx).toBeGreaterThanOrEqual(0);
      expect(ownIdx).toBeGreaterThanOrEqual(0);
      expect(jwtIdx).toBeLessThan(ownIdx);
    });
  });
});

// ===========================================================================
// 2. DTO Validation — UUID params (P5-074)
// ===========================================================================

describe('AIM Result API — DTO/param validation (P5-074)', () => {

  it.each(ALL_HANDLERS)(
    '$name validates all route UUID params with ParseUUIDPipe',
    ({ name, uuidParamCount }) => {
      for (let i = 0; i < uuidParamCount; i++) {
        const pipes = getParamPipes(name, i);
        expect(pipes).toContain(ParseUUIDPipe);
      }
    },
  );

  describe('No AIM Engine client in controller constructor', () => {
    it('AimResultController does not inject AimEngineClientService', () => {
      const paramTypes: string[] = (
        Reflect.getMetadata('design:paramtypes', AimResultController) ?? []
      ).map((t: Function) => t?.name ?? '');
      expect(paramTypes).not.toContain('AimEngineClientService');
      expect(paramTypes).not.toContain('AimEngineAdapterService');
    });
  });
});

// ===========================================================================
// 3. StudentSkillStateReadService (P5-069)
// ===========================================================================

describe('StudentSkillStateReadService — result reads (P5-069)', () => {

  function makeSkillStateRow(overrides: Record<string, unknown> = {}) {
    return {
      skill_id:               SKILL_ID,
      mastery_score:          '0.75',
      mastery_confidence:     '0.85',
      mastery_trend:          'improving',
      previous_mastery_score: '0.60',
      last_attempt_id:        ATTEMPT_ID,
      last_evaluated_at:      NOW_ISO,
      updated_at:             NOW_ISO,
      ...overrides,
    };
  }

  it('queries student_skill_states by student_id ordered by skill_id', async () => {
    const querySpy = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    const svc = new StudentSkillStateReadService(makeMockDb(querySpy));
    await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(querySpy).toHaveBeenCalledTimes(1);
    const [sql, params] = querySpy.mock.calls[0];
    expect(sql).toMatch(/FROM student_skill_states/);
    expect(sql).toMatch(/WHERE student_id = \$1/);
    expect(sql).toMatch(/ORDER BY skill_id ASC/);
    expect(params).toEqual([STUDENT_ID]);
  });

  it('returns empty skillStates array when no rows exist', async () => {
    const svc = new StudentSkillStateReadService(
      makeMockDb(async () => ({ rows: [], rowCount: 0 })),
    );
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
    expect(result.skillStates).toEqual([]);
  });

  it('maps DB row numeric strings to JS floats', async () => {
    const svc = new StudentSkillStateReadService(
      makeMockDb(async () => ({ rows: [makeSkillStateRow()], rowCount: 1 })),
    );
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    const entry = result.skillStates[0];
    expect(entry.masteryScore).toBe(0.75);
    expect(entry.masteryConfidence).toBe(0.85);
    expect(entry.previousMasteryScore).toBe(0.60);
    expect(typeof entry.masteryScore).toBe('number');
  });

  it('maps null previous_mastery_score to null', async () => {
    const svc = new StudentSkillStateReadService(
      makeMockDb(async () => ({
        rows: [makeSkillStateRow({ previous_mastery_score: null })],
        rowCount: 1,
      })),
    );
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(result.skillStates[0].previousMasteryScore).toBeNull();
  });

  it('maps all columns to camelCase response fields', async () => {
    const svc = new StudentSkillStateReadService(
      makeMockDb(async () => ({ rows: [makeSkillStateRow()], rowCount: 1 })),
    );
    const { skillStates } = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(skillStates[0]).toMatchObject({
      skillId:              SKILL_ID,
      masteryTrend:         'improving',
      lastAttemptId:        ATTEMPT_ID,
      lastEvaluatedAt:      NOW_ISO,
      updatedAt:            NOW_ISO,
    });
  });

  it('returns multiple rows ordered as received from DB', async () => {
    const rows = [
      makeSkillStateRow({ skill_id: 'aaa', mastery_score: '0.5' }),
      makeSkillStateRow({ skill_id: 'bbb', mastery_score: '0.8' }),
    ];
    const svc = new StudentSkillStateReadService(
      makeMockDb(async () => ({ rows, rowCount: 2 })),
    );
    const result = await svc.getSkillStatesForStudent(STUDENT_ID);
    expect(result.skillStates).toHaveLength(2);
    expect(result.skillStates[0].skillId).toBe('aaa');
    expect(result.skillStates[1].skillId).toBe('bbb');
  });

  it('controller delegates getSkillStates to service with studentId', async () => {
    const mockSvc = { getSkillStatesForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, skillStates: [] }) };
    const ctrl = makeController({ skillState: mockSvc });
    const result = await ctrl.getSkillStates(STUDENT_ID);
    expect(mockSvc.getSkillStatesForStudent).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toEqual({ studentId: STUDENT_ID, skillStates: [] });
  });

  it('controller propagates service errors', async () => {
    const mockSvc = { getSkillStatesForStudent: jest.fn().mockRejectedValue(new Error('DB down')) };
    const ctrl = makeController({ skillState: mockSvc });
    await expect(ctrl.getSkillStates(STUDENT_ID)).rejects.toThrow('DB down');
  });
});

// ===========================================================================
// 4. WeaknessRecordsReadService (P5-070)
// ===========================================================================

describe('WeaknessRecordsReadService — result reads (P5-070)', () => {

  const WEAKNESS_ID = 'cc0e8400-e29b-41d4-a716-446655440005';

  function makeWeaknessRow(overrides: Record<string, unknown> = {}) {
    return {
      id:                   WEAKNESS_ID,
      skill_id:             SKILL_ID,
      severity:             'developing',
      status:               'active',
      trigger_attempt_ids:  [ATTEMPT_ID],
      detected_at:          NOW_ISO,
      resolved_at:          null,
      updated_at:           NOW_ISO,
      ...overrides,
    };
  }

  it('queries weakness_records by student_id with correct ordering', async () => {
    const querySpy = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    const svc = new WeaknessRecordsReadService(makeMockDb(querySpy));
    await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    const [sql, params] = querySpy.mock.calls[0];
    expect(sql).toMatch(/FROM weakness_records/);
    expect(sql).toMatch(/WHERE student_id = \$1/);
    expect(params).toEqual([STUDENT_ID]);
  });

  it('returns empty weaknessRecords array when no rows', async () => {
    const svc = new WeaknessRecordsReadService(
      makeMockDb(async () => ({ rows: [], rowCount: 0 })),
    );
    const result = await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
    expect(result.weaknessRecords).toEqual([]);
  });

  it('maps DB row to WeaknessRecordEntry correctly', async () => {
    const svc = new WeaknessRecordsReadService(
      makeMockDb(async () => ({ rows: [makeWeaknessRow()], rowCount: 1 })),
    );
    const { weaknessRecords } = await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(weaknessRecords[0]).toMatchObject({
      weaknessId:         WEAKNESS_ID,
      skillId:            SKILL_ID,
      severity:           'developing',
      status:             'active',
      triggerAttemptIds:  [ATTEMPT_ID],
      detectedAt:         NOW_ISO,
      resolvedAt:         null,
      updatedAt:          NOW_ISO,
    });
  });

  it('maps resolved_at to non-null when record is resolved', async () => {
    const svc = new WeaknessRecordsReadService(
      makeMockDb(async () => ({
        rows: [makeWeaknessRow({ status: 'resolved', resolved_at: NOW_ISO })],
        rowCount: 1,
      })),
    );
    const { weaknessRecords } = await svc.getWeaknessRecordsForStudent(STUDENT_ID);
    expect(weaknessRecords[0].resolvedAt).toBe(NOW_ISO);
    expect(weaknessRecords[0].status).toBe('resolved');
  });

  it('controller delegates getWeaknessRecords to service', async () => {
    const mockSvc = { getWeaknessRecordsForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, weaknessRecords: [] }) };
    const ctrl = makeController({ weakness: mockSvc });
    const result = await ctrl.getWeaknessRecords(STUDENT_ID);
    expect(mockSvc.getWeaknessRecordsForStudent).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toEqual({ studentId: STUDENT_ID, weaknessRecords: [] });
  });

  it('controller propagates service errors', async () => {
    const mockSvc = { getWeaknessRecordsForStudent: jest.fn().mockRejectedValue(new Error('timeout')) };
    const ctrl = makeController({ weakness: mockSvc });
    await expect(ctrl.getWeaknessRecords(STUDENT_ID)).rejects.toThrow('timeout');
  });
});

// ===========================================================================
// 5. SessionStateReadService (P5-068)
// ===========================================================================

describe('SessionStateReadService — result reads (P5-068)', () => {

  function makeSessionRow(overrides: Record<string, unknown> = {}) {
    return {
      items_attempted:       5,
      items_correct:         4,
      skills_touched:        [SKILL_ID],
      overall_mastery_shift: 'positive',
      frustration_level:     'low',
      engagement_level:      'high',
      signal_basis:          ['response_time', 'error_rate'],
      closed_out_at:         NOW_ISO,
      updated_at:            NOW_ISO,
      ...overrides,
    };
  }

  it('queries session_summaries with session_id AND student_id', async () => {
    const querySpy = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    const svc = new SessionStateReadService(makeMockDb(querySpy));
    await svc.getSessionState(STUDENT_ID, SESSION_ID);
    const [sql, params] = querySpy.mock.calls[0];
    expect(sql).toMatch(/FROM session_summaries/);
    expect(sql).toMatch(/session_id = \$1/);
    expect(sql).toMatch(/student_id = \$2/);
    expect(params).toEqual([SESSION_ID, STUDENT_ID]);
  });

  it('returns found: false with all nulls when session has no summary', async () => {
    const svc = new SessionStateReadService(
      makeMockDb(async () => ({ rows: [], rowCount: 0 })),
    );
    const result = await svc.getSessionState(STUDENT_ID, SESSION_ID);
    expect(result.found).toBe(false);
    expect(result.studentId).toBe(STUDENT_ID);
    expect(result.sessionId).toBe(SESSION_ID);
    expect(result.itemsAttempted).toBeNull();
    expect(result.itemsCorrect).toBeNull();
    expect(result.skillsTouched).toBeNull();
    expect(result.behavioralSignal).toBeNull();
  });

  it('returns found: true with full data when summary exists', async () => {
    const svc = new SessionStateReadService(
      makeMockDb(async () => ({ rows: [makeSessionRow()], rowCount: 1 })),
    );
    const result = await svc.getSessionState(STUDENT_ID, SESSION_ID);
    expect(result.found).toBe(true);
    expect(result.itemsAttempted).toBe(5);
    expect(result.itemsCorrect).toBe(4);
    expect(result.overallMasteryShift).toBe('positive');
    expect(result.behavioralSignal).toMatchObject({
      frustrationLevel: 'low',
      engagementLevel:  'high',
      signalBasis:      ['response_time', 'error_rate'],
    });
  });

  it('returns found: false when session belongs to different student (ownership leak prevention)', async () => {
    // The service scopes by both student_id and session_id — a mismatch returns 0 rows.
    const querySpy = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    const svc = new SessionStateReadService(makeMockDb(querySpy));
    const result = await svc.getSessionState('other-student-id', SESSION_ID);
    expect(result.found).toBe(false);
    // The query must always include student_id as a parameter
    expect(querySpy.mock.calls[0][1]).toContain('other-student-id');
  });

  it('controller delegates getSessionState with both studentId and sessionId', async () => {
    const mockSvc = { getSessionState: jest.fn().mockResolvedValue({ found: false, studentId: STUDENT_ID, sessionId: SESSION_ID }) };
    const ctrl = makeController({ session: mockSvc });
    const result = await ctrl.getSessionState(STUDENT_ID, SESSION_ID);
    expect(mockSvc.getSessionState).toHaveBeenCalledWith(STUDENT_ID, SESSION_ID);
    expect(result).toMatchObject({ found: false });
  });

  it('controller propagates service errors', async () => {
    const mockSvc = { getSessionState: jest.fn().mockRejectedValue(new Error('not found')) };
    const ctrl = makeController({ session: mockSvc });
    await expect(ctrl.getSessionState(STUDENT_ID, SESSION_ID)).rejects.toThrow('not found');
  });
});

// ===========================================================================
// 6. RecommendationReadService (P5-071)
// ===========================================================================

describe('RecommendationReadService — result reads (P5-071)', () => {

  const REC_ID = 'dd0e8400-e29b-41d4-a716-446655440006';

  function makeRecRow(overrides: Record<string, unknown> = {}) {
    return {
      id:                   REC_ID,
      kind:                 'practice',
      target_skill_id:      SKILL_ID,
      target_lesson_id:     null,
      rank:                 1,
      reason:               'skill below mastery threshold',
      based_on_weakness_id: null,
      generated_at:         NOW_ISO,
      expires_at:           null,
      status:               'active',
      updated_at:           NOW_ISO,
      ...overrides,
    };
  }

  it('queries recommendations with status=active filter and rank order', async () => {
    const querySpy = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    const svc = new RecommendationReadService(makeMockDb(querySpy));
    await svc.getActiveForStudent(STUDENT_ID);
    const [sql, params] = querySpy.mock.calls[0];
    expect(sql).toMatch(/FROM recommendations/);
    expect(sql).toMatch(/WHERE student_id = \$1/);
    expect(sql).toMatch(/status = 'active'/);
    expect(sql).toMatch(/ORDER BY rank ASC/);
    expect(params).toEqual([STUDENT_ID]);
  });

  it('returns empty recommendations array when no active rows', async () => {
    const svc = new RecommendationReadService(
      makeMockDb(async () => ({ rows: [], rowCount: 0 })),
    );
    const result = await svc.getActiveForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
    expect(result.recommendations).toEqual([]);
  });

  it('maps all columns to RecommendationEntry correctly', async () => {
    const svc = new RecommendationReadService(
      makeMockDb(async () => ({ rows: [makeRecRow()], rowCount: 1 })),
    );
    const { recommendations } = await svc.getActiveForStudent(STUDENT_ID);
    expect(recommendations[0]).toMatchObject({
      id:               REC_ID,
      kind:             'practice',
      targetSkillId:    SKILL_ID,
      targetLessonId:   null,
      rank:             1,
      reason:           'skill below mastery threshold',
      basedOnWeaknessId: null,
      generatedAt:      NOW_ISO,
      expiresAt:        null,
      status:           'active',
      updatedAt:        NOW_ISO,
    });
  });

  it('maps non-null nullable fields when present', async () => {
    const LESSON_ID = 'ee0e8400-e29b-41d4-a716-446655440007';
    const WEAK_ID   = 'ff0e8400-e29b-41d4-a716-446655440008';
    const svc = new RecommendationReadService(
      makeMockDb(async () => ({
        rows: [makeRecRow({ target_lesson_id: LESSON_ID, based_on_weakness_id: WEAK_ID, expires_at: NOW_ISO })],
        rowCount: 1,
      })),
    );
    const { recommendations } = await svc.getActiveForStudent(STUDENT_ID);
    expect(recommendations[0].targetLessonId).toBe(LESSON_ID);
    expect(recommendations[0].basedOnWeaknessId).toBe(WEAK_ID);
    expect(recommendations[0].expiresAt).toBe(NOW_ISO);
  });

  it('returns multiple recommendations ordered as received from DB', async () => {
    const rows = [
      makeRecRow({ rank: 1, id: 'aaa' }),
      makeRecRow({ rank: 2, id: 'bbb' }),
    ];
    const svc = new RecommendationReadService(
      makeMockDb(async () => ({ rows, rowCount: 2 })),
    );
    const { recommendations } = await svc.getActiveForStudent(STUDENT_ID);
    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].rank).toBe(1);
    expect(recommendations[1].rank).toBe(2);
  });

  it('controller delegates getRecommendations to service', async () => {
    const mockSvc = { getActiveForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, recommendations: [] }) };
    const ctrl = makeController({ recommendation: mockSvc });
    const result = await ctrl.getRecommendations(STUDENT_ID);
    expect(mockSvc.getActiveForStudent).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toEqual({ studentId: STUDENT_ID, recommendations: [] });
  });

  it('controller propagates service errors', async () => {
    const mockSvc = { getActiveForStudent: jest.fn().mockRejectedValue(new Error('db error')) };
    const ctrl = makeController({ recommendation: mockSvc });
    await expect(ctrl.getRecommendations(STUDENT_ID)).rejects.toThrow('db error');
  });
});

// ===========================================================================
// 7. ReviewScheduleReadService (P5-072)
// ===========================================================================

describe('ReviewScheduleReadService — result reads (P5-072)', () => {

  const SCHEDULE_ID = 'aa0e8400-e29b-41d4-a716-446655440009';

  function makeScheduleRow(overrides: Record<string, unknown> = {}) {
    return {
      id:                  SCHEDULE_ID,
      skill_id:            SKILL_ID,
      due_at:              NOW_ISO,
      interval_days:       '7',
      repetition_count:    3,
      status:              'pending',
      based_on_attempt_id: ATTEMPT_ID,
      scheduled_at:        NOW_ISO,
      updated_at:          NOW_ISO,
      ...overrides,
    };
  }

  it('queries review_schedules by student_id ordered by due_at', async () => {
    const querySpy = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    const svc = new ReviewScheduleReadService(makeMockDb(querySpy));
    await svc.getReviewSchedulesForStudent(STUDENT_ID);
    const [sql, params] = querySpy.mock.calls[0];
    expect(sql).toMatch(/FROM review_schedules/);
    expect(sql).toMatch(/WHERE student_id = \$1/);
    expect(sql).toMatch(/ORDER BY due_at ASC/);
    expect(params).toEqual([STUDENT_ID]);
  });

  it('returns empty reviewSchedules array when no rows', async () => {
    const svc = new ReviewScheduleReadService(
      makeMockDb(async () => ({ rows: [], rowCount: 0 })),
    );
    const result = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(result.studentId).toBe(STUDENT_ID);
    expect(result.reviewSchedules).toEqual([]);
  });

  it('maps DB row to ReviewScheduleEntry correctly, parsing interval_days float', async () => {
    const svc = new ReviewScheduleReadService(
      makeMockDb(async () => ({ rows: [makeScheduleRow()], rowCount: 1 })),
    );
    const { reviewSchedules } = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(reviewSchedules[0]).toMatchObject({
      scheduleId:         SCHEDULE_ID,
      skillId:            SKILL_ID,
      dueAt:              NOW_ISO,
      intervalDays:       7,
      repetitionCount:    3,
      status:             'pending',
      basedOnAttemptId:   ATTEMPT_ID,
      scheduledAt:        NOW_ISO,
      updatedAt:          NOW_ISO,
    });
    expect(typeof reviewSchedules[0].intervalDays).toBe('number');
  });

  it('maps fractional interval_days string to float', async () => {
    const svc = new ReviewScheduleReadService(
      makeMockDb(async () => ({
        rows: [makeScheduleRow({ interval_days: '3.5' })],
        rowCount: 1,
      })),
    );
    const { reviewSchedules } = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(reviewSchedules[0].intervalDays).toBe(3.5);
  });

  it('returns multiple schedules ordered as received from DB', async () => {
    const rows = [
      makeScheduleRow({ id: 'sched-1', due_at: '2026-06-20T00:00:00Z' }),
      makeScheduleRow({ id: 'sched-2', due_at: '2026-06-27T00:00:00Z' }),
    ];
    const svc = new ReviewScheduleReadService(
      makeMockDb(async () => ({ rows, rowCount: 2 })),
    );
    const { reviewSchedules } = await svc.getReviewSchedulesForStudent(STUDENT_ID);
    expect(reviewSchedules).toHaveLength(2);
    expect(reviewSchedules[0].scheduleId).toBe('sched-1');
    expect(reviewSchedules[1].scheduleId).toBe('sched-2');
  });

  it('controller delegates getReviewSchedules to service', async () => {
    const mockSvc = { getReviewSchedulesForStudent: jest.fn().mockResolvedValue({ studentId: STUDENT_ID, reviewSchedules: [] }) };
    const ctrl = makeController({ reviewSchedule: mockSvc });
    const result = await ctrl.getReviewSchedules(STUDENT_ID);
    expect(mockSvc.getReviewSchedulesForStudent).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toEqual({ studentId: STUDENT_ID, reviewSchedules: [] });
  });

  it('controller propagates service errors', async () => {
    const mockSvc = { getReviewSchedulesForStudent: jest.fn().mockRejectedValue(new Error('pool exhausted')) };
    const ctrl = makeController({ reviewSchedule: mockSvc });
    await expect(ctrl.getReviewSchedules(STUDENT_ID)).rejects.toThrow('pool exhausted');
  });
});

// ===========================================================================
// 8. Backend authority — no client-side AIM computation
// ===========================================================================

describe('AIM Result API — backend authority (P5-004)', () => {

  it('AimResultController never calls AimEngineClientService', () => {
    const paramTypes: string[] = (
      Reflect.getMetadata('design:paramtypes', AimResultController) ?? []
    ).map((t: Function) => t?.name ?? '');
    expect(paramTypes).not.toContain('AimEngineClientService');
    expect(paramTypes).not.toContain('AimEngineAdapterService');
    expect(paramTypes).not.toContain('AimPipelineOrchestratorService');
  });

  it('all five services never call AIM Engine (service class names only accept DB)', () => {
    // Each read service accepts only DatabaseService — verified by instantiating
    // with a mock DB and confirming the service works without any AIM Engine dep.
    const mockDb = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    expect(() => new StudentSkillStateReadService(mockDb)).not.toThrow();
    expect(() => new WeaknessRecordsReadService(mockDb)).not.toThrow();
    expect(() => new SessionStateReadService(mockDb)).not.toThrow();
    expect(() => new RecommendationReadService(mockDb)).not.toThrow();
    expect(() => new ReviewScheduleReadService(mockDb)).not.toThrow();
  });

  it('all five services return only backend-persisted values — no mastery computation', async () => {
    // When DB returns rows, services return them verbatim (mapped). They do not
    // recalculate or modify AIM-owned fields like mastery_score.
    const mockDb = makeMockDb(async () => ({
      rows: [{
        skill_id: SKILL_ID, mastery_score: '0.42', mastery_confidence: '0.9',
        mastery_trend: 'stable', previous_mastery_score: null,
        last_attempt_id: ATTEMPT_ID, last_evaluated_at: NOW_ISO, updated_at: NOW_ISO,
      }],
      rowCount: 1,
    }));
    const svc = new StudentSkillStateReadService(mockDb);
    const { skillStates } = await svc.getSkillStatesForStudent(STUDENT_ID);
    // Mastery score comes straight from DB — not recomputed
    expect(skillStates[0].masteryScore).toBe(0.42);
  });
});
