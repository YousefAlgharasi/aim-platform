/**
 * P8-038: Context Token Budget Policy.
 * Applies field-priority ordering and a total token budget to an already
 * backend-approved AiTeacherContextSnapshot. This service runs after
 * ContextBuilderService assembles the snapshot and before prompt
 * construction (Group E). It performs no database access and computes no
 * learning-decision value; it only decides which already-resolved fields
 * fit inside the token budget, in priority order, dropping lowest-priority
 * fields first and truncating only fields explicitly marked truncatable.
 */
import { Injectable, Logger } from '@nestjs/common';

import { AiTeacherContextSnapshot } from './context-builder.types';
import {
  AI_TEACHER_CONTEXT_CHARS_PER_TOKEN,
  AI_TEACHER_CONTEXT_FIELD_BUDGET_RULES,
  AI_TEACHER_CONTEXT_TOTAL_TOKEN_BUDGET,
} from './context-budget.constants';
import {
  BudgetedContextResult,
  ContextFieldKey,
  ContextFieldUsage,
} from './context-budget.types';

@Injectable()
export class ContextBudgetPolicyService {
  private readonly logger = new Logger(ContextBudgetPolicyService.name);

  applyBudget(snapshot: AiTeacherContextSnapshot): BudgetedContextResult {
    const rules = [...AI_TEACHER_CONTEXT_FIELD_BUDGET_RULES].sort(
      (a, b) => a.priority - b.priority,
    );

    let remainingBudget = AI_TEACHER_CONTEXT_TOTAL_TOKEN_BUDGET;
    const fieldUsage: ContextFieldUsage[] = [];
    const trimmed: AiTeacherContextSnapshot = { ...snapshot };

    for (const rule of rules) {
      const rawValue = snapshot[rule.field];
      const estimatedTokens = this.estimateTokens(rawValue);

      if (estimatedTokens === 0) {
        continue;
      }

      const allowedTokens = Math.min(rule.maxTokens, remainingBudget);

      if (allowedTokens <= 0) {
        this.dropField(trimmed, rule.field);
        fieldUsage.push({
          field: rule.field,
          estimatedTokens,
          includedTokens: 0,
          truncated: false,
          dropped: true,
        });
        continue;
      }

      if (estimatedTokens <= allowedTokens) {
        remainingBudget -= estimatedTokens;
        fieldUsage.push({
          field: rule.field,
          estimatedTokens,
          includedTokens: estimatedTokens,
          truncated: false,
          dropped: false,
        });
        continue;
      }

      if (!rule.truncatable) {
        this.dropField(trimmed, rule.field);
        fieldUsage.push({
          field: rule.field,
          estimatedTokens,
          includedTokens: 0,
          truncated: false,
          dropped: true,
        });
        continue;
      }

      const truncatedValue = this.truncateField(rawValue, allowedTokens);
      (trimmed as Record<ContextFieldKey, unknown>)[rule.field] = truncatedValue;
      remainingBudget -= allowedTokens;
      fieldUsage.push({
        field: rule.field,
        estimatedTokens,
        includedTokens: allowedTokens,
        truncated: true,
        dropped: false,
      });
    }

    const totalUsedTokens = AI_TEACHER_CONTEXT_TOTAL_TOKEN_BUDGET - remainingBudget;

    this.logger.log(
      `Context budget applied for session ${snapshot.sessionId}: ${totalUsedTokens}/${AI_TEACHER_CONTEXT_TOTAL_TOKEN_BUDGET} tokens used`,
    );

    return {
      snapshot: trimmed,
      totalBudgetTokens: AI_TEACHER_CONTEXT_TOTAL_TOKEN_BUDGET,
      totalUsedTokens,
      fieldUsage,
    };
  }

  private dropField(snapshot: AiTeacherContextSnapshot, field: ContextFieldKey): void {
    const fallback = field === 'recentMistakes' ? [] : null;
    (snapshot as Record<ContextFieldKey, unknown>)[field] = fallback;
  }

  private truncateField(value: unknown, allowedTokens: number): unknown {
    if (Array.isArray(value)) {
      return this.truncateArray(value, allowedTokens);
    }
    return value;
  }

  private truncateArray(items: unknown[], allowedTokens: number): unknown[] {
    const result: unknown[] = [];
    let usedTokens = 0;

    for (const item of items) {
      const itemTokens = this.estimateTokens(item);
      if (usedTokens + itemTokens > allowedTokens) {
        break;
      }
      result.push(item);
      usedTokens += itemTokens;
    }

    return result;
  }

  private estimateTokens(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }
    if (Array.isArray(value) && value.length === 0) {
      return 0;
    }
    if (typeof value === 'object' && Object.keys(value as object).length === 0) {
      return 0;
    }

    const serialized = JSON.stringify(value);
    return Math.ceil(serialized.length / AI_TEACHER_CONTEXT_CHARS_PER_TOKEN);
  }
}
