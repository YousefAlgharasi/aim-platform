import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

import { BackendConfigService } from '../config/backend-config.service';
import { DatabaseHealthCheckResult } from './database.types';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
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

    const connectionString = this.backendConfig.database.url;
    const nodeEnvironment = this.backendConfig.nodeEnv;

    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: nodeEnvironment === 'production'
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });

    return this.pool;
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
