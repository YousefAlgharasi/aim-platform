import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { PublishValidationService } from './publish-validation.service';

@Module({
  imports: [DatabaseModule],
  providers: [PublishValidationService],
  exports: [PublishValidationService],
})
export class PublishValidationModule {}
