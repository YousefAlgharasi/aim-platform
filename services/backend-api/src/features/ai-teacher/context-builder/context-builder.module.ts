import { Module } from '@nestjs/common';

import { StudentsModule } from '../../students/students.module';
import { StudentProfileContextAdapter } from './adapters/student-profile-context.adapter';
import { ContextBuilderService } from './context-builder.service';

@Module({
  imports: [StudentsModule],
  providers: [ContextBuilderService, StudentProfileContextAdapter],
  exports: [ContextBuilderService, StudentProfileContextAdapter],
})
export class ContextBuilderModule {}
