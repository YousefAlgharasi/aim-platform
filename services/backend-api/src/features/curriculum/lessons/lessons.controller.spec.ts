// P3-048 — Add Curriculum Backend Tests
// LessonsController unit tests.

import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonPublishValidationService } from '../lesson-skills/lesson-publish-validation.service';

const makeMockLessonsService = (): jest.Mocked<
  Pick<LessonsService, 'listLessons' | 'getLesson' | 'createLesson' | 'updateLesson'>
> => ({
  listLessons: jest.fn(),
  getLesson: jest.fn(),
  createLesson: jest.fn(),
  updateLesson: jest.fn(),
});

const makeMockValidationService = (): jest.Mocked<
  Pick<LessonPublishValidationService, 'checkLessonPublishReadiness'>
> => ({
  checkLessonPublishReadiness: jest.fn(),
});

describe('LessonsController', () => {
  describe('listLessons', () => {
    it('delegates with optional chapterId, parsed pagination, and filters', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.listLessons.mockResolvedValue({ lessons: [], total: 0 } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.listLessons('chap-uuid', '2', '15', 'draft', 'intro');

      expect(lessonsSvc.listLessons).toHaveBeenCalledWith(2, 15, 'chap-uuid', 'draft', 'intro');
    });

    it('falls back to page 1 and limit 20 for non-numeric params', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.listLessons.mockResolvedValue({ lessons: [], total: 0 } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.listLessons(undefined, 'x', 'y');

      expect(lessonsSvc.listLessons).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined);
    });

    it('returns service result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { lessons: [{ id: 'l1' }], total: 1 } as any;
      lessonsSvc.listLessons.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.listLessons(undefined, '1', '20')).toBe(expected);
    });
  });

  describe('getLesson', () => {
    it('delegates to LessonsService with id', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.getLesson.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.getLesson('uuid-1');

      expect(lessonsSvc.getLesson).toHaveBeenCalledWith('uuid-1');
    });

    it('returns service result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { id: 'uuid-1', title: 'Lesson A' } as any;
      lessonsSvc.getLesson.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.getLesson('uuid-1')).toBe(expected);
    });
  });

  describe('createLesson', () => {
    it('delegates to LessonsService with the request body', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.createLesson.mockResolvedValue({ id: 'new' } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.createLesson({ title: 'New Lesson', chapterId: 'ch-uuid' } as any);

      expect(lessonsSvc.createLesson).toHaveBeenCalledWith({
        title: 'New Lesson',
        chapterId: 'ch-uuid',
      });
    });

    it('returns service result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { id: 'new-uuid', status: 'draft' } as any;
      lessonsSvc.createLesson.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.createLesson({} as any)).toBe(expected);
    });
  });

  describe('checkPublishValidation', () => {
    it('delegates to LessonPublishValidationService with lesson id', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      validationSvc.checkLessonPublishReadiness.mockResolvedValue({
        ready: false,
        reasons: [],
      } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.checkPublishValidation('lesson-uuid');

      expect(validationSvc.checkLessonPublishReadiness).toHaveBeenCalledWith('lesson-uuid');
    });

    it('returns validation result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { ready: true, reasons: [] } as any;
      validationSvc.checkLessonPublishReadiness.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.checkPublishValidation('lesson-uuid')).toBe(expected);
    });
  });

  describe('updateLesson', () => {
    it('delegates to LessonsService with id and body', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      lessonsSvc.updateLesson.mockResolvedValue({ id: 'uuid-1' } as any);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      await ctrl.updateLesson('uuid-1', { title: 'Updated' });

      expect(lessonsSvc.updateLesson).toHaveBeenCalledWith('uuid-1', { title: 'Updated' });
    });

    it('returns service result directly', async () => {
      const lessonsSvc = makeMockLessonsService();
      const validationSvc = makeMockValidationService();
      const expected = { id: 'uuid-1', title: 'Updated' } as any;
      lessonsSvc.updateLesson.mockResolvedValue(expected);
      const ctrl = new LessonsController(
        lessonsSvc as unknown as LessonsService,
        validationSvc as unknown as LessonPublishValidationService,
      );

      expect(await ctrl.updateLesson('uuid-1', {})).toBe(expected);
    });
  });
});
