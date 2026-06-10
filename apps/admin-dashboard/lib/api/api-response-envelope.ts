import { parseApiErrorEnvelope, type ApiErrorEnvelope } from './api-error-envelope';
import { parseApiMeta, type ApiMeta } from './api-meta';

export type ApiJsonDecoder<T> = (value: unknown) => T;

export type ApiSuccessEnvelope<T> = {
  readonly success: true;
  readonly data: T;
  readonly meta: ApiMeta;
};

export type ApiFailureEnvelope = {
  readonly success: false;
  readonly error: ApiErrorEnvelope;
  readonly meta: ApiMeta;
};

export type ApiResponseEnvelope<T> =
  | ApiSuccessEnvelope<T>
  | ApiFailureEnvelope;

export function parseApiResponseEnvelope<T>(
  value: unknown,
  decodeData: ApiJsonDecoder<T>,
): ApiResponseEnvelope<T> {
  if (!isObject(value)) {
    return {
      success: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Backend API returned a non-object response.',
      },
      meta: {},
    };
  }

  const meta = parseApiMeta(value.meta);

  if (value.success === true) {
    return {
      success: true,
      data: decodeData(value.data),
      meta,
    };
  }

  return {
    success: false,
    error: parseApiErrorEnvelope(value.error),
    meta,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
