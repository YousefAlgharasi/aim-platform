// P19-009
// Placement Test integration test.
//
// Boots the real PlacementModule (real controllers, real guards, real
// services — no mocked business logic) behind a full Nest HTTP server, and
// swaps only DatabaseService for an in-memory FakeDatabaseService (see
// fake-database.service.ts) since there is no live Postgres instance
// available in this test environment.
//
// SupabaseJwtAuthGuard is overridden with a stub that reads test-only
// headers (x-test-user-id, x-test-role) instead of verifying a real JWT —
// PlacementPermissionGuard, RequireRoles, and all placement business logic
// run unmodified, so authorization behavior is exercised for real.
//
// This file is test-only: no production code is modified by P19-009.

import { CanActivate, ExecutionContext, INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { PlacementModule } from '../../../src/features/placement/placement.module';
import { DatabaseService } from '../../../src/database/database.service';
import { SupabaseJwtAuthGuard } from '../../../src/auth/supabase-jwt-auth.guard';
import { FakeDatabaseService } from './fake-database.service';

/** Stub auth guard — reads identity from test-only headers instead of a real JWT. */
class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-test-user-id'];
    const role = request.headers['x-test-role'];

    if (!userId) {
      throw new UnauthorizedException('Missing bearer token');
    }

    request.user = {
      id: userId,
      appMetadata: role ? { role } : {},
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    };
    return true;
  }
}

describe('Placement integration (P19-009)', () => {
  let app: INestApplication;
  let db: FakeDatabaseService;

  const studentId = 'student-aaa';
  const otherStudentId = 'student-bbb';

  function asStudent(id: string = studentId) {
    return { 'x-test-user-id': id, 'x-test-role': 'student' };
  }

  beforeAll(async () => {
    process.env = {
      ...process.env,
      AIM_ENGINE_SERVICE_TOKEN: 'test-service-token',
      STT_PROVIDER_API_KEY: 'test-stt-key',
      STT_PROVIDER_MODEL: 'whisper-1',
      TTS_PROVIDER_API_KEY: 'test-tts-key',
      TTS_PROVIDER_MODEL: 'tts-1',
      TTS_PROVIDER_VOICE: 'af_bella',
    };

    db = new FakeDatabaseService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlacementModule],
    })
      .overrideProvider(DatabaseService)
      .useValue(db)
      .overrideGuard(SupabaseJwtAuthGuard)
      .useClass(TestAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('happy path: start -> answer all sections -> complete -> fetch result', () => {
    it('runs the full flow and never exposes raw scoring data', async () => {
      db.seedPublishedTest();

      const startResponse = await request(app.getHttpServer())
        .post('/placement/attempts')
        .set(asStudent())
        .expect(201);

      const attemptId = startResponse.body.id;
      expect(attemptId).toEqual(expect.any(String));
      expect(startResponse.body.status).toBe('active');

      const sectionsResponse = await request(app.getHttpServer())
        .get('/placement/sections')
        .set(asStudent())
        .expect(200);

      expect(sectionsResponse.body).toHaveLength(2);

      for (const section of sectionsResponse.body) {
        const questionsResponse = await request(app.getHttpServer())
          .get(`/placement/questions?sectionId=${section.id}`)
          .set(asStudent())
          .expect(200);

        for (const question of questionsResponse.body) {
          expect(question.correct_answer).toBeUndefined();

          const answerResponse = await request(app.getHttpServer())
            .post(`/placement/attempts/${attemptId}/answers`)
            .set(asStudent())
            .send({ placement_question_id: question.id, answer_value: 'A' })
            .expect(201);

          expect(answerResponse.body.is_correct).toBeUndefined();
          expect(answerResponse.body.skill_code).toBeUndefined();
        }
      }

      const completeResponse = await request(app.getHttpServer())
        .post(`/placement/attempts/${attemptId}/complete`)
        .set(asStudent())
        .expect(200);

      expect(completeResponse.body.status).toBe('submitted');

      const resultResponse = await request(app.getHttpServer())
        .get(`/placement/attempts/${attemptId}/result`)
        .set(asStudent())
        .expect(200);

      const serializedResult = JSON.stringify(resultResponse.body);
      expect(resultResponse.body.estimated_level).toEqual(expect.any(String));
      expect(serializedResult).not.toContain('overallScore');
      expect(serializedResult).not.toContain('correctnessRatio');
      expect(resultResponse.body.correct_answer).toBeUndefined();

      const attempt = db.attempts.find((a) => a.id === attemptId);
      expect(attempt?.status).toBe('completed');
    });
  });

  describe('retake behavior', () => {
    it('starting a new attempt abandons the previous active attempt for the same student', async () => {
      db.seedPublishedTest();

      const first = await request(app.getHttpServer())
        .post('/placement/attempts')
        .set(asStudent('student-retake'))
        .expect(201);

      const second = await request(app.getHttpServer())
        .post('/placement/attempts')
        .set(asStudent('student-retake'))
        .expect(201);

      expect(second.body.id).not.toBe(first.body.id);

      const firstAttempt = db.attempts.find((a) => a.id === first.body.id);
      const secondAttempt = db.attempts.find((a) => a.id === second.body.id);
      expect(firstAttempt?.status).toBe('abandoned');
      expect(secondAttempt?.status).toBe('active');
    });
  });

  describe('duplicate answers', () => {
    it('rejects a second answer for the same question in the same attempt with 409', async () => {
      const { sectionIds, questionIdsBySection } = db.seedPublishedTest();
      const questionId = questionIdsBySection[sectionIds[0]][0];

      const start = await request(app.getHttpServer())
        .post('/placement/attempts')
        .set(asStudent('student-dup'))
        .expect(201);

      await request(app.getHttpServer())
        .post(`/placement/attempts/${start.body.id}/answers`)
        .set(asStudent('student-dup'))
        .send({ placement_question_id: questionId, answer_value: 'A' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/placement/attempts/${start.body.id}/answers`)
        .set(asStudent('student-dup'))
        .send({ placement_question_id: questionId, answer_value: 'B' })
        .expect(409);
    });
  });

  describe('authorization', () => {
    it('returns 401 when no auth headers are supplied', async () => {
      await request(app.getHttpServer()).post('/placement/attempts').expect(401);
    });

    it('returns 404 when a student requests another student\'s attempt', async () => {
      const start = await request(app.getHttpServer())
        .post('/placement/attempts')
        .set(asStudent(studentId))
        .expect(201);

      await request(app.getHttpServer())
        .get(`/placement/attempts/${start.body.id}/result`)
        .set(asStudent(otherStudentId))
        .expect(404);
    });

    it('returns 403 when a non-student role attempts a student endpoint', async () => {
      await request(app.getHttpServer())
        .post('/placement/attempts')
        .set({ 'x-test-user-id': 'admin-user', 'x-test-role': 'admin' })
        .expect(403);
    });
  });

  describe('edge cases', () => {
    it('rejects answering a question that does not belong to the active test', async () => {
      db.seedPublishedTest();
      const foreignTest = db.seedPublishedTest();
      // Re-publish only the first test so /placement/attempts targets it.
      db.tests.forEach((t, index) => {
        t.status = index === 0 ? 'published' : 'archived';
      });

      const activeTest = db.tests.find((t) => t.status === 'published');
      const start = await request(app.getHttpServer())
        .post('/placement/attempts')
        .set(asStudent('student-foreign'))
        .expect(201);

      expect(start.body.placement_test_id).toBe(activeTest?.id);

      const foreignQuestionId = Object.values(foreignTest.questionIdsBySection)[0][0];

      await request(app.getHttpServer())
        .post(`/placement/attempts/${start.body.id}/answers`)
        .set(asStudent('student-foreign'))
        .send({ placement_question_id: foreignQuestionId, answer_value: 'A' })
        .expect(404);
    });

    it('rejects completing an attempt that does not belong to the requesting student', async () => {
      const start = await request(app.getHttpServer())
        .post('/placement/attempts')
        .set(asStudent('student-owner'))
        .expect(201);

      await request(app.getHttpServer())
        .post(`/placement/attempts/${start.body.id}/complete`)
        .set(asStudent('student-intruder'))
        .expect(404);
    });
  });
});
