// P3-048 — Add Curriculum Backend Tests
// LessonObjectivesController unit tests.

import { LessonObjectivesController } from './lesson-objectives.controller';
import { LessonObjectivesService } from './lesson-objectives.service';

const makeMockService = (): jest.Mocked<
  Pick<
    LessonObjectivesService,
    'listObjectivesForLesson' | 'addObjectiveToLesson' | 'removeObjectiveFromLesson'
  >
> => ({
  listObjectivesForLesson: jest.fn(),
  addObjectiveToLesson: jest.fn(),
  removeObjectiveFromLesson: jest.fn(),
});

describe('LessonObjectivesController', () => {
  describe('listObjectivesForLesson', () => {
    it('delegates to LessonObjectivesService with lessonId', async () => {
      const svc = makeMockService();
      svc.listObjectivesForLesson.mockResolvedValue([{ id: 'o1' }] as any);
      const ctrl = new LessonObjectivesController(svc as unknown as LessonObjectivesService);

      await ctrl.listObjectivesForLesson('lesson-uuid');

      expect(svc.listObjectivesForLesson).toHaveBeenCalledWith('lesson-uuid');
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = [{ id: 'o1', objectiveId: 'obj-uuid' }] as any;
      svc.listObjectivesForLesson.mockResolvedValue(expected);
      const ctrl = new LessonObjectivesController(svc as unknown as LessonObjectivesService);

      expect(await ctrl.listObjectivesForLesson('lesson-uuid')).toBe(expected);
    });
  });

  describe('addObjectiveToLesson', () => {
    it('delegates to LessonObjectivesService with lessonId and body', async () => {
      const svc = makeMockService();
      svc.addObjectiveToLesson.mockResolvedValue({ lessonId: 'l', objectiveId: 'o' } as any);
      const ctrl = new LessonObjectivesController(svc as unknown as LessonObjectivesService);

      await ctrl.addObjectiveToLesson('lesson-uuid', { objectiveId: 'obj-uuid' } as any);

      expect(svc.addObjectiveToLesson).toHaveBeenCalledWith('lesson-uuid', {
        objectiveId: 'obj-uuid',
      });
    });

    it('returns service result directly', async () => {
      const svc = makeMockService();
      const expected = { lessonId: 'lesson-uuid', objectiveId: 'obj-uuid' } as any;
      svc.addObjectiveToLesson.mockResolvedValue(expected);
      const ctrl = new LessonObjectivesController(svc as unknown as LessonObjectivesService);

      expect(await ctrl.addObjectiveToLesson('lesson-uuid', {} as any)).toBe(expected);
    });
  });

  describe('removeObjectiveFromLesson', () => {
    it('delegates to LessonObjectivesService with lessonId and objectiveId', async () => {
      const svc = makeMockService();
      svc.removeObjectiveFromLesson.mockResolvedValue(undefined);
      const ctrl = new LessonObjectivesController(svc as unknown as LessonObjectivesService);

      await ctrl.removeObjectiveFromLesson('lesson-uuid', 'obj-uuid');

      expect(svc.removeObjectiveFromLesson).toHaveBeenCalledWith('lesson-uuid', 'obj-uuid');
    });

    it('awaits the service call (returns undefined for 204 NO CONTENT)', async () => {
      const svc = makeMockService();
      svc.removeObjectiveFromLesson.mockResolvedValue(undefined);
      const ctrl = new LessonObjectivesController(svc as unknown as LessonObjectivesService);

      const result = await ctrl.removeObjectiveFromLesson('lesson-uuid', 'obj-uuid');

      expect(result).toBeUndefined();
    });
  });
});
