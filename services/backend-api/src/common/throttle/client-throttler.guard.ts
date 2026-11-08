import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SupabaseJwtVerifierService } from '../../auth/supabase-jwt-verifier.service';

/**
 * Rate-limit key per client instead of one global bucket.
 *
 *  - Valid bearer token  -> `user:<id>`  (a student behind a shared school/NAT address is not
 *                           throttled by their classmates)
 *  - Anything else       -> `ip:<address>` (real client address, which requires `trust proxy` so
 *                           Express reads X-Forwarded-For from nginx instead of nginx's own address)
 *
 * The token is cryptographically verified here, so a forged `sub` cannot be used to get a fresh
 * bucket; an invalid or expired token simply falls back to the IP bucket.
 */
@Injectable()
export class ClientThrottlerGuard extends ThrottlerGuard {
  // Resolved lazily from the application context so this module doesn't have to import AuthModule.
  @Inject(ModuleRef)
  private readonly moduleRef!: ModuleRef;

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const header = req.headers?.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      try {
        const verifier = this.moduleRef.get(SupabaseJwtVerifierService, { strict: false });
        const user = await verifier.verify(header.slice(7));
        if (user?.id) return `user:${user.id}`;
      } catch {
        // fall through to the IP bucket
      }
    }
    return `ip:${req.ip ?? req.socket?.remoteAddress ?? 'unknown'}`;
  }
}
