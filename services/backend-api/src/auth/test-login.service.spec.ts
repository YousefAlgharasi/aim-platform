import { BackendConfigService } from '../config/backend-config.service';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';
import { TestLoginService } from './test-login.service';

describe('TestLoginService', () => {
  const config = {
    supabase: {
      url: 'https://test-project.supabase.co',
      anonKey: 'test-anon-key',
      serviceRoleKey: 'test-service-role-key',
      jwtSecret: 'test-jwt-secret',
      jwtIssuer: 'https://test-project.supabase.co',
      jwtAudience: 'authenticated',
    },
  } as BackendConfigService;

  const service = new TestLoginService(config);
  const verifier = new SupabaseJwtVerifierService(config);

  it.each(['student', 'admin', 'parent'] as const)(
    'issues a %s access token that the real JWT verifier accepts',
    async (role) => {
      const result = service.issue(role);

      await expect(verifier.verify(result.accessToken)).resolves.toMatchObject({
        id: result.user.id,
        email: result.user.email,
        appMetadata: { role, aim_test_user: true },
      });
    },
  );

  it('issues a fixed, distinct user id per role', () => {
    const ids = new Set(
      (['student', 'admin', 'parent'] as const).map((role) => service.issue(role).user.id),
    );

    expect(ids.size).toBe(3);
  });
});
