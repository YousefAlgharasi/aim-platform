import { Global, Module } from '@nestjs/common';
import { BackendConfigService } from './backend-config.service';

@Global()
@Module({
  providers: [BackendConfigService],
  exports: [BackendConfigService],
})
export class BackendConfigModule {}
