// P20-016 — End-to-end chain proof.
//
// Proves the root-cause fix from P20-005 (the AIM pipeline stub that never
// actually wired persistence) actually populates every table the punch list
// promised, by wiring the REAL business-logic services together (not
// mocking persistence itself) and recording every SQL statement issued to a
// fake DatabaseService/PoolClient. This is the closest thing to a true
// end-to-end test that is feasible in this sandbox:
//
//   - This environment has no live DATABASE_URL / Supabase Postgres
//     connection string (confirmed: no DATABASE_URL/SUPABASE_* env vars,
//     no .env file — the same pre-existing limitation documented across
//     prior P20 tasks for `prisma migrate deploy`). A test that opens a
//     real `pg` connection cannot run here.
//   - There is also no existing E2E harness in this repo that runs the
//     real backend-api HTTP server together with a real aim-engine HTTP
//     server (confirmed by reading the existing "integration" test,
//     aim-pipeline-integration.spec.ts, which already stubs both the
//     database and the AIM Engine HTTP client — this test follows that
//     same established convention).
//
// What this test does that a plain unit test doesn't: it constructs the
// REAL PlacementLevelStateService, AimPersistenceService, and every one of
// its six real category-persistence services (StudentSkillStateUpdateService,
// WeaknessUpdateService, DifficultyDecisionService, RecommendationOutputService,
// ReviewScheduleOutputService, SessionSummaryService) plus the real
// AimFocusDirectiveService (P20-013) -- nothing about *persistence* is
// mocked, only the raw SQL driver (DatabaseService/PoolClient) is a
// recording fake. Every SQL statement + params actually issued during a
// realistic placement-completion + lesson-attempt-analysis run is captured,
// and this test asserts a well-formed, correctly-correlated INSERT reached
// every one of the six tables named in the P20-016 acceptance criteria.
//
// See docs/phase-20/p20-016-e2e-runbook.md for the manual, real-Supabase
// verification procedure a human (or an agent with a live DATABASE_URL) can
// run to confirm this against the actual project (yrarpdkvdxszgxxondkt) —
// that is the true end-to-end proof against real infrastructure; this test
// is the automated, infra-independent proof that the code path is wired
// correctly, runnable in CI.

import { PoolClient, QueryResult, QueryResultRow } from 'pg';

import { DatabaseService } from '../../../database/database.service';
import { PlacementLevelStateService } from '../../placement/placement-level-state.service';
import { AimPersistenceService } from '../persistence/aim-persistence.service';
import { StudentSkillStateUpdateService } from '../persistence/student-skill-state-update.service';
import { WeaknessUpdateService } from '../persistence/weakness-update.service';
import { DifficultyDecisionService } from '../persistence/difficulty-decision.service';
import { RecommendationOutputService } from '../persistence/recommendation-output.service';
import { ReviewScheduleOutputService } from '../persistence/review-schedule-output.service';
import { SessionSummaryService } from '../persistence/session-summary.service';
import { AimFocusDirectiveService } from '../persistence/aim-focus-directive.service';
import { LearningReminderIntegration } from '../../notifications/learning-reminder.integration';
import { SkillsService } from '../../curriculum/skills/skills.service';
import { UsersService } from '../../users/users.service';
import { StudentProfileService } from '../../students/student-profile.service';
import { AimValidatedResponse } from '../adapter/aim-response-mapper.types';

const STUDENT_ID = 'e2e00000-0000-4000-8000-000000000001';
const SESSION_ID = 'e2e00000-0000-4000-8000-000000000002';
// ai_focus_directives.student_id is an FK to student_profiles(id), a
// distinct id space from the STUDENT_ID (Supabase Auth UID) used
// throughout every other table in this chain — see AimFocusDirectiveService.
const PROFILE_ID = 'e2e00000-0000-4000-8000-000000000099';

// ---------------------------------------------------------------------------
// Recording fake DatabaseService — captures every SQL statement + params
// issued by the real services under test, across both db.query (used by
// PlacementLevelStateService and AimFocusDirectiveService, which run
// outside any transaction) and the transaction-scoped PoolClient.query
// (used by AimPersistenceService's six category writes).
// ---------------------------------------------------------------------------

interface RecordedCall {
  readonly sql: string;
  readonly params: readonly unknown[];
}

function tableOf(sql: string): string | null {
  const insertMatch = /INSERT INTO\s+(\w+)/i.exec(sql);
  if (insertMatch) return insertMatch[1];
  const updateMatch = /UPDATE\s+(\w+)/i.exec(sql);
  if (updateMatch) return updateMatch[1];
  return null;
}

function makeRecordingDb(courseRow: { track_slug: string; cefr_rank: number }) {
  const calls: RecordedCall[] = [];

  const respond = <T extends QueryResultRow>(sql: string, params: readonly unknown[]): QueryResult<T> => {
    calls.push({ sql, params });

    // The one query that must return real data for the chain to proceed:
    // PlacementLevelStateService's course lookup by cefr_code. Without a
    // matching course it correctly logs a warning and skips the upsert
    // (verified behavior from P20-006) — which would defeat this test's
    // purpose of proving student_level_state actually gets populated.
    if (sql.includes('FROM courses') && sql.includes('cefr_code')) {
      return { rows: [courseRow], rowCount: 1 } as unknown as QueryResult<T>;
    }

    return { rows: [], rowCount: 0 } as unknown as QueryResult<T>;
  };

  const fakeClient = {
    query: async <T extends QueryResultRow>(sql: string, params: readonly unknown[] = []) =>
      respond<T>(sql, params),
  } as unknown as PoolClient;

  const db = {
    query: async <T extends QueryResultRow>(sql: string, params: readonly unknown[] = []) =>
      respond<T>(sql, params),
    withClient: async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => callback(fakeClient),
  } as unknown as DatabaseService;

  return { db, calls };
}

// ---------------------------------------------------------------------------
// Realistic validated AIM Engine response — every category populated, in
// the exact shape aim-engine-contract.spec.ts (P20-016) verifies matches
// the real Pydantic schema. This is what a real lesson-attempt analysis
// call returns once the AIM Engine has processed a submitted attempt.
// ---------------------------------------------------------------------------

function makeValidatedAimResponse(): AimValidatedResponse {
  return {
    backendRequestId: 'e2e-req-001',
    contractVersion: '1.0',
    studentId: STUDENT_ID,
    sessionId: SESSION_ID,
    generatedAt: '2026-06-17T10:00:00Z',
    droppedValidationCodes: [],
    categories: {
      skillState: [
        {
          skillId: 'skill:english:a1:vocab.daily-routines',
          masteryScore: 0.72,
          masteryConfidence: 0.85,
          masteryTrend: 'improving',
          attemptsConsideredCount: 5,
          lastAttemptId: 'e2e00000-0000-4000-8000-000000000003',
          evaluatedAt: '2026-06-17T10:00:00Z',
        },
      ],
      weaknessRecords: [
        {
          weaknessId: 'e2e00000-0000-4000-8000-000000000010',
          skillId: 'skill:english:a1:vocab.daily-routines',
          severity: 'developing',
          status: 'open',
          triggerAttemptIds: ['e2e00000-0000-4000-8000-000000000003'],
          detectedAt: '2026-06-17T10:00:00Z',
          resolvedAt: null,
        },
      ],
      difficultyDecision: {
        decisionId: 'e2e00000-0000-4000-8000-000000000011',
        skillId: 'skill:english:a1:vocab.daily-routines',
        nextDifficulty: 2,
        previousDifficulty: 2,
        rationale: 'consistent_performance',
        basedOnAttemptIds: ['e2e00000-0000-4000-8000-000000000003'],
        decidedAt: '2026-06-17T10:00:00Z',
      },
      recommendations: [
        {
          recommendationId: 'e2e00000-0000-4000-8000-000000000012',
          kind: 'targeted_practice',
          targetSkillId: 'skill:english:a1:vocab.daily-routines',
          targetLessonId: null,
          rank: 1,
          reason: 'addresses_weakness',
          basedOnWeaknessId: 'e2e00000-0000-4000-8000-000000000010',
          generatedAt: '2026-06-17T10:00:00Z',
          expiresAt: null,
        },
      ],
      reviewSchedule: [
        {
          scheduleId: 'e2e00000-0000-4000-8000-000000000013',
          skillId: 'skill:english:a1:vocab.daily-routines',
          dueAt: '2026-06-24T10:00:00Z',
          intervalDays: 7,
          repetitionCount: 1,
          basedOnAttemptId: 'e2e00000-0000-4000-8000-000000000003',
          scheduledAt: '2026-06-17T10:00:00Z',
        },
      ],
      sessionSummary: {
        sessionId: SESSION_ID,
        itemsAttempted: 5,
        itemsCorrect: 4,
        skillsTouched: ['skill:english:a1:vocab.daily-routines'],
        overallMasteryShift: 'positive',
        frustrationLevel: 'none',
        engagementLevel: 'high',
        signalBasis: ['sustained_correct_streak'],
        closedOutAt: '2026-06-17T10:00:00Z',
      },
    },
  };
}

describe('P20-016: placement + lesson-attempt-analysis chain populates every promised table', () => {
  it('student_skill_states, weakness_records, recommendations, review_schedules, student_level_state, and ai_focus_directives all receive a correlated INSERT for the same student', async () => {
    const { db, calls } = makeRecordingDb({ track_slug: 'english', cefr_rank: 1 });

    // ---- Step 1: placement completion seeds student_level_state (P20-006) ----
    const levelState = new PlacementLevelStateService(db);
    await levelState.upsertFromPlacement(STUDENT_ID, 'beginner');

    // ---- Step 2: a lesson attempt's AIM analysis persists via the real ----
    // ---- six category services + AimFocusDirectiveService (P20-013)    ----
    const skillsServiceStub = {
      getSkillByKey: jest.fn().mockRejectedValue(new Error('no skill seeded in this fake')),
    } as unknown as SkillsService;
    const learningReminderStub = {
      createReviewReminder: jest.fn().mockResolvedValue(undefined),
    } as unknown as LearningReminderIntegration;
    const usersServiceStub = {
      findBySupabaseUid: jest.fn().mockResolvedValue({ id: 'e2e00000-0000-4000-8000-000000000098' }),
    } as unknown as UsersService;
    const studentProfileServiceStub = {
      findByUserId: jest.fn().mockResolvedValue({ id: PROFILE_ID }),
    } as unknown as StudentProfileService;

    const persistence = new AimPersistenceService(
      db,
      new StudentSkillStateUpdateService(db),
      new WeaknessUpdateService(db),
      new DifficultyDecisionService(db),
      new RecommendationOutputService(db),
      new ReviewScheduleOutputService(db, learningReminderStub),
      new SessionSummaryService(db),
      learningReminderStub,
      new AimFocusDirectiveService(db, skillsServiceStub, usersServiceStub, studentProfileServiceStub),
    );

    await persistence.persist(makeValidatedAimResponse());

    // ---- Assert: every promised table received a correlated write ----
    const tablesWritten = new Set(calls.map((c) => tableOf(c.sql)).filter((t): t is string => t !== null));

    expect(tablesWritten).toEqual(
      new Set([
        'student_level_state',
        'student_skill_states',
        'weakness_records',
        'difficulty_decisions',
        'recommendations',
        'review_schedules',
        'session_summaries',
        'ai_focus_directives',
      ]),
    );

    // Every INSERT/UPDATE that carries a student_id parameter must carry
    // *this* student's id — proving the whole chain stayed correlated to
    // one student throughout, not just that six unrelated tables got rows.
    const callsWithStudentId = calls.filter((c) => c.params.includes(STUDENT_ID));
    expect(callsWithStudentId.length).toBeGreaterThanOrEqual(7); // one per table below, at minimum

    for (const table of [
      'student_level_state',
      'student_skill_states',
      'weakness_records',
      'recommendations',
      'review_schedules',
    ]) {
      const writesToTable = calls.filter((c) => tableOf(c.sql) === table);
      expect(writesToTable.length).toBeGreaterThan(0);
      expect(writesToTable.some((c) => c.params.includes(STUDENT_ID))).toBe(true);
    }

    // ai_focus_directives is keyed by student_profiles.id (PROFILE_ID here),
    // not the raw Supabase Auth UID every other table above uses — the
    // resolution done by AimFocusDirectiveService, proven correlated here.
    const focusDirectiveWrites = calls.filter((c) => tableOf(c.sql) === 'ai_focus_directives');
    expect(focusDirectiveWrites.length).toBeGreaterThan(0);
    expect(focusDirectiveWrites.some((c) => c.params.includes(PROFILE_ID))).toBe(true);
  });
});
