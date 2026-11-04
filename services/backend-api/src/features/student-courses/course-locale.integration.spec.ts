import { randomUUID } from 'crypto';
import { Client } from 'pg';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { LessonProgressService } from '../lessons/lesson-progress.service';
import { StudentCoursesRepository } from './student-courses.repository';

const url = process.env.TEST_DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb('course locale queries against a real PostgreSQL', () => {
  let client: Client;
  let db: { query: (text: string, values?: unknown[]) => Promise<unknown> };
  let courseId: string;
  const studentId = randomUUID();

  beforeAll(async () => {
    client = new Client({ connectionString: url });
    await client.connect();
    db = { query: (text, values) => client.query(text, values as unknown[]) };
  });

  afterAll(async () => {
    await client.end();
  });

  beforeEach(async () => {
    await client.query('BEGIN');
    const course = await client.query(
      `INSERT INTO courses (title, description, status, sort_order) VALUES ('Locale Course', 'English description', 'published', 900) RETURNING id`,
    );
    courseId = course.rows[0].id;
    await client.query(
      `INSERT INTO course_translations (course_id, locale, title, description) VALUES ($1, 'en', 'Locale Course', 'English description')`,
      [courseId],
    );
    await client.query(
      `INSERT INTO course_enrollments (student_id, course_id, status) VALUES ($1, $2, 'active')`,
      [studentId, courseId],
    );
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
  });

  async function addArabic(description: string | null) {
    await client.query(
      `INSERT INTO course_translations (course_id, locale, title, description) VALUES ($1, 'ar', 'دورة', $2)`,
      [courseId, description],
    );
  }

  it('student courses: serves Arabic when it exists and falls back to English otherwise', async () => {
    const repo = new StudentCoursesRepository(db as never);

    const english = (await repo.findCoursesWithProgress(studentId, 'ar')).find((r) => r.course_id === courseId)!;
    expect(english).toMatchObject({ title: 'Locale Course', description: 'English description', locale: 'en' });

    await addArabic('وصف');
    const arabic = (await repo.findCoursesWithProgress(studentId, 'ar')).find((r) => r.course_id === courseId)!;
    expect(arabic).toMatchObject({ title: 'دورة', description: 'وصف', locale: 'ar' });

    const stillEnglish = (await repo.findCoursesWithProgress(studentId, 'en')).find((r) => r.course_id === courseId)!;
    expect(stillEnglish).toMatchObject({ title: 'Locale Course', locale: 'en' });
  });

  it('student courses: an Arabic row without description does not borrow the English description', async () => {
    await addArabic(null);
    const repo = new StudentCoursesRepository(db as never);

    const row = (await repo.findCoursesWithProgress(studentId, 'ar')).find((r) => r.course_id === courseId)!;

    expect(row).toMatchObject({ title: 'دورة', description: null, locale: 'ar' });
  });

  it('student courses: legacy courses.title is used when no translation row exists', async () => {
    await client.query('DELETE FROM course_translations WHERE course_id = $1', [courseId]);
    const repo = new StudentCoursesRepository(db as never);

    const row = (await repo.findCoursesWithProgress(studentId, 'ar')).find((r) => r.course_id === courseId)!;

    expect(row).toMatchObject({ title: 'Locale Course', description: 'English description', locale: 'en' });
  });

  it('student courses: returns one row per course regardless of translation count', async () => {
    await addArabic('وصف');
    const repo = new StudentCoursesRepository(db as never);

    const rows = (await repo.findCoursesWithProgress(studentId, 'ar')).filter((r) => r.course_id === courseId);

    expect(rows).toHaveLength(1);
  });

  it('enrollment: current and enroll return the localized title and served locale', async () => {
    await addArabic('وصف');
    const service = new EnrollmentService(db as never);

    const current = await service.getCurrentEnrollment(studentId, 'ar');
    expect(current).toMatchObject({ found: true, courseTitle: 'دورة', locale: 'ar' });

    const currentEn = await service.getCurrentEnrollment(studentId, 'en');
    expect(currentEn).toMatchObject({ courseTitle: 'Locale Course', locale: 'en' });

    const again = await service.enroll(studentId, courseId, 'ar');
    expect(again).toMatchObject({ courseTitle: 'دورة', locale: 'ar' });

    const other = randomUUID();
    const fresh = await service.enroll(other, courseId, 'ar');
    expect(fresh).toMatchObject({ courseTitle: 'دورة', locale: 'ar' });
  });

  it('recommended course: fallback and placement-path queries execute and honour the locale', async () => {
    await client.query(`UPDATE courses SET status = 'draft' WHERE id <> $1`, [courseId]);
    await client.query(`UPDATE courses SET sort_order = -0 WHERE id = $1`, [courseId]);
    await addArabic('وصف');
    const service = new LessonProgressService(db as never, {} as never, {} as never);

    const result = await service.findRecommendedCourse(studentId, 'ar');

    expect(result).toMatchObject({ courseId, courseTitle: 'دورة', courseDescription: 'وصف', locale: 'ar' });
  });
});
