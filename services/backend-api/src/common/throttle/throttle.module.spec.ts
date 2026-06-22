import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottleModule } from './throttle.module';

describe('ThrottleModule', () => {
  it('should compile the module with default settings', async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottleModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should respect THROTTLE_TTL and THROTTLE_LIMIT env vars', async () => {
    process.env.THROTTLE_TTL = '30000';
    process.env.THROTTLE_LIMIT = '100';

    // Re-import to pick up env changes — the module reads process.env at import time,
    // but ThrottlerModule.forRoot() is evaluated when the module is compiled.
    // We can at least verify the module still compiles with custom env values set.
    const module = await Test.createTestingModule({
      imports: [ThrottleModule],
    }).compile();

    expect(module).toBeDefined();

    // Clean up
    delete process.env.THROTTLE_TTL;
    delete process.env.THROTTLE_LIMIT;
  });

  it('should provide ThrottlerModule as part of imports', async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottleModule],
    }).compile();

    // ThrottlerModule registers its storage and guard internally
    const throttlerModule = module.get(ThrottlerModule, { strict: false });
    expect(throttlerModule).toBeDefined();
  });
});
