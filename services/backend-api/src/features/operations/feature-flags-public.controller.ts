import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { FeatureFlagService } from './feature-flag.service';

/** Client-facing read of the flags managed in Admin → Operations → Feature Flags. */
@ApiTags('Feature Flags')
@Controller('feature-flags')
@UseGuards(SupabaseJwtAuthGuard)
@ApiBearerAuth()
export class FeatureFlagsPublicController {
  constructor(private readonly flags: FeatureFlagService) {}

  @Get()
  @ApiOperation({ summary: 'Evaluate all feature flags for the signed-in user' })
  async getMine(@Req() req: AuthenticatedRequest): Promise<{ flags: Record<string, boolean> }> {
    return { flags: await this.flags.evaluateAll(req.user!.id) };
  }
}
