import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { LocaleModule } from '../../../common/locale';
import { CourseTranslationsController } from './course-translations.controller';
import { CourseTranslationsService } from './course-translations.service';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [AuthModule, DatabaseModule, LocaleModule, RolesModule, UsersModule],
  controllers: [CoursesController, CourseTranslationsController],
  providers: [CoursesService, CourseTranslationsService],
  exports: [CoursesService, CourseTranslationsService],
})
export class CoursesModule {}
