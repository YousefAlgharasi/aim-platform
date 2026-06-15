import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { LessonSkillsService } from './lesson-skills.service';

export interface PublishReadinessResult {
  isReady: boolean;
  errors: string[];
}

@Injectable()
export class LessonPublishValidationService {
  constructor(private readonly lessonSkillsService: LessonSkillsService) {}

  /**
   * Checks if a lesson has at least one published skill linked.
   * Throws an AppError if validation fails.
   */
  async validateLessonReadyForPublish(lessonId: string): Promise<void> {
    const publishedSkillCount =
      await this.lessonSkillsService.countPublishedSkillsForLesson(lessonId);

    if (publishedSkillCount === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `Lesson cannot be published without at least one published skill. Lesson ID: ${lessonId}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /**
   * Returns validation result without throwing.
   * Used for UI checks or status reporting.
   */
  async checkLessonPublishReadiness(lessonId: string): Promise<PublishReadinessResult> {
    const publishedSkillCount =
      await this.lessonSkillsService.countPublishedSkillsForLesson(lessonId);

    const errors: string[] = [];
    if (publishedSkillCount === 0) {
      errors.push('Lesson requires at least one published skill to be published.');
    }

    return {
      isReady: errors.length === 0,
      errors,
    };
  }
}
