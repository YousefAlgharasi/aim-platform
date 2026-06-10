import { Module } from '@nestjs/common';

import { BackendConfigModule } from '../config/backend-config.module';
import { DatabaseService } from './database.service';

@Module({
  imports: [BackendConfigModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
