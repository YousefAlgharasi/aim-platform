// Issues self-signed HS256 sessions for fixed student/admin/parent test
// accounts so the mobile app can be manually tested without real Supabase
// credentials. Never wired up in production — see TestLoginController.
import { createHmac } from 'crypto';
import { Injectable } from '@nestjs/common';
import { BackendConfigService } from '../config/backend-config.service';
import { AuthLoginResult } from './auth-login.types';
import { TestLoginRole } from './test-login.dto';

const TEST_USER_IDS: Record<TestLoginRole, string> = {
  student: '00000000-0000-4000-8000-000000000001',
  admin: '00000000-0000-4000-8000-000000000002',
  parent: '00000000-0000-4000-8000-000000000003',
};

const TEST_TOKEN_TTL_SECONDS = 60 * 60;

@Injectable()
export class TestLoginService {
  constructor(private readonly config: BackendConfigService) {}

  issue(role: TestLoginRole): AuthLoginResult {
    const userId = TEST_USER_IDS[role];
    const email = `test-${role}@aim.local`;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + TEST_TOKEN_TTL_SECONDS;

    const accessToken = this.signToken({
      sub: userId,
      email,
      role: 'authenticated',
      iss: this.config.supabase.jwtIssuer,
      aud: this.config.supabase.jwtAudience,
      iat: now,
      exp: expiresAt,
      app_metadata: { role, aim_test_user: true },
    });

    return {
      accessToken,
      refreshToken: `test-mode-refresh-${userId}`,
      expiresAt,
      user: { id: userId, email },
    };
  }

  private signToken(payload: Record<string, unknown>): string {
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64UrlEncode(JSON.stringify(payload));
    const signedPart = `${header}.${body}`;
    const signature = createHmac('sha256', this.config.supabase.jwtSecret)
      .update(signedPart)
      .digest('base64url');

    return `${signedPart}.${signature}`;
  }
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString('base64url');
}
