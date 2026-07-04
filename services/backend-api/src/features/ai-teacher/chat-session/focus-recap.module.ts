/**
 * P21-012: module wrapper for FocusRecapService so both
 * ChatSessionStartModule and ChatHistoryReadModule can share it without
 * duplicating its ContextBuilderModule/SkillsModule dependencies.
 */
import { Module } from '@nestjs/common';

import { ContextBuilderModule } from '../context-builder/context-builder.module';
import { SkillsModule } from '../../curriculum/skills/skills.module';
import { FocusRecapService } from './focus-recap.service';

@Module({
  imports: [ContextBuilderModule, SkillsModule],
  providers: [FocusRecapService],
  exports: [FocusRecapService],
})
export class FocusRecapModule {}
