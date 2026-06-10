import { Module } from '@nestjs/common';
import { AimEngineClientService } from './aim-engine-client.service';
import { AimService } from './aim.service';

@Module({
  providers: [AimEngineClientService, AimService],
  exports: [AimEngineClientService, AimService],
})
export class AimModule {}
