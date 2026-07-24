/**
 * Standard API Decoders & Response Helpers
 *
 * Provides reusable type guards and decoders for parsing backend API response payloads.
 */

import { decodePaginatedResponse, type AdminPaginatedResponse } from './admin-paginated-response';
import { parseApiResponseEnvelope, type ApiJsonDecoder, type ApiResponseEnvelope, type ApiSuccessEnvelope, type ApiFailureEnvelope } from './api-response-envelope';

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function decodeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function decodeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

export function decodeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function decodeArray<T>(value: unknown, decodeItem: (item: unknown) => T): T[] {
  return Array.isArray(value) ? value.map(decodeItem) : [];
}

export function decodeNullable<T>(value: unknown, decodeItem: (item: unknown) => T): T | null {
  if (value === null || value === undefined) return null;
  return decodeItem(value);
}

export function decodeDate(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return fallback;
}

export function decodeRecord<V>(value: unknown, decodeValue: (val: unknown) => V): Record<string, V> {
  if (!isObject(value)) return {};
  const result: Record<string, V> = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = decodeValue(val);
  }
  return result;
}

export {
  decodePaginatedResponse,
  parseApiResponseEnvelope,
};

export type {
  AdminPaginatedResponse,
  ApiJsonDecoder,
  ApiResponseEnvelope,
  ApiSuccessEnvelope,
  ApiFailureEnvelope,
};
