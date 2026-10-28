import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AppVersionController } from './app-version.controller';
import { AppVersionService } from './app-version.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AppVersionController],
  providers: [AppVersionService],
})
export class AppVersionModule {}
