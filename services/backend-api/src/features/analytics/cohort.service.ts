import { Injectable, NotFoundException } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsCohort, AnalyticsCohortMember } from './analytics.entities';
import { assertMinimumAggregateSize } from './analytics.validation';

/**
 * Backend authority for cohort definition and membership resolution
 * (docs/phase-15/analytics-domain-map.md). Cohorts back grouped analytics
 * scopes; membership is resolved here only, never derived by clients.
 */
@Injectable()
export class CohortService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async listActiveCohorts(): Promise<AnalyticsCohort[]> {
    return this.analyticsRepository.findActiveCohorts();
  }

  async getByKey(key: string): Promise<AnalyticsCohort> {
    const cohort = await this.analyticsRepository.findCohortByKey(key);

    if (!cohort) {
      throw new NotFoundException(`Cohort not found: ${key}`);
    }

    return cohort;
  }

  async addMember(cohortId: string, userId: string): Promise<AnalyticsCohortMember> {
    return this.analyticsRepository.addCohortMember(cohortId, userId);
  }

  async removeMember(cohortId: string, userId: string): Promise<void> {
    return this.analyticsRepository.removeCohortMember(cohortId, userId);
  }

  /**
   * Returns cohort membership only when the cohort meets the minimum
   * reportable size, enforcing the re-identification safeguard before any
   * cohort-scoped data is resolved (P15-004 privacy rule).
   */
  async resolveReportableMembers(cohortId: string): Promise<AnalyticsCohortMember[]> {
    const memberCount = await this.analyticsRepository.countCohortMembers(cohortId);
    assertMinimumAggregateSize(memberCount);

    return this.analyticsRepository.findCohortMembers(cohortId);
  }
}
