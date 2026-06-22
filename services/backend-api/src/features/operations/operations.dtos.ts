import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsDateString,
  IsUrl,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateSupportTicketDto {
  @IsEnum(['bug_report', 'account_issue', 'learning_issue', 'billing_issue', 'general', 'other'])
  category!: 'bug_report' | 'account_issue' | 'learning_issue' | 'billing_issue' | 'general' | 'other';

  @IsEnum(['low', 'medium', 'high', 'critical'])
  severity!: 'low' | 'medium' | 'high' | 'critical';

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class CreateTicketCommentDto {
  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsEnum(['public', 'internal'])
  @IsOptional()
  visibility?: 'public' | 'internal';
}

export class CreateFeedbackDto {
  @IsEnum(['bug_report', 'suggestion', 'compliment', 'complaint', 'other'])
  category!: 'bug_report' | 'suggestion' | 'compliment' | 'complaint' | 'other';

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsEnum(['mobile_app', 'admin_dashboard', 'parent_dashboard', 'api'])
  sourceSurface!: 'mobile_app' | 'admin_dashboard' | 'parent_dashboard' | 'api';
}

export class CreateFeatureRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(['minor', 'major', 'critical'])
  severity!: 'minor' | 'major' | 'critical';

  @IsDateString()
  startedAt!: string;
}

export class UpdateIncidentStatusDto {
  @IsEnum(['investigating', 'identified', 'monitoring', 'resolved', 'postmortem'])
  status!: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';

  @IsDateString()
  @IsOptional()
  resolvedAt?: string;

  @IsUrl()
  @IsOptional()
  postmortemUrl?: string;
}

export class CreateMaintenanceWindowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['planned', 'emergency'])
  type!: 'planned' | 'emergency';

  @IsDateString()
  scheduledStart!: string;

  @IsDateString()
  scheduledEnd!: string;

  @IsArray()
  @IsString({ each: true })
  affectedServices!: string[];

  @IsString()
  @IsOptional()
  userMessage?: string;
}

export class UpdateMaintenanceStatusDto {
  @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled'])
  status!: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

  @IsDateString()
  @IsOptional()
  actualStart?: string;

  @IsDateString()
  @IsOptional()
  actualEnd?: string;
}

export class CreateReleaseNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  version!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsEnum(['all', 'students', 'parents', 'admins', 'internal'])
  audience!: 'all' | 'students' | 'parents' | 'admins' | 'internal';
}

export class PublishReleaseNoteDto {}

export class UpdateOperationalStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateFeatureFlagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  flagKey!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateFeatureFlagDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  rolloutPercentage?: number;

  @IsOptional()
  audience?: Record<string, unknown>;
}
