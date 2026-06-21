// P18-029: Create AI Safety Service
// Moderation/safety checks before and after AI generation, recorded
// against ai_teacher_safety_checks. Fails closed: if a check cannot be
// completed, the request is treated as blocked rather than allowed.

import { Injectable } from '@nestjs/common';

import {
  AiTeacherModerationResponse,
  AiTeacherProviderGateway,
} from './ai-teacher-provider.interface';
import { AiTeacherSafetyCheckRepository } from './ai-teacher-safety-check.repository';
import { AiTeacherSafetyCheckRow } from './governance-repository.types';

export interface SafetyCheckOutcome {
  readonly action: 'allowed' | 'flagged' | 'blocked';
  readonly category: string;
  readonly record: AiTeacherSafetyCheckRow;
}

@Injectable()
export class AiTeacherSafetyService {
  constructor(
    private readonly safetyCheckRepository: AiTeacherSafetyCheckRepository,
    private readonly providerGateway: AiTeacherProviderGateway,
  ) {}

  /** Run before a provider call, against student input. */
  async checkInput(
    targetType: 'message' | 'voice_segment',
    targetId: string,
    content: string,
    providerKeyRef: string,
  ): Promise<SafetyCheckOutcome> {
    return this.runModeration(targetType, targetId, content, providerKeyRef, 'input');
  }

  /** Run after a provider call, against the generated response. */
  async checkOutput(
    targetType: 'message' | 'voice_segment',
    targetId: string,
    content: string,
    providerKeyRef: string,
  ): Promise<SafetyCheckOutcome> {
    return this.runModeration(targetType, targetId, content, providerKeyRef, 'output');
  }

  private async runModeration(
    targetType: 'message' | 'voice_segment',
    targetId: string,
    content: string,
    providerKeyRef: string,
    direction: 'input' | 'output',
  ): Promise<SafetyCheckOutcome> {
    let moderation: AiTeacherModerationResponse;
    let action: 'allowed' | 'flagged' | 'blocked';
    let category: string;

    try {
      moderation = await this.providerGateway.moderateContent({ providerKeyRef, content });
      category = moderation.flagged ? moderation.categories[0] ?? 'unspecified' : 'none';
      action = moderation.flagged ? 'blocked' : 'allowed';
    } catch {
      // Fail closed: a moderation error blocks rather than allows.
      category = 'moderation_error';
      action = 'blocked';
    }

    const record = await this.safetyCheckRepository.create({
      targetType,
      targetId,
      category,
      severity: action === 'blocked' ? 'high' : 'low',
      action,
      metadata: { direction },
    });

    return { action, category, record };
  }
}
