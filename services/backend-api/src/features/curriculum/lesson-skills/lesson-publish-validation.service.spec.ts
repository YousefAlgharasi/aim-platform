import { HttpStatus } from '@nestjs/common';
import { LessonPublishValidationService } from './lesson-publish-validation.service';
import { LessonSkillsService } from './lesson-skills.service';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

describe('LessonPublishValidationService', () => {
  let service: LessonPublishValidationService;
  let mockCountPublishedSkills: jest.Mock;

  beforeEach(() => {
    mockCountPublishedSkills = jest.fn();
    const lessonSkillsServiceMock = {
      countPublishedSkillsForLesson: mockCountPublishedSkills,
    } as unknown as LessonSkillsService;

    service = new LessonPublishValidationService(lessonSkillsServiceMock);
  });

  describe('validateLessonReadyForPublish', () => {
    it('throws AppError if lesson has 0 published skills', async () => {
      mockCountPublishedSkills.mockResolvedValue(0);

      const promise = service.validateLessonReadyForPublish('test-lesson-id');

      await expect(promise).rejects.toMatchObject({
        code: ApiErrorCode.VALIDATION_ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      });
      expect(mockCountPublishedSkills).toHaveBeenCalledWith('test-lesson-id');
    });

    it('resolves if lesson has at least 1 published skill', async () => {
      mockCountPublishedSkills.mockResolvedValue(1);

      await expect(service.validateLessonReadyForPublish('test-lesson-id')).resolves.toBeUndefined();
      expect(mockCountPublishedSkills).toHaveBeenCalledWith('test-lesson-id');
    });
  });

  describe('checkLessonPublishReadiness', () => {
    it('returns isReady false with errors if 0 published skills', async () => {
      mockCountPublishedSkills.mockResolvedValue(0);

      const result = await service.checkLessonPublishReadiness('test-lesson-id');

      expect(result.isReady).toBe(false);
      expect(result.errors).toContain(
        'Lesson requires at least one published skill to be published.',
      );
    });

    it('returns isReady true with empty errors if >= 1 published skills', async () => {
      mockCountPublishedSkills.mockResolvedValue(2);

      const result = await service.checkLessonPublishReadiness('test-lesson-id');

      expect(result.isReady).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
