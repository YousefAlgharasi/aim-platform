/**
 * P8-069: Add AI Teacher Rate Limit Policy (Group G — AI Teacher Backend
 * Pipeline). Enforces per-session, per-hour, per-day, and debounce rate
 * limits on student AI Teacher turns before any AI provider call is
 * allowed.  Protects system cost and abuse risk.
 *
 * Design constraints:
 * - This service computes no mastery/level/weakness/difficulty/
 *   recommendation/review-schedule value
 *   (docs/phase-8/no-aim-replacement-rule.md).
 * - No AI provider credential is read or referenced
 *   (docs/phase-8/no-client-ai-provider-rule.md).
 * - No rate limit state or threshold is ever sent to the Flutter client;
 *   the client receives only a 429-shaped error reply from the controller.
 * - All counts are derived from the existing `ai_chat_messages` table
 *   (already created by earlier Phase 8 tasks) via the
 *   `AiChatMessageRepository`.  No new table or migration is required.
 *
 * Call `assertNotRateLimited(input)` once per AI Teacher turn, before
 * the context/prompt/provider pipeline runs.  On any breach it throws
 * `RateLimitExceededError`; callers translate that into HTTP 429.
 */
import { Injectable, Logger } from '@nestjs/common';

import { AiChatMessageRepository } from '../repositories/ai-chat-message.repository';
import { RateLimitExceededError } from './rate-limit-exceeded.error';
import { RateLimitCheckInput } from './rate-limit-policy.types';
import {
  AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION,
  AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY,
  AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR,
  AI_TEACHER_RATE_LIMIT_MIN_TURN_GAP_MS,
} from './rate-limit-policy.constants';

@Injectable()
export class RateLimitPolicyService {
  private readonly logger = new Logger(RateLimitPolicyService.name);

  constructor(private readonly chatMessageRepository: AiChatMessageRepository) {}

  /**
   * Assert that the current student turn is within all configured rate
   * limit thresholds.  Throws `RateLimitExceededError` on first breach
   * found; order of checks: debounce → session limit → hourly → daily.
   */
  async assertNotRateLimited(input: RateLimitCheckInput): Promise<void> {
    const { studentId, sessionId } = input;

    await this.checkDebounce(sessionId);
    await this.checkSessionLimit(sessionId);
    await this.checkHourlyLimit(studentId);
    await this.checkDailyLimit(studentId);
  }

  // ---------------------------------------------------------------------------
  // Private check methods
  // ---------------------------------------------------------------------------

  private async checkDebounce(sessionId: string): Promise<void> {
    const lastAt = await this.chatMessageRepository.findLastStudentTurnCreatedAt(sessionId);
    if (lastAt === null) {
      return; // No previous student message — first turn is always allowed.
    }

    const gapMs = Date.now() - new Date(lastAt).getTime();
    if (gapMs < AI_TEACHER_RATE_LIMIT_MIN_TURN_GAP_MS) {
      const retryAfterSeconds = Math.ceil(
        (AI_TEACHER_RATE_LIMIT_MIN_TURN_GAP_MS - gapMs) / 1_000,
      );
      this.logger.warn(
        `Rate limit (debounce): session ${sessionId} sent another message only ${gapMs}ms after the last.`,
      );
      throw new RateLimitExceededError(
        'MIN_TURN_GAP',
        `Please wait before sending another message (${retryAfterSeconds}s).`,
        retryAfterSeconds,
      );
    }
  }

  private async checkSessionLimit(sessionId: string): Promise<void> {
    const count = await this.chatMessageRepository.countStudentTurnsBySession(sessionId);
    if (count >= AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION) {
      this.logger.warn(
        `Rate limit (session): session ${sessionId} has reached ${count} student turns ` +
          `(limit: ${AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION}).`,
      );
      throw new RateLimitExceededError(
        'SESSION_TURN_LIMIT',
        `You have reached the maximum number of AI Teacher messages for this session ` +
          `(${AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION}).`,
        null,
      );
    }
  }

  private async checkHourlyLimit(studentId: string): Promise<void> {
    const windowStart = new Date(Date.now() - 60 * 60 * 1_000);
    const count = await this.chatMessageRepository.countStudentTurnsSince(studentId, windowStart);
    if (count >= AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR) {
      this.logger.warn(
        `Rate limit (hourly): student ${studentId} has sent ${count} messages in the last hour ` +
          `(limit: ${AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR}).`,
      );
      throw new RateLimitExceededError(
        'STUDENT_HOURLY_LIMIT',
        `You have reached the hourly AI Teacher message limit ` +
          `(${AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR} per hour). Please try again later.`,
        60 * 60,
      );
    }
  }

  private async checkDailyLimit(studentId: string): Promise<void> {
    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1_000);
    const count = await this.chatMessageRepository.countStudentTurnsSince(studentId, windowStart);
    if (count >= AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY) {
      this.logger.warn(
        `Rate limit (daily): student ${studentId} has sent ${count} messages in the last 24 h ` +
          `(limit: ${AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY}).`,
      );
      throw new RateLimitExceededError(
        'STUDENT_DAILY_LIMIT',
        `You have reached the daily AI Teacher message limit ` +
          `(${AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY} per day). Please try again tomorrow.`,
        24 * 60 * 60,
      );
    }
  }
}
