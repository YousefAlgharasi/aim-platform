import { Module } from '@nestjs/common';
import { CoursesModule } from './courses/courses.module';
import { LevelsModule } from './levels/levels.module';

@Module({
  imports: [CoursesModule, LevelsModule],
  exports: [CoursesModule, LevelsModule],
})
export class CurriculumModule {}
