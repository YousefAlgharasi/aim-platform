import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
