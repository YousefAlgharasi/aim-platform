import { Injectable, NotFoundException } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { ReportDefinition, AnalyticsActorRole } from './analytics.entities';
import { assertRoleAllowed } from './analytics.validation';

/**
 * Backend authority for report definitions (docs/phase-15/analytics-domain-map.md).
 * Report definitions are seeded/managed server-side; this service exposes
 * role-filtered read access only.
 */
@Injectable()
export class ReportDefinitionService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async listVisibleToRole(role: AnalyticsActorRole): Promise<ReportDefinition[]> {
    const definitions = await this.analyticsRepository.findActiveReportDefinitions();
    return definitions.filter((definition) => definition.allowedRoles.includes(role));
  }

  async getByKeyForRole(key: string, role: AnalyticsActorRole): Promise<ReportDefinition> {
    const definition = await this.analyticsRepository.findReportDefinitionByKey(key);

    if (!definition) {
      throw new NotFoundException(`Report definition not found: ${key}`);
    }

    assertRoleAllowed(role, definition.allowedRoles);

    return definition;
  }
}
