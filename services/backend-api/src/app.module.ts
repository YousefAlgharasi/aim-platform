import { Module } from '@nestjs/common';
import { BackendConfigModule } from './config/backend-config.module';

@Module({
  imports: [BackendConfigModule],
})
export class AppModule {}
