// P11-010: Shared paginated response type for all admin list APIs
export type AdminPaginatedResponse<T> = {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export function decodePaginatedResponse<T>(
  value: unknown,
  decodeItem: (item: unknown) => T,
): AdminPaginatedResponse<T> {
  if (!isObject(value)) throw new Error('Expected paginated response object');
  const data = Array.isArray(value.data) ? value.data.map(decodeItem) : [];
  return {
    data,
    total: typeof value.total === 'number' ? value.total : 0,
    page:  typeof value.page  === 'number' ? value.page  : 1,
    limit: typeof value.limit === 'number' ? value.limit : 20,
  };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
