/**
 * P9-055: Add Voice Rate Limit Policy (Group F — Voice Orchestration With
 * Phase 8 AI Teacher). Enforces per-session, per-hour, per-day, and
 * debounce rate limits on voice turns before any STT/TTS/AI provider
 * call is allowed. Protects system cost and abuse risk, mirroring the
 * Phase 8 AI Teacher text chat rate limit policy (P8-069).
 *
 * Design constraints:
 * - This service computes no mastery/level/weakness/difficulty/
 *   recommendation/review-schedule value
 *   (docs/phase-9/no-aim-authority-change-rule.md).
 * - No STT/TTS/AI provider credential is read or referenced.
 * - No rate limit state or threshold is ever sent to the Flutter client;
 *   the client receives only a 429-shaped error reply from the
 *   controller.
 * - All counts are derived from the existing `voice_messages` table
 *   (P9-019/P9-027) via the `VoiceMessageRepository`. No new table or
 *   migration is required.
 *
 * Call `assertNotRateLimited(input)` once per voice turn, before the
 * transcript/response/persistence pipeline runs. On any breach it
 * throws `VoiceRateLimitExceededError`; callers translate that into
 * HTTP 429.
 */
import { Injectable, Logger } from '@nestjs/common';

import { VoiceMessageRepository } from '../repositories/voice-message.repository';
import { VoiceRateLimitExceededError } from './voice-rate-limit-exceeded.error';
import { VoiceRateLimitCheckInput } from './voice-rate-limit-policy.types';
import {
  VOICE_RATE_LIMIT_MAX_TURNS_PER_SESSION,
  VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY,
  VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR,
  VOICE_RATE_LIMIT_MIN_TURN_GAP_MS,
} from './voice-rate-limit-policy.constants';

@Injectable()
export class VoiceRateLimitPolicyService {
  private readonly logger = new Logger(VoiceRateLimitPolicyService.name);

  constructor(private readonly voiceMessageRepository: VoiceMessageRepository) {}

  /**
   * Assert that the current voice turn is within all configured rate
   * limit thresholds. Throws `VoiceRateLimitExceededError` on first
   * breach found; order of checks: debounce → session limit → hourly →
   * daily.
   */
  async assertNotRateLimited(input: VoiceRateLimitCheckInput): Promise<void> {
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
    const lastAt = await this.voiceMessageRepository.findLastCreatedAtBySessionId(sessionId);
    if (lastAt === null) {
      return; // No previous voice message — first turn is always allowed.
    }

    const gapMs = Date.now() - new Date(lastAt).getTime();
    if (gapMs < VOICE_RATE_LIMIT_MIN_TURN_GAP_MS) {
      const retryAfterSeconds = Math.ceil((VOICE_RATE_LIMIT_MIN_TURN_GAP_MS - gapMs) / 1_000);
      this.logger.warn(
        `Rate limit (debounce): session ${sessionId} sent another voice turn only ${gapMs}ms after the last.`,
      );
      throw new VoiceRateLimitExceededError(
        'MIN_TURN_GAP',
        `Please wait before sending another voice message (${retryAfterSeconds}s).`,
        retryAfterSeconds,
      );
    }
  }

  private async checkSessionLimit(sessionId: string): Promise<void> {
    const count = await this.voiceMessageRepository.countBySessionId(sessionId);
    if (count >= VOICE_RATE_LIMIT_MAX_TURNS_PER_SESSION) {
      this.logger.warn(
        `Rate limit (session): session ${sessionId} has reached ${count} voice turns ` +
          `(limit: ${VOICE_RATE_LIMIT_MAX_TURNS_PER_SESSION}).`,
      );
      throw new VoiceRateLimitExceededError(
        'SESSION_TURN_LIMIT',
        `You have reached the maximum number of voice messages for this session ` +
          `(${VOICE_RATE_LIMIT_MAX_TURNS_PER_SESSION}).`,
        null,
      );
    }
  }

  private async checkHourlyLimit(studentId: string): Promise<void> {
    const windowStart = new Date(Date.now() - 60 * 60 * 1_000);
    const count = await this.voiceMessageRepository.countByStudentIdSince(studentId, windowStart);
    if (count >= VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR) {
      this.logger.warn(
        `Rate limit (hourly): student ${studentId} has sent ${count} voice turns in the last hour ` +
          `(limit: ${VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR}).`,
      );
      throw new VoiceRateLimitExceededError(
        'STUDENT_HOURLY_LIMIT',
        `You have reached the hourly voice message limit ` +
          `(${VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR} per hour). Please try again later.`,
        60 * 60,
      );
    }
  }

  private async checkDailyLimit(studentId: string): Promise<void> {
    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1_000);
    const count = await this.voiceMessageRepository.countByStudentIdSince(studentId, windowStart);
    if (count >= VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY) {
      this.logger.warn(
        `Rate limit (daily): student ${studentId} has sent ${count} voice turns in the last 24 h ` +
          `(limit: ${VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY}).`,
      );
      throw new VoiceRateLimitExceededError(
        'STUDENT_DAILY_LIMIT',
        `You have reached the daily voice message limit ` +
          `(${VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY} per day). Please try again tomorrow.`,
        24 * 60 * 60,
      );
    }
  }
}
