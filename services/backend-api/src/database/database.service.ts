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

    const connectionString = this.readRequiredConfigValue('databaseUrl', 'DATABASE_URL');
    const nodeEnvironment = this.readOptionalConfigValue('nodeEnv', 'NODE_ENV') ?? 'development';

    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: nodeEnvironment === 'production'
        ? {
            rejectUnauthorized: true,
          }
        : undefined,
    });

    return this.pool;
  }

  private readRequiredConfigValue(
    camelCaseKey: string,
    envKey: string,
  ): string {
    const value = this.readOptionalConfigValue(camelCaseKey, envKey);

    if (!value) {
      throw new Error(`${envKey} is required for database connection`);
    }

    return value;
  }

  private readOptionalConfigValue(
    camelCaseKey: string,
    envKey: string,
  ): string | undefined {
    const config = this.backendConfig as unknown as Record<string, unknown>;

    const directValue = config[camelCaseKey];

    if (typeof directValue === 'string' && directValue.length > 0) {
      return directValue;
    }

    const getter = config.get;

    if (typeof getter === 'function') {
      const value = getter.call(this.backendConfig, envKey);

      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }

    return undefined;
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
