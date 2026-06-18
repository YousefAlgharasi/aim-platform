import { Module } from '@nestjs/common';

import { ContextBuilderService } from './context-builder.service';

@Module({
  providers: [ContextBuilderService],
  exports: [ContextBuilderService],
})
export class ContextBuilderModule {}
