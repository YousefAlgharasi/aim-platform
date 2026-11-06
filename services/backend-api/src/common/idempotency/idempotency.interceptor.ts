import {
  CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, finalize, mergeMap, tap } from 'rxjs/operators';
import { AppError } from '../errors/app-error';
import { IDEMPOTENT_KEY, IdempotentOptions } from './idempotent.decorator';
import { IdempotencyService, KEY_PATTERN, fingerprint } from './idempotency.service';

/**
 * Makes opted-in POST routes safe to retry. Behaviour is purely additive: a request without an
 * `Idempotency-Key` header is handled exactly as before.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector, private readonly service: IdempotencyService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const options = this.reflector.get<IdempotentOptions | undefined>(IDEMPOTENT_KEY, context.getHandler());
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const rawKey = req.headers?.['idempotency-key'];
    if (!options || rawKey === undefined) return next.handle();

    const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;
    if (typeof key !== 'string' || !KEY_PATTERN.test(key)) {
      throw new AppError({
        code: 'INVALID_IDEMPOTENCY_KEY',
        message: 'Idempotency-Key must be 8-128 characters: letters, digits, "_", "-", ":" or ".".',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const userId: string | undefined = req.user?.id ?? req.internalUserId;
    if (!userId) return next.handle(); // unauthenticated route: nothing to scope the key to

    const claim = await this.service.claim(
      userId, options.scope, key, fingerprint(req.method, req.route?.path ?? req.path, req.body),
    );

    if (claim.kind === 'conflict') {
      throw new AppError({
        code: 'IDEMPOTENCY_KEY_REUSED',
        message: 'This Idempotency-Key was already used with a different request.',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
    if (claim.kind === 'in_progress') {
      throw new AppError({
        code: 'REQUEST_IN_PROGRESS',
        message: 'The same request is still being processed. Try again in a moment.',
        statusCode: HttpStatus.CONFLICT,
      });
    }
    if (claim.kind === 'replay') {
      if (options.mode === 'once') {
        throw new AppError({
          code: 'DUPLICATE_REQUEST',
          message: 'This request was already processed.',
          statusCode: HttpStatus.CONFLICT,
        });
      }
      res.setHeader?.('Idempotent-Replayed', 'true');
      res.status?.(claim.status);
      return of(claim.body);
    }

    let succeeded = false;
    return next.handle().pipe(
      tap({
        next: (body) => {
          if (options.mode !== 'once') void this.service.complete(claim.id, res.statusCode ?? 200, body).catch(() => undefined);
          succeeded = true;
        },
        complete: () => {
          if (options.mode === 'once') void this.service.complete(claim.id, res.statusCode ?? 200, null).catch(() => undefined);
        },
      }),
      catchError((err) => {
        succeeded = false;
        return from(this.service.release(claim.id).catch(() => undefined)).pipe(mergeMap(() => throwError(() => err)));
      }),
      finalize(() => {
        // Client disconnected before completion (e.g. cancelled stream): free the key for a retry.
        if (!succeeded && options.mode === 'once') void this.service.release(claim.id).catch(() => undefined);
      }),
    );
  }
}
