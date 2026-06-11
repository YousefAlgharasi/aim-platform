import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OPENAPI_TAGS } from '../openapi/openapi.tags';
import { AuthenticatedUser } from './authenticated-user';
import { AuthMeResponse } from './auth-me.types';
import { CurrentUser } from './current-user.decorator';
import { presentAuthMe } from './auth-me.presenter';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';

@ApiTags(OPENAPI_TAGS.auth)
@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(SupabaseJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the safe current authenticated user context.' })
  @ApiOkResponse({ description: 'Safe current authenticated user context.' })
  getMe(@CurrentUser() user: AuthenticatedUser): AuthMeResponse {
    return presentAuthMe(user);
  }
}
