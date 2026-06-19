/**
 * P8-066: Add AI Response Safety Filter (Group G — AI Teacher Backend
 * Pipeline). Validates an AI Teacher response before it is ever persisted
 * or displayed to the student, and records the outcome (allowed/rejected)
 * as an `ai_safety_events` row via `AiSafetyEventRepository` (P8-022,
 * P8-026) — never the rejected response text itself, only that a check
 * ran and its decision/category.
 *
 * Three fixed categories are checked, in order: a learning-authority
 * violation (the response states a mastery/level/weakness/difficulty/
 * recommendation/review-schedule value — AI Teacher must never replace
 * AIM Engine's authority over those, docs/phase-8/no-aim-replacement-rule.md),
 * a secret/API-key leak, and a small set of unsafe-content patterns. Any
 * match replaces the response with the single, fixed, student-safe
 * fallback text — provider/internal detail is never substituted in its
 * place. Performs no AI provider call and computes no learning-decision
 * value itself.
 */
import { Injectable } from '@nestjs/common';

import { AiSafetyEventRepository } from '../repositories/ai-safety-event.repository';
import { FilterAiResponseInput, FilterAiResponseResult } from './response-safety-filter.types';
import {
  AI_RESPONSE_SAFE_FALLBACK_MESSAGE,
  LEARNING_AUTHORITY_VIOLATION_PATTERNS,
  SECRET_LEAK_PATTERNS,
  UNSAFE_CONTENT_PATTERNS,
} from './response-safety-filter.constants';

const LEARNING_AUTHORITY_VIOLATION_CATEGORY = 'LEARNING_AUTHORITY_VIOLATION';
const SECRET_LEAK_CATEGORY = 'SECRET_LEAK';
const UNSAFE_CONTENT_CATEGORY = 'UNSAFE_CONTENT';

@Injectable()
export class ResponseSafetyFilterService {
  constructor(private readonly safetyEventRepository: AiSafetyEventRepository) {}

  async filterResponse(input: FilterAiResponseInput): Promise<FilterAiResponseResult> {
    const sessionId = input.sessionId?.trim();

    if (!sessionId) {
      throw new Error('Cannot filter an AI Teacher response: sessionId is missing.');
    }

    const text = input.text ?? '';
    const reasonCategory = this.detectViolation(text);

    if (reasonCategory) {
      await this.safetyEventRepository.create({
        sessionId,
        direction: 'output',
        decision: 'rejected',
        reasonCategory,
      });

      return { text: AI_RESPONSE_SAFE_FALLBACK_MESSAGE, wasFiltered: true, reasonCategory };
    }

    await this.safetyEventRepository.create({
      sessionId,
      direction: 'output',
      decision: 'allowed',
      reasonCategory: null,
    });

    return { text, wasFiltered: false, reasonCategory: null };
  }

  private detectViolation(text: string): string | null {
    if (LEARNING_AUTHORITY_VIOLATION_PATTERNS.some((pattern) => pattern.test(text))) {
      return LEARNING_AUTHORITY_VIOLATION_CATEGORY;
    }

    if (SECRET_LEAK_PATTERNS.some((pattern) => pattern.test(text))) {
      return SECRET_LEAK_CATEGORY;
    }

    if (UNSAFE_CONTENT_PATTERNS.some((pattern) => pattern.test(text))) {
      return UNSAFE_CONTENT_CATEGORY;
    }

    return null;
  }
}
