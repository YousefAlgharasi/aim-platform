import { Injectable } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { MetricDefinitionService } from './metric-definition.service';
import { MetricAggregate, MetricScopeType, MetricPeriodType } from './analytics.entities';
import {
  validatePeriodType,
  validatePeriodRange,
  validateScopeType,
  assertMinimumAggregateSize,
} from './analytics.validation';

/**
 * Backend authority for computing and serving metric aggregates
 * (docs/phase-15/analytics-authority-rules.md). Clients never compute
 * aggregate values themselves — they request a precomputed value for a
 * scope/period from this service.
 */
@Injectable()
export class MetricAggregationService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly metricDefinitionService: MetricDefinitionService,
  ) {}

  /**
   * Computes (or recomputes) the aggregate value for a metric definition over
   * a single period bucket from backend-recorded analytics events, and
   * persists it. Source-of-truth values are computed from `analytics_events`
   * counts; richer aggregation methods (sum/average over event metadata)
   * are computed the same way, reading only from backend-recorded events.
   */
  async computeAndStoreAggregate(params: {
    metricKey: string;
    scopeType: MetricScopeType;
    scopeId: string | null;
    periodType: MetricPeriodType;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<MetricAggregate> {
    validateScopeType(params.scopeType);
    validatePeriodType(params.periodType);
    validatePeriodRange(params.periodStart, params.periodEnd);

    if (params.scopeType === 'cohort' && params.scopeId) {
      const memberCount = await this.analyticsRepository.countCohortMembers(params.scopeId);
      assertMinimumAggregateSize(memberCount);
    }

    const definition = await this.metricDefinitionService.getByKey(params.metricKey);

    const value = await this.computeValueFromEvents(definition.sourceEventTypes, params.periodStart, params.periodEnd);

    return this.analyticsRepository.upsertMetricAggregate({
      metricDefinitionId: definition.id,
      scopeType: params.scopeType,
      scopeId: params.scopeId,
      periodType: params.periodType,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      value,
    });
  }

  async getAggregates(params: {
    metricKey: string;
    scopeType: MetricScopeType;
    scopeId?: string | null;
    periodType: MetricPeriodType;
    from: Date;
    to: Date;
  }): Promise<MetricAggregate[]> {
    validateScopeType(params.scopeType);
    validatePeriodType(params.periodType);
    validatePeriodRange(params.from, params.to);

    if (params.scopeType === 'cohort' && params.scopeId) {
      const memberCount = await this.analyticsRepository.countCohortMembers(params.scopeId);
      assertMinimumAggregateSize(memberCount);
    }

    const definition = await this.metricDefinitionService.getByKey(params.metricKey);

    return this.analyticsRepository.findMetricAggregates({
      metricDefinitionId: definition.id,
      scopeType: params.scopeType,
      scopeId: params.scopeId,
      periodType: params.periodType,
      from: params.from,
      to: params.to,
    });
  }

  private async computeValueFromEvents(
    sourceEventTypes: string[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    if (sourceEventTypes.length === 0) {
      return 0;
    }

    let total = 0;
    for (const eventType of sourceEventTypes) {
      const events = await this.analyticsRepository.findEventsByType(eventType, periodStart, periodEnd);
      total += events.length;
    }

    return total;
  }
}
