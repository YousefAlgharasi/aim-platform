import { Module } from '@nestjs/common';

import { AimService } from './aim.service';

@Module({
  providers: [AimService],
  exports: [AimService],
})
export class AimModule {}
