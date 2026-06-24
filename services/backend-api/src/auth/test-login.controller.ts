// Dev/staging-only sign-in shortcut for manual QA. Returns a real, fully
// verifiable JWT (signed with the same Supabase JWT secret the real login
// flow trusts) for a fixed student/admin/parent test account — no Supabase
// call, no real password. Disabled outright in production.
import { Body, Controller, HttpCode, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { BackendConfigService } from '../config/backend-config.service';
import { AuthLoginResult } from './auth-login.types';
import { PublicRoute } from './public-route.decorator';
import { TestLoginDto } from './test-login.dto';
import { TestLoginService } from './test-login.service';

@ApiExcludeController()
@Controller('auth/test-login')
export class TestLoginController {
  constructor(
    private readonly config: BackendConfigService,
    private readonly testLogin: TestLoginService,
  ) {}

  @Post()
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  login(@Body() body: TestLoginDto): AuthLoginResult {
    if (this.config.nodeEnv === 'production') {
      throw new NotFoundException();
    }

    return this.testLogin.issue(body.role);
  }
}
