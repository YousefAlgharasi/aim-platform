import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { OperationsAdminGuard } from '../operations/operations.guards';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AdminAppVersionController } from './admin-app-version.controller';
import { AppVersionController } from './app-version.controller';
import { AppVersionService } from './app-version.service';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, RolesModule],
  controllers: [AppVersionController, AdminAppVersionController],
  providers: [AppVersionService, OperationsAdminGuard],
})
export class AppVersionModule {}
