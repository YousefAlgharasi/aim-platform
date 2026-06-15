import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  isAllowedStatusTransition,
  isCurriculumContentStatus,
} from '../validation/content-status';
import {
  ENTITY_TABLE,
  StatusRow,
  StatusTransitionResult,
  WORKFLOW_ENTITY_TYPES,
  WorkflowEntityType,
} from './content-status-workflow.types';
import { PublishValidationService } from '../publish-validation/publish-validation.service';

@Injectable()
export class ContentStatusWorkflowService {
  constructor(
    private readonly db: DatabaseService,
    private readonly publishValidationService: PublishValidationService,
  ) {}

  async publish(entityType: WorkflowEntityType, entityId: string): Promise<StatusTransitionResult> {
    return this.transition(entityType, entityId, 'published');
  }

  async archive(entityType: WorkflowEntityType, entityId: string): Promise<StatusTransitionResult> {
    return this.transition(entityType, entityId, 'archived');
  }

  async restore(entityType: WorkflowEntityType, entityId: string): Promise<StatusTransitionResult> {
    return this.transition(entityType, entityId, 'draft');
  }

  private async transition(
    entityType: WorkflowEntityType,
    entityId: string,
    targetStatus: string,
  ): Promise<StatusTransitionResult> {
    this.assertValidEntityType(entityType);
    this.assertValidTargetStatus(targetStatus);

    const table = ENTITY_TABLE[entityType];
    const current = await this.loadStatus(table, entityId, entityType);

    if (!isCurriculumContentStatus(current.status)) {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: `Entity has unrecognized status: ${current.status}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (!isAllowedStatusTransition(current.status, targetStatus as any)) {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: `Transition from '${current.status}' to '${targetStatus}' is not allowed.`,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (targetStatus === 'published') {
      await this.publishValidationService.validateReadyForPublish(entityType, entityId);
    }

    const updated = await this.db.query<StatusRow>(
      `UPDATE ${table}
         SET status = $1, updated_at = now()
         WHERE id = $2
         RETURNING id, status, updated_at`,
      [targetStatus, entityId],
    );

    return {
      id: entityId,
      entityType,
      previousStatus: current.status,
      currentStatus: updated.rows[0].status,
      updatedAt: updated.rows[0].updated_at,
    };
  }

  private async loadStatus(
    table: string,
    entityId: string,
    entityType: WorkflowEntityType,
  ): Promise<StatusRow> {
    const result = await this.db.query<StatusRow>(
      `SELECT id, status, updated_at FROM ${table} WHERE id = $1 LIMIT 1`,
      [entityId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `${entityType} not found: ${entityId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result.rows[0];
  }

  private assertValidEntityType(value: string): asserts value is WorkflowEntityType {
    if (!(WORKFLOW_ENTITY_TYPES as readonly string[]).includes(value)) {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: `Invalid entity type: ${value}. Allowed: ${WORKFLOW_ENTITY_TYPES.join(', ')}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private assertValidTargetStatus(value: string): void {
    if (!isCurriculumContentStatus(value)) {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: `Invalid target status: ${value}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
