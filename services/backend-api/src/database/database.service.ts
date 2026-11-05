import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

import { BackendConfigService } from '../config/backend-config.service';
import { DatabaseHealthCheckResult } from './database.types';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;

  constructor(private readonly backendConfig: BackendConfigService) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.getPool().query<T>(text, [...values]);
  }

  async withClient<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getPool().connect();

    try {
      return await callback(client);
    } finally {
      client.release();
    }
  }

  async checkHealth(): Promise<DatabaseHealthCheckResult> {
    const startedAt = Date.now();

    try {
      await this.query('select 1 as health_check');

      return {
        status: 'ok',
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        status: 'unavailable',
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        errorCode: this.toSafeErrorCode(error),
      };
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool !== null) {
      await this.pool.end();
      this.pool = null;
    }
  }

  private getPool(): Pool {
    if (this.pool !== null) {
      return this.pool;
    }

    const rawUrl = this.backendConfig.database.url;
    const requiresSsl = rawUrl.includes('sslmode=require') || this.backendConfig.nodeEnv === 'production';
    const connectionString = this.stripSslMode(rawUrl);

    const timeouts = readPoolTimeouts(process.env);
    this.pool = new Pool({
      connectionString,
      max: timeouts.poolMax,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      // Server-side limits so a stuck query or an abandoned transaction can never hold a
      // connection (and, with a pool of 10, the whole API) hostage.
      statement_timeout: timeouts.statementTimeoutMs,
      idle_in_transaction_session_timeout: timeouts.idleInTransactionTimeoutMs,
      // Client-side backstop slightly above the server limit.
      query_timeout: timeouts.statementTimeoutMs + 5_000,
      application_name: 'aim-backend-api',
      keepAlive: true,
      ssl: requiresSsl
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });

    // An error on an idle pooled client (e.g. the database restarted) is emitted on the pool;
    // without a listener Node treats it as uncaught and the process exits.
    this.pool.on('error', (error) => {
      this.logger.error(`Idle database client error: ${error.message}`);
    });

    return this.pool;
  }

  // pg's ConnectionParameters does `Object.assign({}, config, parse(connectionString))`,
  // so a `sslmode` query param in the connection string silently overrides the `ssl`
  // option passed to the Pool constructor above. Strip it so our explicit ssl config wins.
  private stripSslMode(connectionString: string): string {
    try {
      const url = new URL(connectionString);
      url.searchParams.delete('sslmode');
      return url.toString();
    } catch {
      return connectionString;
    }
  }

  private toSafeErrorCode(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'string'
    ) {
      return (error as { code: string }).code;
    }

    return 'DATABASE_HEALTH_CHECK_FAILED';
  }
}

export interface PoolTimeouts {
  readonly poolMax: number;
  readonly statementTimeoutMs: number;
  readonly idleInTransactionTimeoutMs: number;
}

function positiveInt(raw: string | undefined, fallback: number): number {
  const n = raw === undefined ? NaN : parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** DB_POOL_MAX / DB_STATEMENT_TIMEOUT_MS / DB_IDLE_IN_TX_TIMEOUT_MS override the defaults (10 / 30s / 60s). */
export function readPoolTimeouts(env: NodeJS.ProcessEnv): PoolTimeouts {
  return {
    poolMax: positiveInt(env.DB_POOL_MAX, 10),
    statementTimeoutMs: positiveInt(env.DB_STATEMENT_TIMEOUT_MS, 30_000),
    idleInTransactionTimeoutMs: positiveInt(env.DB_IDLE_IN_TX_TIMEOUT_MS, 60_000),
  };
}
