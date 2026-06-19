// P8-039: Persist Context Snapshots
// ContextBuilderService.persistSnapshot() tests.

import { ContextBuilderService } from '../context-builder.service';
import { AiContextSnapshotRepository } from '../../repositories/ai-context-snapshot.repository';
import { AiTeacherContextSnapshot } from '../context-builder.types';

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = '880e8400-e29b-41d4-a716-446655440003';
const MESSAGE_ID = '990e8400-e29b-41d4-a716-446655440004';

function makeMockRepository(
  create: AiContextSnapshotRepository['create'],
) {
  return { create } as unknown as AiContextSnapshotRepository;
}

function makeSnapshot(): AiTeacherContextSnapshot {
  return {
    studentId: STUDENT_ID,
    sessionId: SESSION_ID,
    studentProfile: { gradeLevel: 6 },
    currentLesson: { lessonId: 'lesson-1' },
    curriculumSkill: { skillId: 'skill-1' },
    placementResult: null,
    skillState: null,
    weakness: null,
    recommendation: null,
    reviewSchedule: null,
    recentMistakes: [],
  };
}

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
      recentMistakes: [],
    });
  });
});
