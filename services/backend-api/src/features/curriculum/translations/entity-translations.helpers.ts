import { PoolClient } from 'pg';

export async function syncEnglishTranslation(
  client: PoolClient,
  config: { entityTable: string; translationTable: string; foreignKey: string },
  id: string,
): Promise<void> {
  await client.query(
    `INSERT INTO ${config.translationTable} (${config.foreignKey}, locale, title, description)
       SELECT id, 'en', title, description FROM ${config.entityTable} WHERE id = $1
       ON CONFLICT (${config.foreignKey}, locale)
       DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description`,
    [id],
  );
}

export async function loadAvailableLocales(
  client: PoolClient,
  config: { translationTable: string; foreignKey: string },
  id: string,
): Promise<string[]> {
  const result = await client.query<{ locale: string }>(
    `SELECT locale FROM ${config.translationTable} WHERE ${config.foreignKey} = $1 ORDER BY locale`,
    [id],
  );
  return result.rows.map((r) => r.locale);
}

export async function runInTransaction<T>(
  withClient: <R>(callback: (client: PoolClient) => Promise<R>) => Promise<R>,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      const value = await work(client);
      await client.query('COMMIT');
      return value;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
}
