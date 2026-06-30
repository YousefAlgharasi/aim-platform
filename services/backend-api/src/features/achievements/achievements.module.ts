import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AchievementsController } from './achievements.controller';
import { AchievementsRepository } from './achievements.repository';
import { AchievementsService } from './achievements.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [AchievementsController],
  providers: [AchievementsRepository, AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
