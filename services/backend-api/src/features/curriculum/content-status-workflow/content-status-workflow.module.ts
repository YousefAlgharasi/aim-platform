import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { PublishValidationModule } from '../publish-validation/publish-validation.module';
import { ContentStatusWorkflowController } from './content-status-workflow.controller';
import { ContentStatusWorkflowService } from './content-status-workflow.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule, PublishValidationModule],
  controllers: [ContentStatusWorkflowController],
  providers: [ContentStatusWorkflowService],
  exports: [ContentStatusWorkflowService],
})
export class ContentStatusWorkflowModule {}
