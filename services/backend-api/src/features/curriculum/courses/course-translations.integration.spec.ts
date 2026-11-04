import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool, PoolClient } from 'pg';
import { CourseTranslationsService } from './course-translations.service';
import { CoursesService } from './courses.service';

const url = process.env.TEST_DATABASE_URL;
const describeDb = url ? describe : describe.skip;

const migrationDir = join(__dirname, '../../../../prisma/migrations/20261031120000_create_course_translations');

describeDb('course translations against a real PostgreSQL', () => {
  let pool: Pool;
  let queryCount = 0;
  const createdCourseIds: string[] = [];

  const db = {
    query: (text: string, values?: unknown[]) => {
      queryCount += 1;
      return pool.query(text, values as unknown[]);
    },
    withClient: async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
      const client = await pool.connect();
      try {
        return await callback(client);
      } finally {
        client.release();
      }
    },
  };

  let courses: CoursesService;
  let translations: CourseTranslationsService;

  async function newCourse(title = 'Integration Course', description: string | null = 'English description') {
    const created = await courses.createCourse({
      title,
      slug: `it-${randomUUID()}`,
      description,
    });
    createdCourseIds.push(created.id);
    return created;
  }

  async function rowFor(courseId: string) {
    const result = await pool.query(`SELECT title, description FROM courses WHERE id = $1`, [courseId]);
    return result.rows[0] as { title: string; description: string | null };
  }

  async function translationFor(courseId: string, locale: string) {
    const result = await pool.query(
      `SELECT title, description FROM course_translations WHERE course_id = $1 AND locale = $2`,
      [courseId, locale],
    );
    return result.rows[0] as { title: string; description: string | null } | undefined;
  }

  beforeAll(async () => {
    pool = new Pool({ connectionString: url });
    courses = new CoursesService(db as never);
    translations = new CourseTranslationsService(db as never);
  });

  afterAll(async () => {
    if (createdCourseIds.length > 0) {
      await pool.query(`DELETE FROM courses WHERE id = ANY($1::uuid[])`, [createdCourseIds]);
    }
    await pool.query(`DROP TRIGGER IF EXISTS it_fail_on_boom ON courses`);
    await pool.query(`DROP FUNCTION IF EXISTS it_fail_on_boom()`);
    await pool.end();
  });

  describe('schema constraints', () => {
    it('allows several translations per course but only one per locale', async () => {
      const course = await newCourse();
      await pool.query(
        `INSERT INTO course_translations (course_id, locale, title) VALUES ($1, 'ar', 'عربي'), ($1, 'fr', 'Français')`,
        [course.id],
      );
      await expect(
        pool.query(`INSERT INTO course_translations (course_id, locale, title) VALUES ($1, 'ar', 'مكرر')`, [course.id]),
      ).rejects.toMatchObject({ code: '23505' });
    });

    it('rejects malformed locale identifiers and accepts well-formed ones without a schema change', async () => {
      const course = await newCourse();
      for (const bad of ['EN', 'english', '', "ar'; DROP TABLE courses;--", 'a', 'ar_SA']) {
        await expect(
          pool.query(`INSERT INTO course_translations (course_id, locale, title) VALUES ($1, $2, 'x')`, [course.id, bad]),
        ).rejects.toMatchObject({ code: expect.stringMatching(/^(23514|22001)$/) });
      }
      for (const good of ['de', 'pt-BR', 'zh-Hans']) {
        await expect(
          pool.query(`INSERT INTO course_translations (course_id, locale, title) VALUES ($1, $2, 'x')`, [course.id, good]),
        ).resolves.toBeDefined();
      }
    });

    it('enforces the foreign key and cascades deletes from the course', async () => {
      await expect(
        pool.query(`INSERT INTO course_translations (course_id, locale, title) VALUES ($1, 'ar', 'x')`, [randomUUID()]),
      ).rejects.toMatchObject({ code: '23503' });

      const course = await newCourse();
      await translations.upsertTranslation(course.id, 'ar', { title: 'عربي' });
      await pool.query(`DELETE FROM courses WHERE id = $1`, [course.id]);
      const left = await pool.query(`SELECT 1 FROM course_translations WHERE course_id = $1`, [course.id]);
      expect(left.rowCount).toBe(0);
    });

    it('maintains updated_at on update', async () => {
      const course = await newCourse();
      const before = await pool.query(
        `SELECT updated_at FROM course_translations WHERE course_id = $1 AND locale = 'en'`,
        [course.id],
      );
      await new Promise((resolve) => setTimeout(resolve, 20));
      await pool.query(`UPDATE course_translations SET title = 'Changed' WHERE course_id = $1 AND locale = 'en'`, [course.id]);
      const after = await pool.query(
        `SELECT updated_at FROM course_translations WHERE course_id = $1 AND locale = 'en'`,
        [course.id],
      );
      expect(new Date(after.rows[0].updated_at).getTime()).toBeGreaterThan(new Date(before.rows[0].updated_at).getTime());
    });

    it('has RLS enabled with no policies', async () => {
      const rls = await pool.query(`SELECT relrowsecurity FROM pg_class WHERE relname = 'course_translations'`);
      const policies = await pool.query(`SELECT 1 FROM pg_policies WHERE tablename = 'course_translations'`);
      expect(rls.rows[0].relrowsecurity).toBe(true);
      expect(policies.rowCount).toBe(0);
    });
  });

  describe('migration', () => {
    const migrationSql = readFileSync(join(migrationDir, 'migration.sql'), 'utf8');
    const rollbackSql = readFileSync(join(migrationDir, 'rollback.sql'), 'utf8');
    const backfillSql = migrationSql.slice(migrationSql.indexOf('INSERT INTO course_translations'));

    it('is idempotent: re-running keeps every existing translation untouched', async () => {
      const course = await newCourse('Original', 'Original description');
      await translations.upsertTranslation(course.id, 'ar', { title: 'عنوان' });
      await pool.query(`UPDATE course_translations SET title = 'Edited en' WHERE course_id = $1 AND locale = 'en'`, [course.id]);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(migrationSql);
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }

      expect((await translationFor(course.id, 'en'))?.title).toBe('Edited en');
      expect((await translationFor(course.id, 'ar'))?.title).toBe('عنوان');
    });

    it('backfills one verbatim English row per course lacking one, with a null description preserved', async () => {
      const course = await newCourse('Verbatim Title', null);
      await pool.query(`DELETE FROM course_translations WHERE course_id = $1`, [course.id]);

      await pool.query(backfillSql);
      await pool.query(backfillSql);

      const rows = await pool.query(`SELECT locale, title, description FROM course_translations WHERE course_id = $1`, [course.id]);
      expect(rows.rows).toEqual([{ locale: 'en', title: 'Verbatim Title', description: null }]);
    });

    it('has a rollback that removes only the new table and leaves the courses table untouched', async () => {
      const course = await newCourse('Keep Me', 'Keep description');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(rollbackSql);
        const gone = await client.query(`SELECT to_regclass('public.course_translations') AS t`);
        expect(gone.rows[0].t).toBeNull();
        const kept = await client.query(`SELECT title, description FROM courses WHERE id = $1`, [course.id]);
        expect(kept.rows[0]).toEqual({ title: 'Keep Me', description: 'Keep description' });
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }
      const restored = await pool.query(`SELECT to_regclass('public.course_translations') AS t`);
      expect(restored.rows[0].t).not.toBeNull();
    });
  });

  describe('transactional writes and legacy column synchronisation', () => {
    it('creating a course writes its English translation', async () => {
      const course = await newCourse('Created', 'Created description');
      expect(await translationFor(course.id, 'en')).toEqual({ title: 'Created', description: 'Created description' });
      expect(course.availableLocales).toEqual(['en']);
    });

    it('updating the legacy title or description keeps the English translation equal', async () => {
      const course = await newCourse();
      await courses.updateCourse(course.id, { title: 'Renamed', description: 'New description' });
      expect(await translationFor(course.id, 'en')).toEqual({ title: 'Renamed', description: 'New description' });
    });

    it('saving the English translation updates courses.title and courses.description together', async () => {
      const course = await newCourse();
      await translations.upsertTranslation(course.id, 'en', { title: 'Via translations', description: 'Via description' });
      expect(await rowFor(course.id)).toEqual({ title: 'Via translations', description: 'Via description' });
    });

    it('saving a non-English translation never changes the legacy English columns (AI teacher compatibility)', async () => {
      const course = await newCourse('English Source', 'English source description');
      await translations.upsertTranslation(course.id, 'ar', { title: 'مصدر عربي', description: 'وصف' });
      expect(await rowFor(course.id)).toEqual({ title: 'English Source', description: 'English source description' });
      const legacyAiQuery = await pool.query(`SELECT co.title AS course_title FROM courses co WHERE co.id = $1`, [course.id]);
      expect(legacyAiQuery.rows[0].course_title).toBe('English Source');
    });

    it('rolls the whole write back when the legacy sync fails mid-transaction', async () => {
      await pool.query(`
        CREATE OR REPLACE FUNCTION it_fail_on_boom() RETURNS trigger AS $$
        BEGIN
          IF NEW.title = 'BOOM' THEN RAISE EXCEPTION 'forced failure'; END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql`);
      await pool.query(`DROP TRIGGER IF EXISTS it_fail_on_boom ON courses`);
      await pool.query(`CREATE TRIGGER it_fail_on_boom BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION it_fail_on_boom()`);

      const course = await newCourse('Stable', 'Stable description');
      await expect(translations.upsertTranslation(course.id, 'en', { title: 'BOOM' })).rejects.toThrow('forced failure');

      expect(await translationFor(course.id, 'en')).toEqual({ title: 'Stable', description: 'Stable description' });
      expect(await rowFor(course.id)).toEqual({ title: 'Stable', description: 'Stable description' });
      await pool.query(`DROP TRIGGER IF EXISTS it_fail_on_boom ON courses`);
    });

    it('never deletes the English translation but deletes others', async () => {
      const course = await newCourse();
      await translations.upsertTranslation(course.id, 'ar', { title: 'عربي' });
      await expect(translations.deleteTranslation(course.id, 'en')).rejects.toMatchObject({ statusCode: 409 });
      expect(await translationFor(course.id, 'en')).toBeDefined();
      await translations.deleteTranslation(course.id, 'ar');
      expect(await translationFor(course.id, 'ar')).toBeUndefined();
      await expect(translations.deleteTranslation(course.id, 'ar')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('lists all translations with supported and missing locales', async () => {
      const course = await newCourse();
      const before = await translations.listTranslations(course.id);
      expect(before.missingLocales).toEqual(['ar']);
      await translations.upsertTranslation(course.id, 'ar', { title: 'عربي', description: 'وصف' });
      const after = await translations.listTranslations(course.id);
      expect(after.translations.map((t) => t.locale)).toEqual(['ar', 'en']);
      expect(after.missingLocales).toEqual([]);
    });
  });

  describe('locale-aware reads', () => {
    it('serves the requested language, falls back to English, and reports the language served', async () => {
      const withArabic = await newCourse('With Arabic', 'English description');
      const englishOnly = await newCourse('English Only', 'Only English');
      await translations.upsertTranslation(withArabic.id, 'ar', { title: 'بالعربية', description: 'وصف عربي' });

      const arabic = await courses.getCourse(withArabic.id, 'ar');
      expect(arabic).toMatchObject({ title: 'بالعربية', description: 'وصف عربي', locale: 'ar' });

      const fallback = await courses.getCourse(englishOnly.id, 'ar');
      expect(fallback).toMatchObject({ title: 'English Only', description: 'Only English', locale: 'en' });

      const english = await courses.getCourse(withArabic.id, 'en');
      expect(english).toMatchObject({ title: 'With Arabic', locale: 'en' });
    });

    it('does not borrow the English description when the Arabic translation has none', async () => {
      const course = await newCourse('Title', 'English description');
      await translations.upsertTranslation(course.id, 'ar', { title: 'عنوان' });
      const arabic = await courses.getCourse(course.id, 'ar');
      expect(arabic.title).toBe('عنوان');
      expect(arabic.description).toBeNull();
    });

    it('returns exactly one resolved title per course and never exposes the translations collection', async () => {
      const course = await newCourse();
      await translations.upsertTranslation(course.id, 'ar', { title: 'عربي' });
      const result = await courses.getCourse(course.id, 'ar');
      expect(Object.keys(result)).not.toContain('translations');
      expect(typeof result.title).toBe('string');
    });

    it('uses a constant number of queries regardless of course and translation count (no N+1)', async () => {
      const batch = [];
      for (let i = 0; i < 6; i += 1) {
        batch.push(await newCourse(`Batch ${i}`));
      }
      for (const course of batch) {
        await translations.upsertTranslation(course.id, 'ar', { title: `دفعة ${course.id}` });
        await pool.query(`INSERT INTO course_translations (course_id, locale, title) VALUES ($1, 'fr', 'f')`, [course.id]);
      }

      queryCount = 0;
      const list = await courses.listCourses(1, 100, undefined, undefined, 'ar');
      expect(queryCount).toBe(2);
      expect(list.courses.length).toBeGreaterThanOrEqual(6);
      const arabicRows = list.courses.filter((c) => c.locale === 'ar');
      expect(arabicRows.length).toBeGreaterThanOrEqual(6);
    });

    it('finds courses by their translated text in admin search', async () => {
      const course = await newCourse('Searchable', 'x');
      await translations.upsertTranslation(course.id, 'ar', { title: 'عنوان-فريد-للبحث' });
      const found = await courses.listCourses(1, 20, undefined, 'فريد-للبحث');
      expect(found.courses.map((c) => c.id)).toContain(course.id);
    });
  });
});
