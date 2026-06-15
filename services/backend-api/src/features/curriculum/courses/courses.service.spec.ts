import { HttpStatus } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { DatabaseService } from '../../../database/database.service';

const mockDb = {
  query: jest.fn(),
} as unknown as DatabaseService;

const service = new CoursesService(mockDb);

beforeEach(() => jest.clearAllMocks());

describe('CoursesService.listCourses', () => {
  it('returns paginated result with no status filter', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '3' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'uuid-1',
            title: 'Course A',
            slug: 'course-a',
            description: null,
            sort_order: 0,
            status: 'draft',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      });

    const result = await service.listCourses(1, 20);

    expect(result.total).toBe(3);
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].title).toBe('Course A');
    expect(result.courses[0].sortOrder).toBe(0);
  });

  it('rejects invalid status value', async () => {
    await expect(service.listCourses(1, 20, 'invalid_status')).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('clamps limit to MAX_LIMIT', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listCourses(1, 9999);

    const secondCall = (mockDb.query as jest.Mock).mock.calls[1];
    expect(secondCall[1]).toContain(100);
  });

  it('applies text search across course fields', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listCourses(1, 20, undefined, 'beginner');

    const countCall = (mockDb.query as jest.Mock).mock.calls[0];
    expect(countCall[0]).toContain('title ILIKE $1');
    expect(countCall[1]).toContain('%beginner%');
  });
});

describe('CoursesService.getCourse', () => {
  it('throws NOT_FOUND when course is missing', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(service.getCourse('missing-id')).rejects.toMatchObject({
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns course summary when found', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          id: 'uuid-1',
          title: 'Course A',
          slug: null,
          description: 'Desc',
          sort_order: 1,
          status: 'published',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ],
    });

    const course = await service.getCourse('uuid-1');

    expect(course.id).toBe('uuid-1');
    expect(course.status).toBe('published');
  });
});

describe('CoursesService.createCourse', () => {
  it('throws VALIDATION_ERROR when title is empty', async () => {
    await expect(service.createCourse({ title: '   ' })).rejects.toMatchObject({
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('throws CONFLICT when slug already exists', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 'existing-id' }],
    });

    await expect(
      service.createCourse({ title: 'New Course', slug: 'taken-slug' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.CONFLICT });
  });

  it('creates course with draft status', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ max_order: '2' }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'new-uuid',
            title: 'New Course',
            slug: null,
            description: null,
            sort_order: 3,
            status: 'draft',
            created_at: '2026-06-14T00:00:00Z',
            updated_at: '2026-06-14T00:00:00Z',
          },
        ],
      });

    const course = await service.createCourse({ title: 'New Course' });

    expect(course.status).toBe('draft');
    expect(course.title).toBe('New Course');
  });
});

describe('CoursesService.updateCourse', () => {
  it('throws NOT_FOUND when course does not exist', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await expect(
      service.updateCourse('missing-id', { title: 'X' }),
    ).rejects.toMatchObject({ statusCode: HttpStatus.NOT_FOUND });
  });

  it('returns current course when no fields to update', async () => {
    const row = {
      id: 'uuid-1',
      title: 'Existing',
      slug: null,
      description: null,
      sort_order: 0,
      status: 'draft',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [row] })
      .mockResolvedValueOnce({ rows: [row] });

    const course = await service.updateCourse('uuid-1', {});
    expect(course.title).toBe('Existing');
  });
});
