import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
  MaxLength,
} from 'class-validator';

import {
  AnalyticsActorRole,
  MetricScopeType,
  MetricPeriodType,
  ExportType,
  DashboardKey,
} from './analytics.entities';

export class IngestAnalyticsEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  eventType!: string;

  @IsEnum(['student', 'parent', 'admin', 'system'])
  actorRole!: AnalyticsActorRole;

  @IsUUID()
  @IsOptional()
  actorId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  subjectType!: string;

  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @IsDateString()
  @IsOptional()
  occurredAt?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class GetMetricAggregateDto {
  @IsEnum(['platform', 'cohort', 'role', 'student', 'parent'])
  scopeType!: MetricScopeType;

  @IsUUID()
  @IsOptional()
  scopeId?: string;

  @IsEnum(['day', 'week', 'month'])
  periodType!: MetricPeriodType;

  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}

export class RunReportDto {
  @IsObject()
  @IsOptional()
  parameters?: Record<string, unknown>;
}

export class RequestExportDto {
  @IsUUID()
  @IsOptional()
  reportRunId?: string;

  @IsEnum(['csv', 'json', 'pdf'])
  exportType!: ExportType;

  @IsObject()
  @IsOptional()
  scope?: Record<string, unknown>;
}

export class GetDashboardWidgetsDto {
  @IsEnum(['admin_overview', 'parent_summary', 'student_summary'])
  dashboardKey!: DashboardKey;
}
