// P10-023: AssessmentService.
//
// Scope: Listing, reading, and resolving assessment definitions with
//        backend-computed deadline status for student-facing APIs.
//
// Security rules:
//   - deadline status is always backend-derived here; never accepted from
//     or recomputed by Flutter.
//   - pass_threshold, late_penalty_percent, section weights are never
//     included in returned DTOs.
//   - Correct answers are never returned here.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AssessmentRepository } from './assessment.repository';
import { AssessmentDeadlineService, DeadlineStatusResult } from './assessment-deadline.service';

// Inlined until P10-020 merges
type DeadlineStatus = 'upcoming' | 'open' | 'closed' | 'missed' | 'late' | 'extended' | 'expired';

export interface AssessmentListItem {
  id: string; type: string; title: string; description: string | null;
  deadlineStatus: DeadlineStatus | null;
}

export interface AssessmentDetail {
  id: string; type: string; title: string; description: string | null;
  sections: Array<{ id: string; title: string; order: number; questionCount: number }>;
  maxAttempts: number; timeLimitSeconds: number | null;
}

export interface AssessmentDetailWithDeadline extends AssessmentDetail {
  /** Backend-derived deadline state (P10-024). Null when no deadline configured. */
  deadline: DeadlineStatusResult | null;
}

export interface LegacyDeadlineStatusResult {
  deadlineId: string; opensAt: Date; closesAt: Date;
  extendedClosesAt: Date | null; status: DeadlineStatus;
}

@Injectable()
export class AssessmentService {
  constructor(
    private readonly repo: AssessmentRepository,
    private readonly db: DatabaseService,
    private readonly deadlineService?: AssessmentDeadlineService,
  ) {}

  async listForStudent(studentId: string): Promise<AssessmentListItem[]> {
    const assessments = await this.repo.findAllPublished();
    return Promise.all(
      assessments.map(async (a) => {
        const deadline = await this.repo.findEffectiveDeadline(a.id, studentId);
        const deadlineStatus = deadline
          ? this.deriveDeadlineStatus(deadline.opens_at, deadline.closes_at, deadline.extended_closes_at)
          : null;
        return { id: a.id, type: a.type, title: a.title, description: a.description, deadlineStatus };
      }),
    );
  }

  async getDetail(assessmentId: string, studentId: string): Promise<AssessmentDetail> {
    const assessment = await this.repo.findPublishedById(assessmentId);
    const sections = await this.repo.findSectionsByAssessment(assessmentId);
    const countMap = await this.repo.countQuestionsPerSection(assessmentId);

    const settings = await this.db.query<{ max_attempts: number; time_limit_seconds: number | null }>(
      `SELECT max_attempts, time_limit_seconds FROM assessment_settings WHERE assessment_id = $1`,
      [assessmentId],
    );
    const s = settings.rows[0];

    return {
      id: assessment.id, type: assessment.type,
      title: assessment.title, description: assessment.description,
      sections: sections.map((sec) => ({
        id: sec.id, title: sec.title, order: sec.order,
        questionCount: countMap.get(sec.id) ?? 0,
        // weight is NOT included here — backend-only
      })),
      maxAttempts: s?.max_attempts ?? 1,
      timeLimitSeconds: s?.time_limit_seconds ?? null,
      // passThreshold, latePolicy: NEVER returned
    };
  }

  /**
   * P10-034: Assessment detail combined with backend-derived deadline state
   * (P10-024 AssessmentDeadlineService — the single source of deadline
   * status, late-window, and penalty authority). Used by the student
   * assessment detail endpoint.
   */
  async getDetailWithDeadline(
    assessmentId: string,
    studentId: string,
  ): Promise<AssessmentDetailWithDeadline> {
    const detail = await this.getDetail(assessmentId, studentId);
    const deadline = this.deadlineService
      ? await this.deadlineService.getDeadlineStatus(assessmentId, studentId)
      : null;
    return { ...detail, deadline };
  }

  async getDeadlineStatus(assessmentId: string, studentId: string): Promise<LegacyDeadlineStatusResult | null> {
    const deadline = await this.repo.findEffectiveDeadline(assessmentId, studentId);
    if (!deadline) return null;
    return {
      deadlineId: deadline.id,
      opensAt: deadline.opens_at,
      closesAt: deadline.closes_at,
      extendedClosesAt: deadline.extended_closes_at,
      // Backend computes status — Flutter displays as-is
      status: this.deriveDeadlineStatus(deadline.opens_at, deadline.closes_at, deadline.extended_closes_at),
    };
  }

  /** Backend-only deadline status derivation. Never called by Flutter. */
  deriveDeadlineStatus(opensAt: Date, closesAt: Date, extendedClosesAt: Date | null): DeadlineStatus {
    const now = new Date();
    const effectiveClose = extendedClosesAt ?? closesAt;
    if (now < opensAt) return 'upcoming';
    if (now <= effectiveClose) return extendedClosesAt ? 'extended' : 'open';
    return 'closed';
  }
}
