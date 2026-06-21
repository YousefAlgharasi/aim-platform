import { Injectable, NotFoundException } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { MetricDefinition } from './analytics.entities';

/**
 * Backend authority for the metrics dictionary (docs/phase-15/analytics-kpi-catalog.md).
 * Metric definitions are seeded/managed server-side; this service exposes
 * read access only — clients never define or alter metric definitions.
 */
@Injectable()
export class MetricDefinitionService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async listActiveDefinitions(): Promise<MetricDefinition[]> {
    return this.analyticsRepository.findActiveMetricDefinitions();
  }

  async getByKey(key: string): Promise<MetricDefinition> {
    const definition = await this.analyticsRepository.findMetricDefinitionByKey(key);

    if (!definition) {
      throw new NotFoundException(`Metric definition not found: ${key}`);
    }

    return definition;
  }

  async listByDomain(domain: MetricDefinition['domain']): Promise<MetricDefinition[]> {
    const definitions = await this.analyticsRepository.findActiveMetricDefinitions();
    return definitions.filter((definition) => definition.domain === domain);
  }
}
