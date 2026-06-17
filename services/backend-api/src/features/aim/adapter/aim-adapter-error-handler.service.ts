/**
 * AIM Adapter Error Handler — Phase 5, P5-050.
 *
 * Classifies AIM adapter failures and applies the safe fallback profiles
 * defined in docs/phase-5/aim-error-handling-policy.md (P5-008).
 *
 * Fallback profiles (from P5-008):
 *
 *   Profile A — Write-side caller (attempt/session submission):
 *     The raw input was already persisted before the pipeline ran.
 *     On any unrecoverable failure: return a safe acknowledgement that the
 *     raw input was saved, that adaptive analysis is unavailable for this
 *     call, and include the stable backend error code. No AIM-owned values
 *     are written. No engine internals, stack traces, or secrets are surfaced.
 *
 *   Profile B — Read-side caller (AIM result API):
 *     Return the last validated-persisted value, or an empty-state response
 *     with a freshness indicator and a stable backend code if nothing exists.
 *     Never proxy a live AIM Engine call. Never infer or invent AIM values.
 *
 * No secrets, service-role keys, database credentials, or AI provider keys
 * are referenced here. No AIM-owned learning values are computed here.
 */
import { Injectable, Logger } from '@nestjs/common';
import { AimRetryOutcome } from './aim-adapter-timeout-policy.service';
import { AimResponseMappingResult } from './aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

export type AimAdapterFailureCategory =
  | 'transport_timeout'
  | 'transport_connection_error'
  | 'transient_http'
  | 'authentication_failure'
  | 'authorization_failure'
  | 'validation_failure'
  | 'idempotency_conflict'
  | 'contract_violation'
  | 'budget_exhausted'
  | 'internal_error';

const ERROR_CODE_TO_CATEGORY: Record<string, AimAdapterFailureCategory> = {
  TRANSPORT_TIMEOUT: 'transport_timeout',
  TRANSPORT_CONNECTION_ERROR: 'transport_connection_error',
  TRANSIENT_HTTP: 'transient_http',
  AUTH_INVALID: 'authentication_failure',
  UNAUTHORIZED: 'authentication_failure',
  FORBIDDEN: 'authorization_failure',
  VALIDATION_ERROR: 'validation_failure',
  IDEMPOTENCY_CONFLICT: 'idempotency_conflict',
  CORRELATION_MISMATCH: 'contract_violation',
  CONTRACT_VERSION_UNSUPPORTED: 'contract_violation',
  INVALID_ENVELOPE: 'contract_violation',
};

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface AimAdapterError {
  /** Stable backend integration error code (never an AIM Engine internal). */
  readonly code: string;
  /** Short, user-safe message. No engine internals, tokens, or stack traces. */
  readonly message: string;
  readonly category: AimAdapterFailureCategory;
  /** Whether the upstream caller action may be retried by the client. */
  readonly retryable: boolean;
  /** ISO-8601 UTC timestamp. */
  readonly timestamp: string;
}

/** Profile A outcome — write-side caller. */
export interface AimFallbackProfileA {
  readonly profile: 'A';
  /** The raw input was saved; AIM analysis is unavailable for this call. */
  readonly rawInputSaved: true;
  readonly error: AimAdapterError;
}

/** Profile B outcome — read-side caller. */
export interface AimFallbackProfileB {
  readonly profile: 'B';
  /** Last-validated-persisted value, or null if none exists. */
  readonly lastPersistedValue: unknown | null;
  /** True if no persisted value exists yet. */
  readonly isEmpty: boolean;
  readonly error: AimAdapterError;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AimAdapterErrorHandlerService {
  private readonly logger = new Logger(AimAdapterErrorHandlerService.name);

  /**
   * Classify a retry outcome into a structured AimAdapterError.
   *
   * Called after the retry policy (P5-049) has exhausted attempts.
   * Never includes engine internals, stack traces, or secrets.
   */
  classifyRetryOutcome(outcome: AimRetryOutcome): AimAdapterError {
    if (outcome.budgetExhausted) {
      return this.makeError('BUDGET_EXHAUSTED', 'budget_exhausted', false,
        'The AIM Engine did not respond within the allowed time budget.');
    }

    const result = outcome.result;
    if (result.ok) {
      // Should not be called with a successful outcome, but handle defensively
      this.logger.warn('classifyRetryOutcome called with a successful result');
      return this.makeError('INTERNAL_ERROR', 'internal_error', false,
        'An unexpected error occurred.');
    }

    const category = ERROR_CODE_TO_CATEGORY[result.errorCode] ?? 'internal_error';
    const retryable = ['transport_timeout', 'transport_connection_error', 'transient_http']
      .includes(category);

    return this.makeError(result.errorCode, category, retryable, result.message);
  }

  /**
   * Classify a mapping failure (envelope or contract violation) into an error.
   *
   * Called after response mapping (P5-048) returns ok: false.
   */
  classifyMappingFailure(failure: AimResponseMappingResult & { ok: false }): AimAdapterError {
    const category: AimAdapterFailureCategory = 'contract_violation';
    return this.makeError(
      failure.failureCode,
      category,
      false,
      'The AIM Engine returned a response that does not match the expected contract.',
    );
  }

  /**
   * Apply Profile A fallback for a write-side caller failure.
   *
   * Per P5-008 Profile A: the raw input was already saved (Stage 1 persisted
   * it before the pipeline ran). Return a safe acknowledgement that analysis
   * is unavailable. Never include AIM Engine internals.
   */
  applyFallbackA(error: AimAdapterError): AimFallbackProfileA {
    this.logger.warn('AIM adapter applying fallback Profile A', {
      code: error.code,
      category: error.category,
    });
    return {
      profile: 'A',
      rawInputSaved: true,
      error,
    };
  }

  /**
   * Apply Profile B fallback for a read-side caller.
   *
   * Per P5-008 Profile B: return the last validated-persisted value.
   * If none exists, return isEmpty: true. Never proxy a live AIM call.
   * Never infer or invent AIM-owned values.
   */
  applyFallbackB(
    error: AimAdapterError,
    lastPersistedValue: unknown | null = null,
  ): AimFallbackProfileB {
    this.logger.warn('AIM adapter applying fallback Profile B', {
      code: error.code,
      category: error.category,
      hasPersistedValue: lastPersistedValue !== null,
    });
    return {
      profile: 'B',
      lastPersistedValue,
      isEmpty: lastPersistedValue === null,
      error,
    };
  }

  // -------------------------------------------------------------------------
  // Helper
  // -------------------------------------------------------------------------

  private makeError(
    code: string,
    category: AimAdapterFailureCategory,
    retryable: boolean,
    message: string,
  ): AimAdapterError {
    return {
      code,
      message,
      category,
      retryable,
      timestamp: new Date().toISOString(),
    };
  }
}
