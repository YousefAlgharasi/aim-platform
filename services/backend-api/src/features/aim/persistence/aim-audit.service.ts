/**
 * AIM audit service — Phase 5 skeleton (P5-043).
 *
 * Records metadata-only audit entries at every pipeline stage boundary,
 * consistent with docs/phase-5/aim-error-handling-policy.md (P5-008).
 *
 * Responsibilities (to be implemented in downstream tasks):
 *   P5-063 — Implement AIM Audit Log Service
 *
 * Audit rules (from P5-008):
 * - Log metadata only: timestamp, request_id, backend_request_id,
 *   student_id, session_id, attempt_id, status, error code, pipeline duration.
 * - Never log raw request bodies, raw response bodies, the service token,
 *   secrets, or provider credentials.
 * - Every failure produces a metadata-only audit entry.
 */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AimAuditService {
  private readonly logger = new Logger(AimAuditService.name);

  /**
   * Record an AIM pipeline audit entry.
   *
   * Implemented by P5-063.
   */
  record(_entry: unknown): void {
    // Stub — implementation owned by P5-063.
    this.logger.warn('AimAuditService.record: not yet implemented (P5-063)');
  }
}
