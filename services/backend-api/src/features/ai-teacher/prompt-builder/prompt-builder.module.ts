import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../database/database.module';
import { AiTeacherPromptSettingsService } from './prompt-settings.service';
import { PromptBuilderService } from './prompt-builder.service';

@Module({
  imports: [DatabaseModule],
  providers: [PromptBuilderService, AiTeacherPromptSettingsService],
  exports: [PromptBuilderService, AiTeacherPromptSettingsService],
})
export class PromptBuilderModule {}
