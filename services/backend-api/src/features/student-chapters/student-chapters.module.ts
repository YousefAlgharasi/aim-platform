import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { StudentChaptersController } from './student-chapters.controller';
import { StudentChaptersRepository } from './student-chapters.repository';
import { StudentChaptersService } from './student-chapters.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [StudentChaptersController],
  providers: [StudentChaptersRepository, StudentChaptersService],
  exports: [StudentChaptersService],
})
export class StudentChaptersModule {}
