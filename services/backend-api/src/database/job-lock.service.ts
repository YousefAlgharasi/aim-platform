import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';

export type JobLockResult<T> = { readonly ran: true; readonly value: T } | { readonly ran: false };

/**
 * Cluster-wide mutual exclusion for background jobs, built on Postgres session advisory locks.
 *
 * Why: @Cron jobs run inside every API instance. With two instances each minute-tick would send
 * every reminder twice; and a slow run could overlap the next tick of the same instance.
 * `runExclusive` lets exactly one caller run a named job at a time and skips (not queues) the rest.
 *
 * The lock lives on a dedicated connection for the duration of the job. If the process dies the
 * connection closes and Postgres releases the lock, so there is no stale-lock state to clean up.
 */
@Injectable()
export class JobLockService {
  private readonly logger = new Logger(JobLockService.name);

  constructor(private readonly db: DatabaseService) {}

  async runExclusive<T>(jobName: string, job: () => Promise<T>): Promise<JobLockResult<T>> {
    return this.db.withClient(async (client) => {
      const got = await client.query<{ locked: boolean }>(
        'SELECT pg_try_advisory_lock(hashtextextended($1, 0)) AS locked',
        [`aim:job:${jobName}`],
      );
      if (!got.rows[0]?.locked) {
        this.logger.debug(`Job '${jobName}' is already running elsewhere; skipping this tick`);
        return { ran: false } as const;
      }
      try {
        return { ran: true, value: await job() } as const;
      } finally {
        await client
          .query('SELECT pg_advisory_unlock(hashtextextended($1, 0))', [`aim:job:${jobName}`])
          .catch((error: Error) => this.logger.warn(`Could not release lock '${jobName}': ${error.message}`));
      }
    });
  }
}
