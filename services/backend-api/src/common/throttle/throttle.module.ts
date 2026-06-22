import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

const DEFAULT_TTL_MS = 60_000;
const DEFAULT_LIMIT = 60;

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? String(DEFAULT_TTL_MS), 10),
        limit: parseInt(
          process.env.THROTTLE_LIMIT ?? String(DEFAULT_LIMIT),
          10,
        ),
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ThrottleModule {}
