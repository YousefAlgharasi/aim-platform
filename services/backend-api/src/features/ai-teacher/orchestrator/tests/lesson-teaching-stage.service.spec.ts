// LessonTeachingStageService tests.

import {
  LessonTeachingStageService,
  LESSON_COMPLETE_MARKER,
} from '../lesson-teaching-stage.service';
import { AiChatSessionRepository } from '../../repositories/ai-chat-session.repository';
import { AiChatSessionRow } from '../../repositories/ai-chat-repository.types';
import { CurrentLessonContextAdapter } from '../../context-builder/adapters/current-lesson-context.adapter';
import { LessonProgressService } from '../../../lessons/lesson-progress.service';

function makeSession(overrides: Partial<AiChatSessionRow> = {}): AiChatSessionRow {
  return {
    id: 'session-1',
    student_id: 'student-1',
    context_ref: 'lesson:ee0e8400-e29b-41d4-a716-446655440009',
    status: 'active',
    created_at: 'now',
    updated_at: 'now',
    lesson_teaching_stage: 'greeting',
    resolved_lesson_id: null,
    ...overrides,
  };
}

describe('LessonTeachingStageService', () => {
  describe('resolveAndPersistLesson', () => {
    it('persists the lesson id resolved from an explicit lesson: contextRef', async () => {
      const setResolvedLessonId = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = { setResolvedLessonId } as unknown as AiChatSessionRepository;
      const getCurrentLessonContext = jest.fn().mockResolvedValue({
        lessonId: 'ee0e8400-e29b-41d4-a716-446655440009',
        title: 'Greetings',
        description: '',
        systemPrompt: null,
        chapterTitle: null,
        levelCode: null,
        levelTitle: null,
        courseTitle: null,
        cefrCode: null,
      });
      const currentLessonContext = {
        getCurrentLessonContext,
      } as unknown as CurrentLessonContextAdapter;
      const lessonProgressService = {} as unknown as LessonProgressService;

      const service = new LessonTeachingStageService(
        sessionRepository,
        currentLessonContext,
        lessonProgressService,
      );

      await service.resolveAndPersistLesson(
        'student-1',
        'session-1',
        'lesson:ee0e8400-e29b-41d4-a716-446655440009',
      );

      expect(getCurrentLessonContext).toHaveBeenCalledWith(
        'student-1',
        'ee0e8400-e29b-41d4-a716-446655440009',
      );
      expect(setResolvedLessonId).toHaveBeenCalledWith(
        'session-1',
        'ee0e8400-e29b-41d4-a716-446655440009',
      );
    });

    it('does not write anything when no lesson can be resolved', async () => {
      const setResolvedLessonId = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = { setResolvedLessonId } as unknown as AiChatSessionRepository;
      const currentLessonContext = {
        getCurrentLessonContext: jest.fn().mockResolvedValue(null),
      } as unknown as CurrentLessonContextAdapter;
      const lessonProgressService = {} as unknown as LessonProgressService;

      const service = new LessonTeachingStageService(
        sessionRepository,
        currentLessonContext,
        lessonProgressService,
      );

      await service.resolveAndPersistLesson('student-1', 'session-1', 'general');

      expect(setResolvedLessonId).not.toHaveBeenCalled();
    });
  });

  describe('advanceFromGreetingIfNeeded', () => {
    it('moves a greeting-stage session to teaching', async () => {
      const updateLessonTeachingStage = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = {
        updateLessonTeachingStage,
      } as unknown as AiChatSessionRepository;
      const service = new LessonTeachingStageService(
        sessionRepository,
        {} as unknown as CurrentLessonContextAdapter,
        {} as unknown as LessonProgressService,
      );

      const stage = await service.advanceFromGreetingIfNeeded(
        makeSession({ lesson_teaching_stage: 'greeting' }),
      );

      expect(stage).toBe('teaching');
      expect(updateLessonTeachingStage).toHaveBeenCalledWith('session-1', 'teaching');
    });

    it('leaves an already-teaching session untouched', async () => {
      const updateLessonTeachingStage = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = {
        updateLessonTeachingStage,
      } as unknown as AiChatSessionRepository;
      const service = new LessonTeachingStageService(
        sessionRepository,
        {} as unknown as CurrentLessonContextAdapter,
        {} as unknown as LessonProgressService,
      );

      const stage = await service.advanceFromGreetingIfNeeded(
        makeSession({ lesson_teaching_stage: 'teaching' }),
      );

      expect(stage).toBe('teaching');
      expect(updateLessonTeachingStage).not.toHaveBeenCalled();
    });

    it('leaves an already-complete session untouched', async () => {
      const updateLessonTeachingStage = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = {
        updateLessonTeachingStage,
      } as unknown as AiChatSessionRepository;
      const service = new LessonTeachingStageService(
        sessionRepository,
        {} as unknown as CurrentLessonContextAdapter,
        {} as unknown as LessonProgressService,
      );

      const stage = await service.advanceFromGreetingIfNeeded(
        makeSession({ lesson_teaching_stage: 'complete' }),
      );

      expect(stage).toBe('complete');
      expect(updateLessonTeachingStage).not.toHaveBeenCalled();
    });
  });

  describe('handleReply', () => {
    it('returns the reply unchanged, and never marks the lesson complete, when no marker is present', async () => {
      const markComplete = jest.fn().mockResolvedValue(undefined);
      const updateLessonTeachingStage = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = {
        updateLessonTeachingStage,
      } as unknown as AiChatSessionRepository;
      const lessonProgressService = { markComplete } as unknown as LessonProgressService;
      const service = new LessonTeachingStageService(
        sessionRepository,
        {} as unknown as CurrentLessonContextAdapter,
        lessonProgressService,
      );

      const result = await service.handleReply(
        'student-1',
        makeSession({ resolved_lesson_id: 'lesson-1' }),
        'Great job, let\'s keep going!',
      );

      expect(result).toBe('Great job, let\'s keep going!');
      expect(markComplete).not.toHaveBeenCalled();
      expect(updateLessonTeachingStage).not.toHaveBeenCalled();
    });

    it('strips the marker, marks the lesson complete, and flips the stage when the marker is present', async () => {
      const markComplete = jest.fn().mockResolvedValue(undefined);
      const updateLessonTeachingStage = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = {
        updateLessonTeachingStage,
      } as unknown as AiChatSessionRepository;
      const lessonProgressService = { markComplete } as unknown as LessonProgressService;
      const service = new LessonTeachingStageService(
        sessionRepository,
        {} as unknown as CurrentLessonContextAdapter,
        lessonProgressService,
      );

      const result = await service.handleReply(
        'student-1',
        makeSession({ id: 'session-9', resolved_lesson_id: 'lesson-1' }),
        `Did you get it? We're done for today! ${LESSON_COMPLETE_MARKER}`,
      );

      expect(result).toBe("Did you get it? We're done for today!");
      expect(result).not.toContain(LESSON_COMPLETE_MARKER);
      expect(markComplete).toHaveBeenCalledWith('student-1', 'lesson-1');
      expect(updateLessonTeachingStage).toHaveBeenCalledWith('session-9', 'complete');
    });

    it('strips the marker but never calls markComplete when the session has no resolved lesson', async () => {
      const markComplete = jest.fn().mockResolvedValue(undefined);
      const updateLessonTeachingStage = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = {
        updateLessonTeachingStage,
      } as unknown as AiChatSessionRepository;
      const lessonProgressService = { markComplete } as unknown as LessonProgressService;
      const service = new LessonTeachingStageService(
        sessionRepository,
        {} as unknown as CurrentLessonContextAdapter,
        lessonProgressService,
      );

      const result = await service.handleReply(
        'student-1',
        makeSession({ resolved_lesson_id: null }),
        `All done! ${LESSON_COMPLETE_MARKER}`,
      );

      expect(result).toBe('All done!');
      expect(markComplete).not.toHaveBeenCalled();
      expect(updateLessonTeachingStage).not.toHaveBeenCalled();
    });

    it('never lets a lesson_progress write failure surface as a broken turn', async () => {
      const markComplete = jest.fn().mockRejectedValue(new Error('db down'));
      const updateLessonTeachingStage = jest.fn().mockResolvedValue(undefined);
      const sessionRepository = {
        updateLessonTeachingStage,
      } as unknown as AiChatSessionRepository;
      const lessonProgressService = { markComplete } as unknown as LessonProgressService;
      const service = new LessonTeachingStageService(
        sessionRepository,
        {} as unknown as CurrentLessonContextAdapter,
        lessonProgressService,
      );

      await expect(
        service.handleReply(
          'student-1',
          makeSession({ resolved_lesson_id: 'lesson-1' }),
          `Done! ${LESSON_COMPLETE_MARKER}`,
        ),
      ).resolves.toBe('Done!');
      expect(updateLessonTeachingStage).toHaveBeenCalledWith('session-1', 'complete');
    });
  });
});
