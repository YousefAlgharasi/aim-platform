import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { StudentCoursesController } from './student-courses.controller';
import { StudentCoursesRepository } from './student-courses.repository';
import { StudentCoursesService } from './student-courses.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [StudentCoursesController],
  providers: [StudentCoursesRepository, StudentCoursesService],
  exports: [StudentCoursesService],
})
export class StudentCoursesModule {}
