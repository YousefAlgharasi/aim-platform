// P12-029: Create Parent Activity Summary Service
// Exposes a child's recent learning session activity to a linked, consented
// parent.
//
// This service never computes mastery shift, behavioral signals, or any AIM
// output — it only reads already-validated values from the existing Phase 5
// session summary read service and reshapes them into a parent-facing
// entity. Access is always verified first via
// ParentAccessPolicyService.assertAccess('progress_view'); no link or
// consent state is trusted from client input.

import { Injectable } from '@nestjs/common';

import { SessionStateReadService } from '../aim/result/session-state-read.service';
import { ParentActivitySummaryEntity } from './dto/parent-activity-summary.entity';
import { ParentAccessPolicyService } from './parent-access-policy.service';

const DEFAULT_RECENT_SESSION_LIMIT = 10;

@Injectable()
export class ParentActivitySummaryService {
  constructor(
    private readonly parentAccessPolicyService: ParentAccessPolicyService,
    private readonly sessionStateReadService: SessionStateReadService,
  ) {}

  async getActivitySummaryForParent(
    parentId: string,
    childId: string,
  ): Promise<ParentActivitySummaryEntity> {
    await this.parentAccessPolicyService.assertAccess(parentId, childId, 'progress_view');

    const recentSessions = await this.sessionStateReadService.getRecentSessionsForStudent(
      childId,
      DEFAULT_RECENT_SESSION_LIMIT,
    );

    const summary = new ParentActivitySummaryEntity();
    summary.childId = childId;
    summary.retrievedAt = new Date().toISOString();

    summary.recentSessions = recentSessions.sessions.map((entry) => ({
      sessionId: entry.sessionId,
      itemsAttempted: entry.itemsAttempted,
      itemsCorrect: entry.itemsCorrect,
      skillsTouched: entry.skillsTouched,
      overallMasteryShift: entry.overallMasteryShift,
      closedOutAt: entry.closedOutAt,
      updatedAt: entry.updatedAt,
    }));

    summary.lastActiveAt = recentSessions.sessions[0]?.updatedAt ?? null;

    return summary;
  }
}
