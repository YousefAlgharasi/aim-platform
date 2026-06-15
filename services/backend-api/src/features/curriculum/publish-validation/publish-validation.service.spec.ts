import { HttpStatus } from '@nestjs/common';
import { PublishValidationService } from './publish-validation.service';

const mockQuery = jest.fn();
const mockDb = { query: mockQuery } as any;
const service = new PublishValidationService(mockDb);

beforeEach(() => mockQuery.mockReset());

describe('PublishValidationService', () => {
  it('allows a course with required metadata and a published level', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ title: 'English A1', description: 'Starter course', published_level_count: '1' }],
    });

    await expect(service.validateReadyForPublish('courses', 'course-1')).resolves.toBeUndefined();
  });

  it('rejects a course without description or published levels', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ title: 'English A1', description: ' ', published_level_count: '0' }],
    });

    await expect(service.validateReadyForPublish('courses', 'course-1')).rejects.toMatchObject({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: expect.stringContaining('Course description is required.'),
    });
  });

  it('rejects a level when its parent course is not published', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ title: 'A1', parent_course_status: 'draft', published_chapter_count: '1' }],
    });

    const result = await service.checkReadiness('levels', 'level-1');

    expect(result.isPublishable).toBe(false);
    expect(result.issues).toContainEqual({
      field: 'course_id',
      message: 'Level parent course must be published.',
    });
  });

  it('rejects a chapter without a published lesson', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ title: 'Basics', parent_level_status: 'published', published_lesson_count: '0' }],
    });

    const result = await service.checkReadiness('chapters', 'chapter-1');

    expect(result.isPublishable).toBe(false);
    expect(result.issues).toContainEqual({
      field: 'lessons',
      message: 'Chapter requires at least one published lesson.',
    });
  });

  it('rejects a lesson without a published skill or asset', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          title: 'Past simple',
          description: 'Learn past simple.',
          published_skill_count: '0',
          published_asset_count: '0',
        },
      ],
    });

    const result = await service.checkReadiness('lessons', 'lesson-1');

    expect(result.isPublishable).toBe(false);
    expect(result.issues).toEqual([
      { field: 'skills', message: 'Lesson requires at least one linked published skill.' },
      { field: 'assets', message: 'Lesson requires at least one published lesson asset.' },
    ]);
  });

  it('allows a lesson with required metadata, published skill, and published asset', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          title: 'Past simple',
          description: 'Learn past simple.',
          published_skill_count: '1',
          published_asset_count: '1',
        },
      ],
    });

    const result = await service.checkReadiness('lessons', 'lesson-1');

    expect(result.isPublishable).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('rejects a skill without objective links', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ key: 'grammar.past_simple.forms', title: 'Past simple forms', objective_count: '0' }],
    });

    const result = await service.checkReadiness('skills', 'skill-1');

    expect(result.isPublishable).toBe(false);
    expect(result.issues).toContainEqual({
      field: 'objectives',
      message: 'Skill requires at least one objective link.',
    });
  });

  it('rejects an objective without a published skill link', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ title: 'Use past simple', published_skill_count: '0' }],
    });

    const result = await service.checkReadiness('objectives', 'objective-1');

    expect(result.isPublishable).toBe(false);
    expect(result.issues).toContainEqual({
      field: 'skills',
      message: 'Objective requires at least one published skill link.',
    });
  });

  it('allows a multiple choice question with exactly one correct choice and a published primary skill', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          type: 'multiple_choice',
          stem: 'Choose the correct sentence.',
          choice_count: '4',
          correct_choice_count: '1',
          answer_count: '0',
          published_primary_skill_count: '1',
        },
      ],
    });

    const result = await service.checkReadiness('questions', 'question-1');

    expect(result.isPublishable).toBe(true);
  });

  it('rejects a question without a valid answer or published primary skill', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          type: 'multiple_choice',
          stem: 'Choose the correct sentence.',
          choice_count: '1',
          correct_choice_count: '0',
          answer_count: '0',
          published_primary_skill_count: '0',
        },
      ],
    });

    const result = await service.checkReadiness('questions', 'question-1');

    expect(result.isPublishable).toBe(false);
    expect(result.issues).toEqual([
      {
        field: 'choices',
        message: 'Multiple choice questions require at least two choices and exactly one correct answer.',
      },
      {
        field: 'skills',
        message: 'Question requires a primary skill mapping to a published skill.',
      },
    ]);
  });

  it('requires answer metadata for short answer questions', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          type: 'short_answer',
          stem: 'Answer briefly.',
          choice_count: '0',
          correct_choice_count: '0',
          answer_count: '0',
          published_primary_skill_count: '1',
        },
      ],
    });

    const result = await service.checkReadiness('questions', 'question-1');

    expect(result.issues).toContainEqual({
      field: 'answers',
      message: 'short_answer questions require a correct answer definition.',
    });
  });

  it('throws 404 when the entity does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await expect(service.checkReadiness('questions', 'missing')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });
});
