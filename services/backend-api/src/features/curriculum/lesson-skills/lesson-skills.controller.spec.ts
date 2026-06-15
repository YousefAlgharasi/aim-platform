// P3-048 — Add Curriculum Backend Tests
// LessonSkillsController unit tests.

import { LessonSkillsController } from './lesson-skills.controller';
import { LessonSkillsService } from './lesson-skills.service';

const makeMockService = (): jest.Mocked<
  Pick<LessonSkillsService, 'listSkillsForLesson' | 'addSkillToLesson' | 'removeSkillFromLesson'>
> => ({
  listSkillsForLesson: jest.fn(),
  addSkillToLesson: jest.fn(),
  removeSkillFromLesson: jest.fn(),
});

describe('LessonSkillsController', () => {
  describe('listSkillsForLesson', () => {
    it('delegates to LessonSkillsService with lessonId', async () => {
      const svc = makeMockService();
      svc.listSkillsForLesson.mockResolvedValue([{ id: 's1' }] as any);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      await ctrl.listSkillsForLesson('lesson-uuid');

      expect(svc.listSkillsForLesson).toHaveBeenCalledWith('lesson-uuid');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = [{ skillId: 'skill-uuid' }] as any;
      svc.listSkillsForLesson.mockResolvedValue(expected);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      expect(await ctrl.listSkillsForLesson('lesson-uuid')).toBe(expected);
    });
  });

  describe('addSkillToLesson', () => {
    it('delegates to LessonSkillsService with lessonId and body', async () => {
      const svc = makeMockService();
      svc.addSkillToLesson.mockResolvedValue({ lessonId: 'l', skillId: 's' } as any);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      await ctrl.addSkillToLesson('lesson-uuid', { skillId: 'skill-uuid' } as any);

      expect(svc.addSkillToLesson).toHaveBeenCalledWith('lesson-uuid', {
        skillId: 'skill-uuid',
      });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { lessonId: 'lesson-uuid', skillId: 'skill-uuid' } as any;
      svc.addSkillToLesson.mockResolvedValue(expected);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      expect(await ctrl.addSkillToLesson('lesson-uuid', {} as any)).toBe(expected);
    });
  });

  describe('removeSkillFromLesson', () => {
    it('delegates to LessonSkillsService with lessonId and skillId', async () => {
      const svc = makeMockService();
      svc.removeSkillFromLesson.mockResolvedValue(undefined);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      await ctrl.removeSkillFromLesson('lesson-uuid', 'skill-uuid');

      expect(svc.removeSkillFromLesson).toHaveBeenCalledWith('lesson-uuid', 'skill-uuid');
    });

    it('awaits the service call (returns undefined for 204 NO CONTENT)', async () => {
      const svc = makeMockService();
      svc.removeSkillFromLesson.mockResolvedValue(undefined);
      const ctrl = new LessonSkillsController(svc as unknown as LessonSkillsService);

      const result = await ctrl.removeSkillFromLesson('lesson-uuid', 'skill-uuid');

      expect(result).toBeUndefined();
    });
  });
});
