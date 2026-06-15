import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { DatabaseService } from '../../../database/database.service';
import { WorkflowEntityType } from '../content-status-workflow/content-status-workflow.types';
import {
  PublishValidationIssue,
  PublishValidationResult,
} from './publish-validation.types';

interface CourseReadinessRow {
  title: string | null;
  description: string | null;
  published_level_count: string;
}

interface LevelReadinessRow {
  title: string | null;
  parent_course_status: string | null;
  published_chapter_count: string;
}

interface ChapterReadinessRow {
  title: string | null;
  parent_level_status: string | null;
  published_lesson_count: string;
}

interface LessonReadinessRow {
  title: string | null;
  description: string | null;
  published_skill_count: string;
  published_asset_count: string;
}

interface SkillReadinessRow {
  key: string | null;
  title: string | null;
  objective_count: string;
}

interface ObjectiveReadinessRow {
  title: string | null;
  published_skill_count: string;
}

interface QuestionReadinessRow {
  type: string;
  stem: string | null;
  choice_count: string;
  correct_choice_count: string;
  answer_count: string;
  published_primary_skill_count: string;
}

@Injectable()
export class PublishValidationService {
  constructor(private readonly db: DatabaseService) {}

  async validateReadyForPublish(
    entityType: WorkflowEntityType,
    entityId: string,
  ): Promise<void> {
    const result = await this.checkReadiness(entityType, entityId);

    if (!result.isPublishable) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `Cannot publish ${entityType} ${entityId}: ${result.issues
          .map((issue) => issue.message)
          .join('; ')}`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
  }

  async checkReadiness(
    entityType: WorkflowEntityType,
    entityId: string,
  ): Promise<PublishValidationResult> {
    const issues = await this.getIssues(entityType, entityId);

    return {
      entityType,
      entityId,
      isPublishable: issues.length === 0,
      issues,
    };
  }

  private async getIssues(
    entityType: WorkflowEntityType,
    entityId: string,
  ): Promise<PublishValidationIssue[]> {
    switch (entityType) {
      case 'courses':
        return this.validateCourse(entityId);
      case 'levels':
        return this.validateLevel(entityId);
      case 'chapters':
        return this.validateChapter(entityId);
      case 'lessons':
        return this.validateLesson(entityId);
      case 'skills':
        return this.validateSkill(entityId);
      case 'objectives':
        return this.validateObjective(entityId);
      case 'questions':
        return this.validateQuestion(entityId);
    }
  }

  private async validateCourse(courseId: string): Promise<PublishValidationIssue[]> {
    const result = await this.db.query<CourseReadinessRow>(
      `SELECT c.title,
              c.description,
              COUNT(l.id) FILTER (WHERE l.status = 'published')::text AS published_level_count
         FROM courses c
         LEFT JOIN levels l ON l.course_id = c.id
         WHERE c.id = $1
         GROUP BY c.id, c.title, c.description
         LIMIT 1`,
      [courseId],
    );
    const row = this.requireRow(result.rows[0], 'courses', courseId);

    return this.compactIssues([
      this.requiredTextIssue(row.title, 'title', 'Course title is required.'),
      this.requiredTextIssue(row.description, 'description', 'Course description is required.'),
      this.countIssue(row.published_level_count, 'levels', 'Course requires at least one published level.'),
    ]);
  }

  private async validateLevel(levelId: string): Promise<PublishValidationIssue[]> {
    const result = await this.db.query<LevelReadinessRow>(
      `SELECT l.title,
              c.status AS parent_course_status,
              COUNT(ch.id) FILTER (WHERE ch.status = 'published')::text AS published_chapter_count
         FROM levels l
         LEFT JOIN courses c ON c.id = l.course_id
         LEFT JOIN chapters ch ON ch.level_id = l.id
         WHERE l.id = $1
         GROUP BY l.id, l.title, c.status
         LIMIT 1`,
      [levelId],
    );
    const row = this.requireRow(result.rows[0], 'levels', levelId);

    return this.compactIssues([
      this.requiredTextIssue(row.title, 'title', 'Level title is required.'),
      row.parent_course_status === 'published'
        ? null
        : { field: 'course_id', message: 'Level parent course must be published.' },
      this.countIssue(row.published_chapter_count, 'chapters', 'Level requires at least one published chapter.'),
    ]);
  }

  private async validateChapter(chapterId: string): Promise<PublishValidationIssue[]> {
    const result = await this.db.query<ChapterReadinessRow>(
      `SELECT ch.title,
              l.status AS parent_level_status,
              COUNT(le.id) FILTER (WHERE le.status = 'published')::text AS published_lesson_count
         FROM chapters ch
         LEFT JOIN levels l ON l.id = ch.level_id
         LEFT JOIN lessons le ON le.chapter_id = ch.id
         WHERE ch.id = $1
         GROUP BY ch.id, ch.title, l.status
         LIMIT 1`,
      [chapterId],
    );
    const row = this.requireRow(result.rows[0], 'chapters', chapterId);

    return this.compactIssues([
      this.requiredTextIssue(row.title, 'title', 'Chapter title is required.'),
      row.parent_level_status === 'published'
        ? null
        : { field: 'level_id', message: 'Chapter parent level must be published.' },
      this.countIssue(row.published_lesson_count, 'lessons', 'Chapter requires at least one published lesson.'),
    ]);
  }

  private async validateLesson(lessonId: string): Promise<PublishValidationIssue[]> {
    const result = await this.db.query<LessonReadinessRow>(
      `SELECT l.title,
              l.description,
              COUNT(DISTINCT ls.skill_id) FILTER (WHERE s.status = 'published')::text AS published_skill_count,
              COUNT(DISTINCT la.id) FILTER (WHERE la.status = 'published')::text AS published_asset_count
         FROM lessons l
         LEFT JOIN lesson_skills ls ON ls.lesson_id = l.id
         LEFT JOIN skills s ON s.id = ls.skill_id
         LEFT JOIN lesson_assets la ON la.lesson_id = l.id
         WHERE l.id = $1
         GROUP BY l.id, l.title, l.description
         LIMIT 1`,
      [lessonId],
    );
    const row = this.requireRow(result.rows[0], 'lessons', lessonId);

    return this.compactIssues([
      this.requiredTextIssue(row.title, 'title', 'Lesson title is required.'),
      this.requiredTextIssue(row.description, 'description', 'Lesson description is required.'),
      this.countIssue(row.published_skill_count, 'skills', 'Lesson requires at least one linked published skill.'),
      this.countIssue(row.published_asset_count, 'assets', 'Lesson requires at least one published lesson asset.'),
    ]);
  }

  private async validateSkill(skillId: string): Promise<PublishValidationIssue[]> {
    const result = await this.db.query<SkillReadinessRow>(
      `SELECT s.key,
              s.title,
              COUNT(os.objective_id)::text AS objective_count
         FROM skills s
         LEFT JOIN objective_skills os ON os.skill_id = s.id
         WHERE s.id = $1
         GROUP BY s.id, s.key, s.title
         LIMIT 1`,
      [skillId],
    );
    const row = this.requireRow(result.rows[0], 'skills', skillId);

    return this.compactIssues([
      this.requiredTextIssue(row.key, 'key', 'Skill key is required.'),
      this.requiredTextIssue(row.title, 'title', 'Skill title is required.'),
      this.countIssue(row.objective_count, 'objectives', 'Skill requires at least one objective link.'),
    ]);
  }

  private async validateObjective(objectiveId: string): Promise<PublishValidationIssue[]> {
    const result = await this.db.query<ObjectiveReadinessRow>(
      `SELECT o.title,
              COUNT(os.skill_id) FILTER (WHERE s.status = 'published')::text AS published_skill_count
         FROM objectives o
         LEFT JOIN objective_skills os ON os.objective_id = o.id
         LEFT JOIN skills s ON s.id = os.skill_id
         WHERE o.id = $1
         GROUP BY o.id, o.title
         LIMIT 1`,
      [objectiveId],
    );
    const row = this.requireRow(result.rows[0], 'objectives', objectiveId);

    return this.compactIssues([
      this.requiredTextIssue(row.title, 'title', 'Objective title is required.'),
      this.countIssue(row.published_skill_count, 'skills', 'Objective requires at least one published skill link.'),
    ]);
  }

  private async validateQuestion(questionId: string): Promise<PublishValidationIssue[]> {
    const result = await this.db.query<QuestionReadinessRow>(
      `SELECT q.type,
              q.stem,
              COUNT(DISTINCT qc.id)::text AS choice_count,
              COUNT(DISTINCT qc.id) FILTER (WHERE qc.is_correct = true)::text AS correct_choice_count,
              COUNT(DISTINCT qa.id)::text AS answer_count,
              COUNT(DISTINCT qs.skill_id) FILTER (
                WHERE qs.is_primary = true AND s.status = 'published'
              )::text AS published_primary_skill_count
         FROM question_bank q
         LEFT JOIN question_choices qc ON qc.question_id = q.id
         LEFT JOIN question_answers qa ON qa.question_id = q.id
         LEFT JOIN question_skills qs ON qs.question_id = q.id
         LEFT JOIN skills s ON s.id = qs.skill_id
         WHERE q.id = $1
         GROUP BY q.id, q.type, q.stem
         LIMIT 1`,
      [questionId],
    );
    const row = this.requireRow(result.rows[0], 'questions', questionId);

    return this.compactIssues([
      this.requiredTextIssue(row.stem, 'stem', 'Question stem is required.'),
      this.questionAnswerIssue(row),
      this.countIssue(
        row.published_primary_skill_count,
        'skills',
        'Question requires a primary skill mapping to a published skill.',
      ),
    ]);
  }

  private questionAnswerIssue(row: QuestionReadinessRow): PublishValidationIssue | null {
    const choiceCount = this.toCount(row.choice_count);
    const correctChoiceCount = this.toCount(row.correct_choice_count);
    const answerCount = this.toCount(row.answer_count);

    switch (row.type) {
      case 'multiple_choice':
        return choiceCount >= 2 && correctChoiceCount === 1
          ? null
          : {
              field: 'choices',
              message: 'Multiple choice questions require at least two choices and exactly one correct answer.',
            };
      case 'multiple_select':
        return choiceCount >= 2 && correctChoiceCount >= 1
          ? null
          : {
              field: 'choices',
              message: 'Multiple select questions require at least two choices and one or more correct answers.',
            };
      case 'true_false':
        return choiceCount === 2 && correctChoiceCount === 1
          ? null
          : {
              field: 'choices',
              message: 'True/false questions require exactly two choices and one correct answer.',
            };
      case 'fill_in_the_blank':
      case 'short_answer':
      case 'ordering':
      case 'matching':
        return answerCount > 0
          ? null
          : {
              field: 'answers',
              message: `${row.type} questions require a correct answer definition.`,
            };
      default:
        return {
          field: 'type',
          message: `Unsupported question type for publishing: ${row.type}.`,
        };
    }
  }

  private requireRow<T>(row: T | undefined, entityType: WorkflowEntityType, entityId: string): T {
    if (row !== undefined) {
      return row;
    }

    throw new AppError({
      code: ApiErrorCode.NOT_FOUND,
      message: `${entityType} not found: ${entityId}`,
      statusCode: HttpStatus.NOT_FOUND,
    });
  }

  private requiredTextIssue(
    value: string | null,
    field: string,
    message: string,
  ): PublishValidationIssue | null {
    return value !== null && value.trim().length > 0 ? null : { field, message };
  }

  private countIssue(
    value: string,
    field: string,
    message: string,
  ): PublishValidationIssue | null {
    return this.toCount(value) > 0 ? null : { field, message };
  }

  private toCount(value: string): number {
    return parseInt(value, 10) || 0;
  }

  private compactIssues(
    issues: Array<PublishValidationIssue | null>,
  ): PublishValidationIssue[] {
    return issues.filter((issue): issue is PublishValidationIssue => issue !== null);
  }
}
