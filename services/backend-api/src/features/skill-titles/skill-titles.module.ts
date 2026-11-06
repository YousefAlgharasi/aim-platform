import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { SkillTitlesController } from './skill-titles.controller';
import { SkillTitlesService } from './skill-titles.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [SkillTitlesController],
  providers: [SkillTitlesService],
  exports: [SkillTitlesService],
})
export class SkillTitlesModule {}
