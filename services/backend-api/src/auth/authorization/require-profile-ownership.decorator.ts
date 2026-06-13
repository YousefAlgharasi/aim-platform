// Phase 2 — P2-033
// Profile ownership decorator.
//
// Marks a controller handler as requiring profile ownership enforcement.
// The ProfileOwnershipGuard reads this metadata and applies the check.
//
// Usage:
//   @UseGuards(SupabaseJwtAuthGuard, ProfileOwnershipGuard)
//   @RequireProfileOwnership()
//   async getMe(@CurrentUser() user: AuthenticatedUser) { ... }

import { SetMetadata } from '@nestjs/common';
import { PROFILE_OWNERSHIP_KEY } from './authorization.constants';

export const RequireProfileOwnership = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PROFILE_OWNERSHIP_KEY, true);
