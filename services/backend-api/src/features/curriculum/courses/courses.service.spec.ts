import { HttpStatus } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { DatabaseService } from '../../../database/database.service';

const clientQuery = jest.fn();
const mockDb = {
  query: jest.fn(),
  withClient: jest.fn(async (callback: (client: { query: jest.Mock }) => Promise<unknown>) =>
    callback({ query: clientQuery }),
  ),
} as unknown as DatabaseService;

const service = new CoursesService(mockDb);

const baseRow = {
  id: 'uuid-1',
  title: 'Course A',
  slug: 'course-a',
  description: null,
  sort_order: 0,
  status: 'draft',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  locale: 'en',
  available_locales: ['en'],
};

function sqlOf(call: unknown[]): string {
  return call[0] as string;
}

beforeEach(() => {
  jest.clearAllMocks();
  clientQuery.mockReset();
});

describe('CoursesService.listCourses', () => {
  it('returns paginated result with no status filter', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '3' }] })
      .mockResolvedValueOnce({ rows: [baseRow] });

    const result = await service.listCourses(1, 20);

    expect(result.total).toBe(3);
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].title).toBe('Course A');
    expect(result.courses[0].sortOrder).toBe(0);
    expect(result.courses[0].locale).toBe('en');
    expect(result.courses[0].availableLocales).toEqual(['en']);
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

  it('applies text search across course fields and translations', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listCourses(1, 20, undefined, 'beginner');

    const countCall = (mockDb.query as jest.Mock).mock.calls[0];
    expect(sqlOf(countCall)).toContain('c.title ILIKE $1');
    expect(sqlOf(countCall)).toContain('course_translations');
    expect(countCall[1]).toContain('%beginner%');
  });

  it('resolves text with the requested locale and English fallback in one query', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '1' }] })
      .mockResolvedValueOnce({ rows: [{ ...baseRow, locale: 'ar' }] });

    const result = await service.listCourses(1, 20, 'published', undefined, 'ar');

    expect(mockDb.query).toHaveBeenCalledTimes(2);
    const dataCall = (mockDb.query as jest.Mock).mock.calls[1];
    expect(sqlOf(dataCall)).toContain("ct_en.locale = 'en'");
    expect(sqlOf(dataCall)).toContain('ct_req.locale = $2::text');
    expect(dataCall[1]).toEqual(['published', 'ar', 20, 0]);
    expect(result.courses[0].locale).toBe('ar');
  });

  it('defaults to English when no locale is given', async () => {
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ total: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    await service.listCourses(1, 20);

    const dataCall = (mockDb.query as jest.Mock).mock.calls[1];
    expect(dataCall[1]).toEqual(['en', 20, 0]);
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
      rows: [{ ...baseRow, slug: null, description: 'Desc', sort_order: 1, status: 'published' }],
    });

    const course = await service.getCourse('uuid-1');

    expect(course.id).toBe('uuid-1');
    expect(course.status).toBe('published');
    expect(course.locale).toBe('en');
  });

  it('passes the locale as a parameter', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...baseRow, locale: 'ar' }] });

    const course = await service.getCourse('uuid-1', 'ar');

    expect((mockDb.query as jest.Mock).mock.calls[0][1]).toEqual(['uuid-1', 'ar']);
    expect(course.locale).toBe('ar');
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

  it('creates the course and its English translation in one transaction', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max_order: '2' }] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...baseRow, id: 'new-uuid', title: 'New Course', sort_order: 3 }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});

    const course = await service.createCourse({ title: 'New Course' });

    expect(course.status).toBe('draft');
    expect(course.title).toBe('New Course');
    const statements = clientQuery.mock.calls.map((c) => sqlOf(c));
    expect(statements[0]).toBe('BEGIN');
    expect(statements[1]).toContain('INSERT INTO courses');
    expect(statements[2]).toContain('INSERT INTO course_translations');
    expect(statements[3]).toBe('COMMIT');
  });

  it('rolls back when the English translation cannot be written', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max_order: '2' }] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...baseRow, id: 'new-uuid' }] })
      .mockRejectedValueOnce(new Error('translation insert failed'))
      .mockResolvedValueOnce({});

    await expect(service.createCourse({ title: 'New Course' })).rejects.toThrow('translation insert failed');

    const statements = clientQuery.mock.calls.map((c) => sqlOf(c));
    expect(statements).toContain('ROLLBACK');
    expect(statements).not.toContain('COMMIT');
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
    const row = { ...baseRow, title: 'Existing' };
    (mockDb.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [row] })
      .mockResolvedValueOnce({ rows: [row] });

    const course = await service.updateCourse('uuid-1', {});
    expect(course.title).toBe('Existing');
    expect(mockDb.withClient).not.toHaveBeenCalled();
  });

  it('keeps the English translation in sync when title changes', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...baseRow, title: 'Renamed' }] })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ locale: 'ar' }, { locale: 'en' }] })
      .mockResolvedValueOnce({});

    const course = await service.updateCourse('uuid-1', { title: 'Renamed' });

    const statements = clientQuery.mock.calls.map((c) => sqlOf(c));
    expect(statements[1]).toContain('UPDATE courses');
    expect(statements[2]).toContain('INSERT INTO course_translations');
    expect(statements[statements.length - 1]).toBe('COMMIT');
    expect(course.title).toBe('Renamed');
    expect(course.availableLocales).toEqual(['ar', 'en']);
  });

  it('does not touch translations when only the sort order changes', async () => {
    (mockDb.query as jest.Mock).mockResolvedValueOnce({ rows: [baseRow] });
    clientQuery
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ rows: [{ ...baseRow, sort_order: 5 }] })
      .mockResolvedValueOnce({ rows: [{ locale: 'en' }] })
      .mockResolvedValueOnce({});

    await service.updateCourse('uuid-1', { sortOrder: 5 });

    const statements = clientQuery.mock.calls.map((c) => sqlOf(c));
    expect(statements.some((s) => s.includes('INSERT INTO course_translations'))).toBe(false);
  });
});
