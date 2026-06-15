import { WorkflowEntityType } from '../content-status-workflow/content-status-workflow.types';

export interface PublishValidationIssue {
  field: string;
  message: string;
}

export interface PublishValidationResult {
  entityType: WorkflowEntityType;
  entityId: string;
  isPublishable: boolean;
  issues: PublishValidationIssue[];
}
