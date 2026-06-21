import { BadRequestException } from '@nestjs/common';

export const VALID_TICKET_CATEGORIES = [
  'bug_report', 'account_issue', 'learning_issue', 'billing_issue', 'general', 'other',
];

export const VALID_TICKET_SEVERITIES = ['low', 'medium', 'high', 'critical'];

export const VALID_TICKET_STATUSES = [
  'open', 'in_progress', 'waiting_on_user', 'resolved', 'closed',
];

export const VALID_COMMENT_VISIBILITIES = ['public', 'internal'];

export const VALID_FEEDBACK_CATEGORIES = [
  'bug_report', 'suggestion', 'compliment', 'complaint', 'other',
];

export const VALID_FEEDBACK_SOURCE_SURFACES = [
  'mobile_app', 'admin_dashboard', 'parent_dashboard', 'api',
];

export const VALID_FEEDBACK_STATUSES = [
  'new', 'under_review', 'accepted', 'declined', 'implemented',
];

export const VALID_FEATURE_REQUEST_STATUSES = [
  'new', 'under_review', 'planned', 'in_progress', 'completed', 'declined',
];

export const VALID_FEATURE_REQUEST_PRIORITIES = ['low', 'medium', 'high', 'critical'];

export const VALID_INCIDENT_SEVERITIES = ['minor', 'major', 'critical'];

export const VALID_INCIDENT_STATUSES = [
  'investigating', 'identified', 'monitoring', 'resolved', 'postmortem',
];

export const VALID_MAINTENANCE_TYPES = ['planned', 'emergency'];

export const VALID_MAINTENANCE_STATUSES = [
  'scheduled', 'in_progress', 'completed', 'cancelled',
];

export const VALID_RELEASE_AUDIENCES = ['all', 'students', 'parents', 'admins', 'internal'];

export const VALID_RELEASE_STATUSES = ['draft', 'published', 'archived'];

export const VALID_AUDIT_RESOURCE_TYPES = [
  'support_ticket', 'feedback', 'feature_request', 'incident',
  'maintenance_window', 'release_note', 'operational_status', 'feature_flag',
];

export function validateTicketCategory(category: string): void {
  if (!VALID_TICKET_CATEGORIES.includes(category)) {
    throw new BadRequestException(`Invalid ticket category: ${category}`);
  }
}

export function validateTicketSeverity(severity: string): void {
  if (!VALID_TICKET_SEVERITIES.includes(severity)) {
    throw new BadRequestException(`Invalid ticket severity: ${severity}`);
  }
}

export function validateTicketStatus(status: string): void {
  if (!VALID_TICKET_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid ticket status: ${status}`);
  }
}

export function validateCommentVisibility(visibility: string): void {
  if (!VALID_COMMENT_VISIBILITIES.includes(visibility)) {
    throw new BadRequestException(`Invalid comment visibility: ${visibility}`);
  }
}

export function validateFeedbackCategory(category: string): void {
  if (!VALID_FEEDBACK_CATEGORIES.includes(category)) {
    throw new BadRequestException(`Invalid feedback category: ${category}`);
  }
}

export function validateFeedbackSourceSurface(surface: string): void {
  if (!VALID_FEEDBACK_SOURCE_SURFACES.includes(surface)) {
    throw new BadRequestException(`Invalid feedback source surface: ${surface}`);
  }
}

export function validateFeedbackStatus(status: string): void {
  if (!VALID_FEEDBACK_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid feedback status: ${status}`);
  }
}

export function validateFeedbackRating(rating: number | null | undefined): void {
  if (rating !== null && rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
    throw new BadRequestException('Rating must be an integer between 1 and 5');
  }
}

export function validateFeatureRequestStatus(status: string): void {
  if (!VALID_FEATURE_REQUEST_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid feature request status: ${status}`);
  }
}

export function validateFeatureRequestPriority(priority: string | null | undefined): void {
  if (priority !== null && priority !== undefined && !VALID_FEATURE_REQUEST_PRIORITIES.includes(priority)) {
    throw new BadRequestException(`Invalid feature request priority: ${priority}`);
  }
}

export function validateIncidentSeverity(severity: string): void {
  if (!VALID_INCIDENT_SEVERITIES.includes(severity)) {
    throw new BadRequestException(`Invalid incident severity: ${severity}`);
  }
}

export function validateIncidentStatus(status: string): void {
  if (!VALID_INCIDENT_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid incident status: ${status}`);
  }
}

export function validateMaintenanceType(type: string): void {
  if (!VALID_MAINTENANCE_TYPES.includes(type)) {
    throw new BadRequestException(`Invalid maintenance type: ${type}`);
  }
}

export function validateMaintenanceStatus(status: string): void {
  if (!VALID_MAINTENANCE_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid maintenance status: ${status}`);
  }
}

export function validateReleaseAudience(audience: string): void {
  if (!VALID_RELEASE_AUDIENCES.includes(audience)) {
    throw new BadRequestException(`Invalid release audience: ${audience}`);
  }
}

export function validateReleaseStatus(status: string): void {
  if (!VALID_RELEASE_STATUSES.includes(status)) {
    throw new BadRequestException(`Invalid release status: ${status}`);
  }
}

export function validateRolloutPercentage(percentage: number | undefined): void {
  if (percentage !== undefined && (!Number.isInteger(percentage) || percentage < 0 || percentage > 100)) {
    throw new BadRequestException('Rollout percentage must be an integer between 0 and 100');
  }
}

export function validateUUID(value: string, fieldName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!value || !uuidRegex.test(value)) {
    throw new BadRequestException(`${fieldName} must be a valid UUID`);
  }
}
