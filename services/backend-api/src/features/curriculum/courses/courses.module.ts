import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
