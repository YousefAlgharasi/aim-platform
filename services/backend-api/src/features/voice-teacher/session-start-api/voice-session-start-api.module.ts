/**
 * P9-068: Create Start Voice Session API — module wiring.
 * Wires `VoiceSessionStartController` (POST /voice-teacher/sessions) onto
 * `VoiceSessionStartService` (P9-049).
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { VoiceSessionStartModule } from '../session-start/voice-session-start.module';
import { VoiceSessionStartController } from './voice-session-start.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, VoiceSessionStartModule],
  controllers: [VoiceSessionStartController],
})
export class VoiceSessionStartApiModule {}
