/**
 * AIM Engine adapter service — Phase 5 (P5-043 skeleton, P5-051 implementation).
 *
 * This service is the sole backend caller of POST /aim/v1/analysis.
 * No other module may call the AIM Engine directly.
 *
 * analyze() orchestrates the full adapter chain per the backend pipeline map:
 *   Stage 4 — HTTP call via AimEngineClientService + AimAdapterTimeoutPolicyService
 *   Stage 5 — Response validation via AimResponseMapperService
 *   Stage 8 — Safe failure handling via AimAdapterErrorHandlerService
 *
 * Scope rules:
 * - Only this service sends requests to POST /aim/v1/analysis.
 * - Flutter, Admin Dashboard, and all clients are prohibited from calling
 *   the AIM Engine directly.
 * - No mastery, level, weakness, difficulty, recommendations, review schedule,
 *   retention, or frustration values are computed here.
 * - Speed/timing fields are forwarded as raw context only.
 * - No secrets, service-role keys, database credentials, or AI provider keys
 *   are stored or logged here.
 */
import { Injectable, Logger } from '@nestjs/common';
import { AimEngineClientService } from '../aim-engine-client.service';
import { AimAnalysisRawRequest } from '../aim-engine-client.types';
import { AimAdapterErrorHandlerService, AimAdapterError, AimFallbackProfileA } from './aim-adapter-error-handler.service';
import { AimAdapterTimeoutPolicyService } from './aim-adapter-timeout-policy.service';
import { AimResponseMapperService } from './aim-response-mapper.service';
import { AimValidatedResponse } from './aim-response-mapper.types';

export type AimAnalyzeResult =
  | { readonly ok: true; readonly response: AimValidatedResponse }
  | { readonly ok: false; readonly fallback: AimFallbackProfileA; readonly error: AimAdapterError };

@Injectable()
export class AimEngineAdapterService {
  private readonly logger = new Logger(AimEngineAdapterService.name);

  constructor(
    private readonly client: AimEngineClientService,
    private readonly retryPolicy: AimAdapterTimeoutPolicyService,
    private readonly responseMapper: AimResponseMapperService,
    private readonly errorHandler: AimAdapterErrorHandlerService,
  ) {}

  /**
   * Send a structured AIM analysis request and return a validated response
   * or a safe fallback (Profile A).
   *
   * The backendRequestId in the request is reused across all retries.
   * The xRequestId is the X-Request-Id correlation header value.
   *
   * On success: returns ok: true with the fully validated AimValidatedResponse.
   * On failure: returns ok: false with Profile A fallback (raw input already saved,
   *             AIM analysis unavailable for this call, no AIM data written).
   */
  async analyze(
    request: AimAnalysisRawRequest,
    xRequestId: string,
  ): Promise<AimAnalyzeResult> {
    const originRequest = {
      backendRequestId: request.backendRequestId,
      studentId: this.extractStudentId(request),
      sessionId: this.extractSessionId(request),
    };

    this.logger.debug('AIM adapter: starting analysis', {
      backendRequestId: request.backendRequestId,
      xRequestId,
    });

    // Stage 4 — HTTP call with retry policy
    const outcome = await this.retryPolicy.execute(
      (_attempt) => this.client.postAnalysis(request, xRequestId),
    );

    if (!outcome.result.ok) {
      const error = this.errorHandler.classifyRetryOutcome(outcome);
      const fallback = this.errorHandler.applyFallbackA(error);
      this.logger.warn('AIM adapter: analysis failed, applying Profile A fallback', {
        backendRequestId: request.backendRequestId,
        errorCode: error.code,
        category: error.category,
        attemptsMade: outcome.attemptsMade,
        budgetExhausted: outcome.budgetExhausted,
      });
      return { ok: false, fallback, error };
    }

    // Stage 5 — Response validation and mapping
    const mappingResult = this.responseMapper.map(outcome.result.body, originRequest);

    if (!mappingResult.ok) {
      const error = this.errorHandler.classifyMappingFailure(mappingResult);
      const fallback = this.errorHandler.applyFallbackA(error);
      this.logger.warn('AIM adapter: response mapping failed, applying Profile A fallback', {
        backendRequestId: request.backendRequestId,
        failureCode: mappingResult.failureCode,
      });
      return { ok: false, fallback, error };
    }

    this.logger.debug('AIM adapter: analysis succeeded', {
      backendRequestId: request.backendRequestId,
      droppedCodes: mappingResult.response.droppedValidationCodes,
    });

    return { ok: true, response: mappingResult.response };
  }

  // -------------------------------------------------------------------------
  // Helpers — extract correlation ids from the raw request safely
  // -------------------------------------------------------------------------

  private extractStudentId(request: AimAnalysisRawRequest): string {
    const session = (request as Record<string, unknown>)['session'] as Record<string, unknown> | undefined;
    return (session?.['studentId'] as string) ?? '';
  }

  private extractSessionId(request: AimAnalysisRawRequest): string {
    const session = (request as Record<string, unknown>)['session'] as Record<string, unknown> | undefined;
    return (session?.['sessionId'] as string) ?? '';
  }
}
