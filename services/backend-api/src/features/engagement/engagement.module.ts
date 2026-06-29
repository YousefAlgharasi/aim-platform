import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { EngagementController } from './engagement.controller';
import { EngagementRepository } from './engagement.repository';
import { EngagementService } from './engagement.service';

@Module({
  imports: [DatabaseModule, AuthModule, RolesModule, UsersModule],
  controllers: [EngagementController],
  providers: [EngagementRepository, EngagementService],
  exports: [EngagementService],
})
export class EngagementModule {}
