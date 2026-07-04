// P8-039: Persist Context Snapshots
// P8-040: Add Context Builder Tests
// ContextBuilderService.buildContext() / persistSnapshot() pipeline tests.
//
// P18-031: Updated for the AI Authority Rule — placementResult, skillState,
// weakness, recommendation, reviewSchedule, and recentMistakes were removed
// from AiTeacherContextSnapshot and are no longer constructor dependencies.

import { ContextBuilderService } from '../context-builder.service';
import { AiContextSnapshotRepository } from '../../repositories/ai-context-snapshot.repository';
import { AiTeacherContextSnapshot } from '../context-builder.types';
import { StudentProfileContextAdapter } from '../adapters/student-profile-context.adapter';
import { CurrentLessonContextAdapter } from '../adapters/current-lesson-context.adapter';
import { CurriculumSkillContextAdapter } from '../adapters/curriculum-skill-context.adapter';
import { FocusDirectiveContextAdapter } from '../adapters/focus-directive-context.adapter';
import { DifficultyDecisionContextAdapter } from '../adapters/difficulty-decision-context.adapter';
import { EmotionalStateContextAdapter } from '../adapters/emotional-state-context.adapter';

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = '880e8400-e29b-41d4-a716-446655440003';
const MESSAGE_ID = '990e8400-e29b-41d4-a716-446655440004';
const OTHER_STUDENT_ID = '660e8400-e29b-41d4-a716-446655440099';

function makeMockRepository(
  create: AiContextSnapshotRepository['create'],
) {
  return { create } as unknown as AiContextSnapshotRepository;
}

function makeMockAdapter<T extends object>(methodName: keyof T, impl: (studentId: string) => Promise<unknown>) {
  return { [methodName]: impl } as unknown as T;
}

function buildServiceWithAdapterSpies(studentIdsSeen: string[]) {
  const recordCall = (value: unknown) => async (studentId: string) => {
    studentIdsSeen.push(studentId);
    return value;
  };

  const studentProfile = makeMockAdapter<StudentProfileContextAdapter>(
    'getProfileContext',
    recordCall({ gradeLevel: 6 }),
  );
  const currentLesson = makeMockAdapter<CurrentLessonContextAdapter>(
    'getCurrentLessonContext',
    recordCall({ lessonId: 'lesson-1' }),
  );
  const curriculumSkill = makeMockAdapter<CurriculumSkillContextAdapter>(
    'getSkillContext',
    recordCall({ skillId: 'skill-1' }),
  );
  const focusDirective = makeMockAdapter<FocusDirectiveContextAdapter>(
    'getFocusDirectiveContext',
    recordCall({ skillId: 'skill-1', directiveText: 'Focus on skill-1.' }),
  );
  const difficultyDecision = makeMockAdapter<DifficultyDecisionContextAdapter>(
    'getDifficultyDecisionContext',
    recordCall({ skillId: 'skill-1', rationale: 'consistent_performance' }),
  );
  const emotionalState = {
    getEmotionalStateContext: async (studentId: string) => {
      studentIdsSeen.push(studentId);
      return { frustrationLevel: 'moderate', engagementLevel: 'typical' };
    },
  } as unknown as EmotionalStateContextAdapter;

  const service = new ContextBuilderService(
    studentProfile,
    currentLesson,
    curriculumSkill,
    focusDirective,
    difficultyDecision,
    emotionalState,
    makeMockRepository(async () => {
      throw new Error('not used in buildContext tests');
    }),
  );

  return service;
}

function makeSnapshot(): AiTeacherContextSnapshot {
  return {
    studentId: STUDENT_ID,
    sessionId: SESSION_ID,
    studentProfile: { gradeLevel: 6 },
    currentLesson: { lessonId: 'lesson-1' },
    curriculumSkill: { skillId: 'skill-1' },
    focusDirective: { skillId: 'skill-1', directiveText: 'Focus on skill-1.' },
    difficultyDecision: { skillId: 'skill-1', rationale: 'consistent_performance' },
    emotionalState: { frustrationLevel: 'moderate', engagementLevel: 'typical' },
  };
}

describe('ContextBuilderService.buildContext — contextRef lesson parsing', () => {
  it('extracts a lesson id from a "lesson:<uuid>" contextRef and passes it to CurrentLessonContextAdapter', async () => {
    const LESSON_ID = 'ee0e8400-e29b-41d4-a716-446655440009';
    const explicitLessonIdsSeen: (string | null | undefined)[] = [];

    const studentProfile = makeMockAdapter<StudentProfileContextAdapter>(
      'getProfileContext',
      async () => ({ gradeLevel: 6 }),
    );
    const currentLesson = {
      getCurrentLessonContext: async (_studentId: string, explicitLessonId?: string | null) => {
        explicitLessonIdsSeen.push(explicitLessonId);
        return { lessonId: explicitLessonId };
      },
    } as unknown as CurrentLessonContextAdapter;
    const curriculumSkill = makeMockAdapter<CurriculumSkillContextAdapter>(
      'getSkillContext',
      async () => ({ skillId: 'skill-1' }),
    );
    const focusDirective = makeMockAdapter<FocusDirectiveContextAdapter>(
      'getFocusDirectiveContext',
      async () => null,
    );
    const difficultyDecision = makeMockAdapter<DifficultyDecisionContextAdapter>(
      'getDifficultyDecisionContext',
      async () => null,
    );
    const emotionalState = makeMockAdapter<EmotionalStateContextAdapter>(
      'getEmotionalStateContext',
      async () => null,
    );

    const service = new ContextBuilderService(
      studentProfile,
      currentLesson,
      curriculumSkill,
      focusDirective,
      difficultyDecision,
      emotionalState,
      makeMockRepository(async () => {
        throw new Error('not used in buildContext tests');
      }),
    );

    await service.buildContext({
      studentId: STUDENT_ID,
      sessionId: SESSION_ID,
      contextRef: `lesson:${LESSON_ID}`,
    });

    expect(explicitLessonIdsSeen).toEqual([LESSON_ID]);
  });

  it('passes null when contextRef does not reference a lesson uuid (e.g. "general")', async () => {
    const explicitLessonIdsSeen: (string | null | undefined)[] = [];

    const studentProfile = makeMockAdapter<StudentProfileContextAdapter>(
      'getProfileContext',
      async () => ({ gradeLevel: 6 }),
    );
    const currentLesson = {
      getCurrentLessonContext: async (_studentId: string, explicitLessonId?: string | null) => {
        explicitLessonIdsSeen.push(explicitLessonId);
        return null;
      },
    } as unknown as CurrentLessonContextAdapter;
    const curriculumSkill = makeMockAdapter<CurriculumSkillContextAdapter>(
      'getSkillContext',
      async () => ({ skillId: 'skill-1' }),
    );
    const focusDirective = makeMockAdapter<FocusDirectiveContextAdapter>(
      'getFocusDirectiveContext',
      async () => null,
    );
    const difficultyDecision = makeMockAdapter<DifficultyDecisionContextAdapter>(
      'getDifficultyDecisionContext',
      async () => null,
    );
    const emotionalState = makeMockAdapter<EmotionalStateContextAdapter>(
      'getEmotionalStateContext',
      async () => null,
    );

    const service = new ContextBuilderService(
      studentProfile,
      currentLesson,
      curriculumSkill,
      focusDirective,
      difficultyDecision,
      emotionalState,
      makeMockRepository(async () => {
        throw new Error('not used in buildContext tests');
      }),
    );

    await service.buildContext({
      studentId: STUDENT_ID,
      sessionId: SESSION_ID,
      contextRef: 'general',
    });

    expect(explicitLessonIdsSeen).toEqual([null]);
  });
});

describe('ContextBuilderService.buildContext', () => {
  it('scopes every adapter call to the same studentId resolved from input, never a different/client-supplied id', async () => {
    const studentIdsSeen: string[] = [];
    const service = buildServiceWithAdapterSpies(studentIdsSeen);

    await service.buildContext({
      studentId: STUDENT_ID,
      sessionId: SESSION_ID,
      contextRef: 'lesson:p1:l3',
    });

    expect(studentIdsSeen).toHaveLength(6);
    expect(studentIdsSeen.every((id) => id === STUDENT_ID)).toBe(true);
    expect(studentIdsSeen).not.toContain(OTHER_STUDENT_ID);
  });

  it('assembles all six context fields plus studentId/sessionId into a single snapshot', async () => {
    const service = buildServiceWithAdapterSpies([]);

    const snapshot = await service.buildContext({
      studentId: STUDENT_ID,
      sessionId: SESSION_ID,
      contextRef: 'lesson:p1:l3',
    });

    expect(snapshot).toEqual({
      studentId: STUDENT_ID,
      sessionId: SESSION_ID,
      studentProfile: { gradeLevel: 6 },
      currentLesson: { lessonId: 'lesson-1' },
      curriculumSkill: { skillId: 'skill-1' },
      focusDirective: { skillId: 'skill-1', directiveText: 'Focus on skill-1.' },
      difficultyDecision: { skillId: 'skill-1', rationale: 'consistent_performance' },
      emotionalState: { frustrationLevel: 'moderate', engagementLevel: 'typical' },
    });
  });

  it('handles all adapters returning null/empty gracefully without throwing', async () => {
    const service = buildServiceWithAdapterSpies([]);

    await expect(
      service.buildContext({
        studentId: STUDENT_ID,
        sessionId: SESSION_ID,
        contextRef: 'lesson:p1:l3',
      }),
    ).resolves.toBeDefined();
  });
});

describe('ContextBuilderService.persistSnapshot', () => {
  it('stores context_data without duplicating studentId/sessionId, keyed by the resolved messageId', async () => {
    const calls: unknown[][] = [];
    const repository = makeMockRepository(async (sessionId, messageId, studentId, contextData) => {
      calls.push([sessionId, messageId, studentId, contextData]);
      return {
        id: 'snap-1',
        session_id: sessionId,
        message_id: messageId,
        student_id: studentId,
        context_data: contextData,
        created_at: '2026-06-19T00:00:00Z',
      };
    });
    const service = new ContextBuilderService(
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      repository,
    );

    await service.persistSnapshot(MESSAGE_ID, makeSnapshot());

    expect(calls).toHaveLength(1);
    const [sessionId, messageId, studentId, contextData] = calls[0] as [
      string,
      string,
      string,
      Record<string, unknown>,
    ];
    expect(sessionId).toBe(SESSION_ID);
    expect(messageId).toBe(MESSAGE_ID);
    expect(studentId).toBe(STUDENT_ID);
    expect(contextData).not.toHaveProperty('studentId');
    expect(contextData).not.toHaveProperty('sessionId');
    expect(contextData).toMatchObject({
      studentProfile: { gradeLevel: 6 },
      currentLesson: { lessonId: 'lesson-1' },
      curriculumSkill: { skillId: 'skill-1' },
    });
  });
});
