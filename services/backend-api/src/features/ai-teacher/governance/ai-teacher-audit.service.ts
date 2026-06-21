// P18-039: Create AI Audit Service
// Logs safe metadata for AI requests, safety events, prompt/model config
// changes, and cost events. Details must never include provider secrets,
// API keys, or raw provider payloads — callers must pre-redact before
// calling these methods.

import { Injectable } from '@nestjs/common';

import { AiTeacherAuditLogRepository } from './ai-teacher-audit-log.repository';
import { AiTeacherAuditLogRow } from './governance-repository.types';

@Injectable()
export class AiTeacherAuditService {
  constructor(private readonly auditLogRepository: AiTeacherAuditLogRepository) {}

  async logRequest(
    actorId: string | null,
    resourceId: string,
    details: Record<string, unknown>,
  ): Promise<AiTeacherAuditLogRow> {
    return this.auditLogRepository.create({
      actorId,
      action: 'ai_request',
      resourceType: 'conversation',
      resourceId,
      details,
    });
  }

  async logSafetyEvent(
    targetId: string,
    details: Record<string, unknown>,
  ): Promise<AiTeacherAuditLogRow> {
    return this.auditLogRepository.create({
      actorId: null,
      action: 'safety_check',
      resourceType: 'safety_check',
      resourceId: targetId,
      details,
    });
  }

  async logPromptConfigChange(
    actorId: string,
    promptTemplateId: string,
    details: Record<string, unknown>,
  ): Promise<AiTeacherAuditLogRow> {
    return this.auditLogRepository.create({
      actorId,
      action: 'prompt_template_change',
      resourceType: 'prompt_template',
      resourceId: promptTemplateId,
      details,
    });
  }

  async logModelConfigChange(
    actorId: string,
    modelConfigId: string,
    details: Record<string, unknown>,
  ): Promise<AiTeacherAuditLogRow> {
    return this.auditLogRepository.create({
      actorId,
      action: 'model_config_change',
      resourceType: 'model_config',
      resourceId: modelConfigId,
      details,
    });
  }

  async logCostEvent(
    studentId: string,
    usageCostEventId: string,
    details: Record<string, unknown>,
  ): Promise<AiTeacherAuditLogRow> {
    return this.auditLogRepository.create({
      actorId: studentId,
      action: 'cost_event',
      resourceType: 'usage_cost_event',
      resourceId: usageCostEventId,
      details,
    });
  }
}
