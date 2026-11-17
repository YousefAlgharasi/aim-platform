import { Module } from '@nestjs/common';

import { AuthModule } from '../../auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { RolesModule } from '../roles';
import { UsersModule } from '../users';
import { AdminLookupController } from './admin-lookup.controller';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [AdminLookupController],
})
export class AdminLookupModule {}
