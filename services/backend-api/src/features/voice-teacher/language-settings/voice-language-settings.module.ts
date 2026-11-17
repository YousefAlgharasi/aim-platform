import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { DatabaseModule } from '../../../database/database.module';
import { VoiceLanguageSettingsController } from './voice-language-settings.controller';
import { VoiceLanguageSettingsService } from './voice-language-settings.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [VoiceLanguageSettingsController],
  providers: [VoiceLanguageSettingsService],
  exports: [VoiceLanguageSettingsService],
})
export class VoiceLanguageSettingsModule {}
