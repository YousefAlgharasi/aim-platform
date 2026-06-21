import { Injectable } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { DashboardKey, MetricAggregate, ReportDefinition } from './analytics.entities';
import { validateDashboardKey } from './analytics.validation';

export interface ResolvedDashboardWidget {
  id: string;
  widgetType: 'kpi' | 'chart' | 'table';
  config: Record<string, unknown>;
  displayOrder: number;
  metric: MetricAggregate | null;
  report: ReportDefinition | null;
}

/**
 * Backend authority for assembling dashboard widget output
 * (docs/phase-15/analytics-authority-rules.md). Clients only display the
 * widgets this service resolves — they never assemble dashboards from raw
 * metric/report data themselves.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getDashboard(dashboardKey: DashboardKey): Promise<ResolvedDashboardWidget[]> {
    validateDashboardKey(dashboardKey);

    const widgets = await this.analyticsRepository.findDashboardWidgets(dashboardKey);

    return Promise.all(
      widgets.map(async (widget) => {
        const metric = widget.metricDefinitionId
          ? await this.analyticsRepository.findLatestMetricAggregate(
              widget.metricDefinitionId,
              'platform',
              null,
            )
          : null;

        const report = widget.reportDefinitionId
          ? await this.analyticsRepository.findReportDefinitionById(widget.reportDefinitionId)
          : null;

        return {
          id: widget.id,
          widgetType: widget.widgetType,
          config: widget.config,
          displayOrder: widget.displayOrder,
          metric,
          report,
        };
      }),
    );
  }
}
