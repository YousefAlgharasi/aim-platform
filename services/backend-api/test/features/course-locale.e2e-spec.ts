import { randomUUID } from 'crypto';
import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request = require('supertest');
import { AppModule } from '../../src/app.module';
import { SupabaseJwtAuthGuard } from '../../src/auth/supabase-jwt-auth.guard';
import { PermissionGuard } from '../../src/auth/authorization/permission.guard';
import { RoleGuard } from '../../src/auth/authorization/role.guard';

const url = process.env.TEST_DATABASE_URL;
const describeDb = url ? describe : describe.skip;

describeDb('Course locale resolution over HTTP (real controllers, real PostgreSQL)', () => {
  let app: INestApplication;
  let pool: Pool;
  let courseId: string;
  let englishOnlyId: string;
  const studentId = randomUUID();

  beforeAll(async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3000',
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      SUPABASE_JWT_SECRET: 'test-jwt-secret',
      SUPABASE_JWT_AUDIENCE: 'authenticated',
      DATABASE_URL: url as string,
      AIM_ENGINE_URL: 'http://localhost:8010',
      AIM_ENGINE_SERVICE_TOKEN: 'test-service-token',
      AI_PROVIDER_API_KEY: 'test-ai-provider-key',
      AI_PROVIDER_MODEL: 'gpt-4',
      STT_PROVIDER_API_KEY: 'test-stt-key',
      STT_PROVIDER_MODEL: 'whisper-1',
      TTS_PROVIDER_API_KEY: 'test-tts-key',
      TTS_PROVIDER_MODEL: 'tts-1',
      TTS_PROVIDER_VOICE: 'af_bella',
      CORS_ORIGINS: 'http://localhost:3000',
    };
    pool = new Pool({ connectionString: url });

    const allow = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: studentId, expiresAt: Date.now() / 1000 + 3600 };
        return true;
      },
    };

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(SupabaseJwtAuthGuard)
      .useValue(allow)
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    const slug = `e2e-${randomUUID()}`;
    const created = await pool.query(
      `INSERT INTO courses (title, slug, description, status, sort_order) VALUES ('English Title', $1, 'English description', 'published', 950) RETURNING id`,
      [slug],
    );
    courseId = created.rows[0].id;
    await pool.query(
      `INSERT INTO course_translations (course_id, locale, title, description) VALUES
         ($1, 'en', 'English Title', 'English description'),
         ($1, 'ar', 'عنوان عربي', 'وصف عربي')`,
      [courseId],
    );
    const other = await pool.query(
      `INSERT INTO courses (title, slug, description, status, sort_order) VALUES ('Only English', $1, 'Only English description', 'published', 951) RETURNING id`,
      [`e2e-${randomUUID()}`],
    );
    englishOnlyId = other.rows[0].id;
    await pool.query(`INSERT INTO course_translations (course_id, locale, title, description) VALUES ($1, 'en', 'Only English', 'Only English description')`, [englishOnlyId]);
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM courses WHERE id = ANY($1::uuid[])`, [[courseId, englishOnlyId]]);
    await pool.end();
    await app.close();
  });

  const detail = (id: string) => request(app.getHttpServer()).get(`/curriculum/courses/${id}`);

  it('serves Arabic for ?locale=ar and reports the locale served', async () => {
    const res = await detail(courseId).query({ locale: 'ar' }).expect(200);
    expect(res.body.data).toMatchObject({ title: 'عنوان عربي', description: 'وصف عربي', locale: 'ar' });
    expect(res.body.data.translations).toBeUndefined();
  });

  it('serves Arabic for Accept-Language: ar and lets ?locale override the header', async () => {
    const byHeader = await detail(courseId).set('Accept-Language', 'ar,en;q=0.5').expect(200);
    expect(byHeader.body.data.title).toBe('عنوان عربي');

    const byQuery = await detail(courseId).query({ locale: 'en' }).set('Accept-Language', 'ar').expect(200);
    expect(byQuery.body.data).toMatchObject({ title: 'English Title', locale: 'en' });
  });

  it('defaults to English when the locale is missing or invalid, without erroring', async () => {
    const missing = await detail(courseId).expect(200);
    expect(missing.body.data).toMatchObject({ title: 'English Title', locale: 'en' });

    for (const bad of ['xx', "ar'; DROP TABLE courses;--", '', 'ar,en']) {
      const res = await detail(courseId).query({ locale: bad }).expect(200);
      expect(res.body.data.locale).toBe('en');
    }
    await detail(courseId).set('Accept-Language', 'zz-ZZ,qq;q=0.4').expect(200);
  });

  it('falls back to English for a course without an Arabic translation', async () => {
    const res = await detail(englishOnlyId).query({ locale: 'ar' }).expect(200);
    expect(res.body.data).toMatchObject({ title: 'Only English', locale: 'en' });
  });

  it('sets Vary and private caching so a cache cannot mix languages', async () => {
    const res = await detail(courseId).query({ locale: 'ar' }).expect(200);
    expect(res.headers['vary']).toMatch(/Accept-Language/i);
    expect(res.headers['cache-control']).toBe('private');
  });

  it('lists courses in the requested language with their available locales', async () => {
    const res = await request(app.getHttpServer()).get('/curriculum/courses').query({ locale: 'ar', limit: 100 }).expect(200);
    const mine = res.body.data.courses.find((c: { id: string }) => c.id === courseId);
    expect(mine).toMatchObject({ title: 'عنوان عربي', locale: 'ar', availableLocales: ['ar', 'en'] });
  });

  it('student courses: serves the requested language and keeps the existing fields', async () => {
    const res = await request(app.getHttpServer()).get('/student/courses').query({ locale: 'ar' });
    expect(res.status).toBe(200);
    const mine = res.body.data.courses.find((c: { id?: string; courseId?: string }) => (c.id ?? c.courseId) === courseId);
    expect(mine).toMatchObject({ title: 'عنوان عربي', description: 'وصف عربي', locale: 'ar' });
    expect(mine).toHaveProperty('lessonCount');
    expect(res.headers['vary']).toMatch(/Accept-Language/i);

    const english = await request(app.getHttpServer()).get('/student/courses');
    const mineEn = english.body.data.courses.find((c: { id?: string; courseId?: string }) => (c.id ?? c.courseId) === courseId);
    expect(mineEn).toMatchObject({ title: 'English Title', locale: 'en' });
  });

  describe('admin translations API', () => {
    const base = () => `/curriculum/courses/${courseId}/translations`;

    it('returns every translation with supported and missing locales', async () => {
      const res = await request(app.getHttpServer()).get(base()).expect(200);
      expect(res.body.data.courseId).toBe(courseId);
      expect(res.body.data.translations.map((t: { locale: string }) => t.locale)).toEqual(['ar', 'en']);
      expect(res.body.data.supportedLocales).toEqual(['en', 'ar']);
      expect(res.body.data.missingLocales).toEqual([]);
    });

    it('updates a translation and the English one keeps courses.title in sync', async () => {
      await request(app.getHttpServer()).put(`${base()}/ar`).send({ title: 'عنوان معدل', description: 'وصف' }).expect(200);
      const ar = await detail(courseId).query({ locale: 'ar' });
      expect(ar.body.data.title).toBe('عنوان معدل');

      await request(app.getHttpServer()).put(`${base()}/en`).send({ title: 'English Updated', description: 'Updated' }).expect(200);
      const legacy = await pool.query(`SELECT title, description FROM courses WHERE id = $1`, [courseId]);
      expect(legacy.rows[0]).toEqual({ title: 'English Updated', description: 'Updated' });
    });

    it('rejects unsupported locales and invalid bodies', async () => {
      await request(app.getHttpServer()).put(`${base()}/fr`).send({ title: 'x' }).expect(400);
      await request(app.getHttpServer()).put(`${base()}/ar`).send({ title: '   ' }).expect(400);
      await request(app.getHttpServer()).get(`/curriculum/courses/${randomUUID()}/translations`).expect(404);
    });

    it('never deletes the English translation', async () => {
      await request(app.getHttpServer()).delete(`${base()}/en`).expect(409);
      const still = await pool.query(`SELECT 1 FROM course_translations WHERE course_id = $1 AND locale = 'en'`, [courseId]);
      expect(still.rowCount).toBe(1);
    });

    it('deletes a non-English translation, after which reads fall back to English', async () => {
      await request(app.getHttpServer()).delete(`${base()}/ar`).expect(200);
      const res = await detail(courseId).query({ locale: 'ar' }).expect(200);
      expect(res.body.data).toMatchObject({ title: 'English Updated', locale: 'en' });
    });
  });
});
