import { Module } from '@nestjs/common';

import { PromptRendererService } from './prompt-renderer.service';

@Module({
  providers: [PromptRendererService],
  exports: [PromptRendererService],
})
export class PromptRendererModule {}
