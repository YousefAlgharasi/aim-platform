export type ApiErrorEnvelope = {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
};

export function parseApiErrorEnvelope(value: unknown): ApiErrorEnvelope {
  if (!isObject(value)) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Unknown API error',
    };
  }

  return {
    code: typeof value.code === 'string' ? value.code : 'UNKNOWN_ERROR',
    message:
      typeof value.message === 'string'
        ? value.message
        : 'Unknown API error',
    details: value.details,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
