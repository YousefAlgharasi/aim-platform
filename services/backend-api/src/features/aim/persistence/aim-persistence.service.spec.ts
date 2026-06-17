// Phase 5 — P5-058 follow-up
// AimPersistenceService tests (full Stage 6 wiring of all six categories).
//
// Covers:
//   - Calls each underlying persistence service with studentId + the
//     correct category slice from validatedResponse.categories
//   - Skips array-based services when their category array is empty
//     (skillState, weaknessRecords) — matches the conditional guards in
//     the implementation
//   - Always calls difficultyDecision/recommendationOutput/
//     reviewScheduleOutput/sessionSummary even when their input is
//     null/empty, since those services own their own null/empty handling
//     per their respective contracts (P5-014/P5-015/P5-016/P5-017)
//   - Does not throw on a fully empty-categories response

import { AimPersistenceService } from './aim-persistence.service';
import { WeaknessUpdateService } from './weakness-update.service';
import { StudentSkillStateUpdateService } from './student-skill-state-update.service';
import { DifficultyDecisionService } from './difficulty-decision.service';
import { RecommendationOutputService } from './recommendation-output.service';
import { ReviewScheduleOutputService } from './review-schedule-output.service';
import { SessionSummaryService } from './session-summary.service';
import { AimValidatedResponse } from '../adapter/aim-response-mapper.types';

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

function makeEmptyCategories(): AimValidatedResponse['categories'] {
  return {
    skillState: [],
    weaknessRecords: [],
    difficultyDecision: null,
    recommendations: [],
    reviewSchedule: [],
    sessionSummary: null,
  };
}

function makeValidatedResponse(
  categories: AimValidatedResponse['categories'] = makeEmptyCategories(),
): AimValidatedResponse {
  return {
    backendRequestId: '550e8400-e29b-41d4-a716-446655440000',
    contractVersion: '1.0',
    studentId: STUDENT_ID,
    sessionId: '660e8400-e29b-41d4-a716-446655440001',
    generatedAt: '2026-06-17T10:30:05Z',
    categories,
    droppedValidationCodes: [],
  };
}

function makeMocks() {
  const weaknessUpdate = { upsertMany: jest.fn().mockResolvedValue(undefined) } as unknown as WeaknessUpdateService;
  const skillStateUpdate = { upsertMany: jest.fn().mockResolvedValue(undefined) } as unknown as StudentSkillStateUpdateService;
  const difficultyDecision = { persist: jest.fn().mockResolvedValue({ ok: true, action: 'skipped_null' }) } as unknown as DifficultyDecisionService;
  const recommendationOutput = { replaceActiveSet: jest.fn().mockResolvedValue({ supersededCount: 0, insertedCount: 0 }) } as unknown as RecommendationOutputService;
  const reviewScheduleOutput = { upsertMany: jest.fn().mockResolvedValue(undefined) } as unknown as ReviewScheduleOutputService;
  const sessionSummary = { persist: jest.fn().mockResolvedValue({ ok: true, action: 'skipped_null' }) } as unknown as SessionSummaryService;

  const svc = new AimPersistenceService(
    weaknessUpdate,
    skillStateUpdate,
    difficultyDecision,
    recommendationOutput,
    reviewScheduleOutput,
    sessionSummary,
  );

  return {
    svc,
    weaknessUpdate,
    skillStateUpdate,
    difficultyDecision,
    recommendationOutput,
    reviewScheduleOutput,
    sessionSummary,
  };
}

describe('AimPersistenceService.persist', () => {
  it('calls WeaknessUpdateService.upsertMany with studentId and weaknessRecords', async () => {
    const { svc, weaknessUpdate } = makeMocks();
    const weaknessRecord = {
      weaknessId: 'bb0e8400-e29b-41d4-a716-446655440006',
      skillId: 'skill:arabic:p1:grammar',
      severity: 'developing' as const,
      status: 'open' as const,
      triggerAttemptIds: ['880e8400-e29b-41d4-a716-446655440003'],
      detectedAt: '2026-06-17T10:30:00Z',
      resolvedAt: null,
    };
    await svc.persist(makeValidatedResponse({ ...makeEmptyCategories(), weaknessRecords: [weaknessRecord] }));
    expect(weaknessUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, [weaknessRecord]);
  });

  it('does not call WeaknessUpdateService.upsertMany when weaknessRecords is empty', async () => {
    const { svc, weaknessUpdate } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(weaknessUpdate.upsertMany).not.toHaveBeenCalled();
  });

  it('calls StudentSkillStateUpdateService.upsertMany with studentId and skillState', async () => {
    const { svc, skillStateUpdate } = makeMocks();
    const skillState = {
      skillId: 'skill:arabic:p1:vocab',
      masteryScore: 0.75,
      masteryConfidence: 0.8,
      masteryTrend: 'improving' as const,
      attemptsConsideredCount: 5,
      lastAttemptId: '880e8400-e29b-41d4-a716-446655440003',
      evaluatedAt: '2026-06-17T10:30:00Z',
    };
    await svc.persist(makeValidatedResponse({ ...makeEmptyCategories(), skillState: [skillState] }));
    expect(skillStateUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, [skillState]);
  });

  it('does not call StudentSkillStateUpdateService.upsertMany when skillState is empty', async () => {
    const { svc, skillStateUpdate } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(skillStateUpdate.upsertMany).not.toHaveBeenCalled();
  });

  it('always calls DifficultyDecisionService.persist, even with null decision', async () => {
    const { svc, difficultyDecision } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(difficultyDecision.persist).toHaveBeenCalledWith(STUDENT_ID, null);
  });

  it('always calls RecommendationOutputService.replaceActiveSet, even with empty array', async () => {
    const { svc, recommendationOutput } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(recommendationOutput.replaceActiveSet).toHaveBeenCalledWith(STUDENT_ID, []);
  });

  it('always calls ReviewScheduleOutputService.upsertMany, even with empty array', async () => {
    const { svc, reviewScheduleOutput } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(reviewScheduleOutput.upsertMany).toHaveBeenCalledWith(STUDENT_ID, []);
  });

  it('always calls SessionSummaryService.persist, even with null summary', async () => {
    const { svc, sessionSummary } = makeMocks();
    await svc.persist(makeValidatedResponse());
    expect(sessionSummary.persist).toHaveBeenCalledWith(STUDENT_ID, null);
  });

  it('does not throw when persisting a fully empty-categories response', async () => {
    const { svc } = makeMocks();
    await expect(svc.persist(makeValidatedResponse())).resolves.toBeUndefined();
  });

  it('passes the same studentId to every category service for a given response', async () => {
    const { svc, weaknessUpdate, skillStateUpdate, difficultyDecision, recommendationOutput, reviewScheduleOutput, sessionSummary } = makeMocks();
    const categories = {
      skillState: [{
        skillId: 's', masteryScore: 0.5, masteryConfidence: 0.5,
        masteryTrend: 'stable' as const, attemptsConsideredCount: 1,
        lastAttemptId: 'a1', evaluatedAt: '2026-06-17T10:00:00Z',
      }],
      weaknessRecords: [{
        weaknessId: 'w1', skillId: 's', severity: 'emerging' as const,
        status: 'open' as const, triggerAttemptIds: ['a1'],
        detectedAt: '2026-06-17T10:00:00Z', resolvedAt: null,
      }],
      difficultyDecision: null,
      recommendations: [],
      reviewSchedule: [],
      sessionSummary: null,
    };
    await svc.persist(makeValidatedResponse(categories));

    expect(weaknessUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, categories.weaknessRecords);
    expect(skillStateUpdate.upsertMany).toHaveBeenCalledWith(STUDENT_ID, categories.skillState);
    expect(difficultyDecision.persist).toHaveBeenCalledWith(STUDENT_ID, null);
    expect(recommendationOutput.replaceActiveSet).toHaveBeenCalledWith(STUDENT_ID, []);
    expect(reviewScheduleOutput.upsertMany).toHaveBeenCalledWith(STUDENT_ID, []);
    expect(sessionSummary.persist).toHaveBeenCalledWith(STUDENT_ID, null);
  });
});
