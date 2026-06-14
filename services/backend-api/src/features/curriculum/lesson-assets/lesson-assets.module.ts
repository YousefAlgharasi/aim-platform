import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { LessonAssetsController } from './lesson-assets.controller';
import { LessonAssetsService } from './lesson-assets.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [LessonAssetsController],
  providers: [LessonAssetsService],
  exports: [LessonAssetsService],
})
export class LessonAssetsModule {}
