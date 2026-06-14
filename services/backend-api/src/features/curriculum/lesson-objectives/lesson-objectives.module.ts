import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { LessonObjectivesController } from './lesson-objectives.controller';
import { LessonObjectivesService } from './lesson-objectives.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [LessonObjectivesController],
  providers: [LessonObjectivesService],
  exports: [LessonObjectivesService],
})
export class LessonObjectivesModule {}
