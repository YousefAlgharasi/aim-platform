import { createHash } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../../database/database.service';
import { JobLockService } from '../../database/job-lock.service';

export type IdempotencyClaim =
  | { readonly kind: 'claimed'; readonly id: string }
  | { readonly kind: 'replay'; readonly status: number; readonly body: unknown }
  | { readonly kind: 'in_progress' }
  | { readonly kind: 'conflict' };

/** An in-progress claim older than this is assumed to belong to a crashed request and may be re-claimed. */
export const STALE_CLAIM_SECONDS = 120;
const RETENTION_HOURS = 48;
export const KEY_PATTERN = /^[A-Za-z0-9_\-:.]{8,128}$/;

export function fingerprint(method: string, path: string, body: unknown): string {
  return createHash('sha256').update(`${method}\n${path}\n${JSON.stringify(body ?? null)}`).digest('hex');
}

interface Row {
  id: string;
  request_hash: string;
  state: 'in_progress' | 'completed';
  response_status: number | null;
  response_body: unknown;
  stale: boolean;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private readonly db: DatabaseService, private readonly jobLock: JobLockService) {}

  /** Atomically claim (userId, scope, key) or report what the earlier request left behind. */
  async claim(userId: string, scope: string, key: string, requestHash: string): Promise<IdempotencyClaim> {
    const inserted = await this.db.query<{ id: string }>(
      `INSERT INTO idempotency_keys (user_id, scope, idem_key, request_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, scope, idem_key) DO NOTHING
       RETURNING id`,
      [userId, scope, key, requestHash],
    );
    if (inserted.rows[0]) return { kind: 'claimed', id: inserted.rows[0].id };

    const existing = await this.db.query<Row>(
      `SELECT id, request_hash, state, response_status, response_body,
              (state = 'in_progress' AND created_at < now() - ($4 || ' seconds')::interval) AS stale
       FROM idempotency_keys WHERE user_id = $1 AND scope = $2 AND idem_key = $3`,
      [userId, scope, key, String(STALE_CLAIM_SECONDS)],
    );
    const row = existing.rows[0];
    if (!row) return this.claim(userId, scope, key, requestHash); // swept between the two statements
    if (row.request_hash !== requestHash) return { kind: 'conflict' };
    if (row.state === 'completed') return { kind: 'replay', status: row.response_status ?? 200, body: row.response_body };
    if (row.stale) {
      const reclaimed = await this.db.query<{ id: string }>(
        `UPDATE idempotency_keys SET created_at = now()
         WHERE id = $1 AND state = 'in_progress' AND created_at < now() - ($2 || ' seconds')::interval
         RETURNING id`,
        [row.id, String(STALE_CLAIM_SECONDS)],
      );
      if (reclaimed.rows[0]) return { kind: 'claimed', id: row.id };
    }
    return { kind: 'in_progress' };
  }

  async complete(id: string, status: number, body: unknown): Promise<void> {
    await this.db.query(
      `UPDATE idempotency_keys
       SET state = 'completed', response_status = $2, response_body = $3::jsonb, completed_at = now()
       WHERE id = $1`,
      [id, status, body === undefined ? null : JSON.stringify(body)],
    );
  }

  /** The request failed: forget the key so the client can retry it. */
  async release(id: string): Promise<void> {
    await this.db.query(`DELETE FROM idempotency_keys WHERE id = $1`, [id]);
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async sweepExpired(): Promise<void> {
    await this.jobLock.runExclusive('idempotency.sweep', async () => {
      const r = await this.db.query(
        `DELETE FROM idempotency_keys WHERE created_at < now() - ($1 || ' hours')::interval`,
        [String(RETENTION_HOURS)],
      );
      this.logger.log(`Idempotency sweep removed ${r.rowCount ?? 0} expired keys`);
    });
  }
}
