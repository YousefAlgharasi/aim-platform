export type ApiMeta = {
  readonly timestamp?: string;
  readonly path?: string;
  readonly method?: string;
  readonly requestId?: string;
  readonly pagination?: Record<string, unknown>;
};

export function parseApiMeta(value: unknown): ApiMeta {
  if (!isObject(value)) {
    return {};
  }

  return {
    timestamp: asOptionalString(value.timestamp),
    path: asOptionalString(value.path),
    method: asOptionalString(value.method),
    requestId: asOptionalString(value.requestId),
    pagination: isObject(value.pagination)
      ? value.pagination
      : undefined,
  };
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
