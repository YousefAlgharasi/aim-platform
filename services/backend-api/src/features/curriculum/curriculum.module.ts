import { Module } from '@nestjs/common';
import { ChaptersModule } from './chapters/chapters.module';
import { CoursesModule } from './courses/courses.module';
import { LevelsModule } from './levels/levels.module';

@Module({
  imports: [CoursesModule, ChaptersModule],
  exports: [CoursesModule, ChaptersModule],
})
export class CurriculumModule {}
