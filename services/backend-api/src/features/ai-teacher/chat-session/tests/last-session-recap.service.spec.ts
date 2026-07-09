// P21-013: LastSessionRecapService tests.

import { LastSessionRecapService } from '../last-session-recap.service';
import { AiChatSessionRepository } from '../../repositories/ai-chat-session.repository';
import { AiChatSessionRow } from '../../repositories/ai-chat-repository.types';
import { CurriculumSkillContextAdapter } from '../../context-builder/adapters/curriculum-skill-context.adapter';
import { StudentSkillStateReadService } from '../../../aim/result/student-skill-state-read.service';
import { WeaknessRecordsReadService } from '../../../aim/result/weakness-records-read.service';

function makeClosedSession(overrides: Partial<AiChatSessionRow> = {}): AiChatSessionRow {
  return {
    id: 'prior-session-1',
    student_id: 'student-1',
    context_ref: 'lesson:fractions',
    status: 'closed',
    lesson_teaching_stage: 'greeting',
    resolved_lesson_id: null,
    created_at: '2026-06-01T00:00:00.000Z',
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    ...overrides,
  };
}

function makeDeps(options: {
  priorSession?: AiChatSessionRow | null;
  skill?: { skillId: string; key: string; title: string; domain: string } | null;
  skillStates?: any[];
  weaknesses?: any[];
} = {}) {
  const chatSessionRepository = {
    findMostRecentClosedForContext: jest.fn().mockResolvedValue(
      options.priorSession === undefined ? makeClosedSession() : options.priorSession,
    ),
  } as unknown as AiChatSessionRepository;

  const curriculumSkillContext = {
    getSkillContext: jest.fn().mockResolvedValue(
      options.skill === undefined
        ? { skillId: 'skill-1', key: 'past-tense', title: 'Past tense irregular verbs', domain: 'grammar' }
        : options.skill,
    ),
  } as unknown as CurriculumSkillContextAdapter;

  const skillStateRead = {
    getSkillStatesForStudent: jest.fn().mockResolvedValue({
      studentId: 'student-1',
      skillStates: options.skillStates ?? [
        {
          skillId: 'skill-1',
          masteryScore: 0.6,
          masteryConfidence: 0.7,
          masteryTrend: 'improving',
          previousMasteryScore: 0.5,
          lastAttemptId: 'attempt-1',
          lastEvaluatedAt: '2026-06-01T00:00:00.000Z',
          updatedAt: '2026-06-01T00:00:00.000Z',
        },
      ],
    }),
  } as unknown as StudentSkillStateReadService;

  const weaknessRecordsRead = {
    getWeaknessRecordsForStudent: jest.fn().mockResolvedValue({
      studentId: 'student-1',
      weaknessRecords: options.weaknesses ?? [
        {
          weaknessId: 'weakness-1',
          skillId: 'skill-1',
          severity: 'moderate',
          status: 'open',
          triggerAttemptIds: ['attempt-1'],
          detectedAt: '2026-06-01T00:00:00.000Z',
          resolvedAt: null,
          updatedAt: '2026-06-01T00:00:00.000Z',
        },
      ],
    }),
  } as unknown as WeaknessRecordsReadService;

  const service = new LastSessionRecapService(
    chatSessionRepository,
    curriculumSkillContext,
    skillStateRead,
    weaknessRecordsRead,
  );

  return { service, chatSessionRepository, curriculumSkillContext, skillStateRead, weaknessRecordsRead };
}

describe('LastSessionRecapService', () => {
  it('returns null when there is no prior session for this context (brand-new context)', async () => {
    const { service } = makeDeps({ priorSession: null });

    const recap = await service.getRecapForNewSession('student-1', 'lesson:fractions');

    expect(recap).toBeNull();
  });

  it('returns null when the prior closed session closed less than 1 hour ago (same-session-ish reopen)', async () => {
    const { service } = makeDeps({
      priorSession: makeClosedSession({ updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() }),
    });

    const recap = await service.getRecapForNewSession('student-1', 'lesson:fractions');

    expect(recap).toBeNull();
  });

  it('returns a recap referencing real skill/mastery/weakness data when reopened after >1h', async () => {
    const { service } = makeDeps();

    const recap = await service.getRecapForNewSession('student-1', 'lesson:fractions');

    expect(recap).toContain('Past tense irregular verbs');
    expect(recap).toContain('improving');
    expect(recap).toContain('open focus area');
  });

  it('returns null when there is no current AIM-recommended skill to reference (never fabricates one)', async () => {
    const { service } = makeDeps({ skill: null });

    const recap = await service.getRecapForNewSession('student-1', 'lesson:fractions');

    expect(recap).toBeNull();
  });

  it('still returns a truthful recap when the skill has no skill-state/weakness rows yet', async () => {
    const { service } = makeDeps({ skillStates: [], weaknesses: [] });

    const recap = await service.getRecapForNewSession('student-1', 'lesson:fractions');

    expect(recap).toBe('Welcome back! Last time we were working on Past tense irregular verbs.');
  });
});
