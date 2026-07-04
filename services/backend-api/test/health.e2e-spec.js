"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Health endpoint foundation', () => {
    let app;
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
            DATABASE_URL: 'postgresql://localhost:5432/aim_test',
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
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
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
//# sourceMappingURL=health.e2e-spec.js.map