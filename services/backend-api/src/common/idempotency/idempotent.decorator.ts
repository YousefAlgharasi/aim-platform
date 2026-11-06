import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'aim:idempotent';

export interface IdempotentOptions {
  /** Namespace for the key (one per logical operation). */
  readonly scope: string;
  /**
   * 'replay' (default): a repeat with the same key gets the stored JSON response back.
   * 'once': for streaming (SSE) routes whose response cannot be replayed — a repeat gets 409.
   */
  readonly mode?: 'replay' | 'once';
}

/** Opt a POST route in to `Idempotency-Key` handling (requires IdempotencyInterceptor on the route). */
export const Idempotent = (options: IdempotentOptions) => SetMetadata(IDEMPOTENT_KEY, options);
