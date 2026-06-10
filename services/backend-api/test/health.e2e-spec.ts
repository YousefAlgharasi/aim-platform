import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Health endpoint foundation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns a safe success response for GET /health', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        service: 'backend-api',
        environment: 'test',
      },
      meta: {
        path: '/health',
        method: 'GET',
      },
    });

    expect(response.body.data.timestamp).toEqual(expect.any(String));
    expect(response.body.data.uptimeSeconds).toEqual(expect.any(Number));
    expect(response.body.meta.timestamp).toEqual(expect.any(String));

    const serializedBody = JSON.stringify(response.body);
    expect(serializedBody).not.toContain('test-service-role-key');
    expect(serializedBody).not.toContain('test-jwt-secret');
    expect(serializedBody).not.toContain('test-ai-provider-key');
    expect(serializedBody).not.toContain('postgres://');
  });
});
