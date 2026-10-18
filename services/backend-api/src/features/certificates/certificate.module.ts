import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth';
import { RolesModule } from '../roles';
import { UsersModule } from '../users';
import { LessonsModule } from '../lessons/lessons.module';
import { CertificateController } from './certificate.controller';
import { StudentCertificateController } from './student-certificate.controller';
import { CertificateService } from './certificate.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule, LessonsModule],
  controllers: [CertificateController, StudentCertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {}
