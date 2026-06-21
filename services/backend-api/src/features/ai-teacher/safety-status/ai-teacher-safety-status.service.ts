// P18-047: Create AI Safety Status API
//
// Reads the existing ai_safety_events rows (P8-066, P8-026) for a
// student-owned session and reduces them to a fixed, student-safe status:
// 'ok' when every recorded check has been 'allowed', or 'limited' as soon
// as any check has been 'rejected'. Never returns the raw reason_category
// taxonomy or any message/response text.

import { Injectable } from '@nestjs/common';

import { AiSafetyEventRepository } from '../repositories/ai-safety-event.repository';
import { AiTeacherSafetyStatusResult } from './ai-teacher-safety-status.types';

@Injectable()
export class AiTeacherSafetyStatusService {
  constructor(private readonly safetyEventRepository: AiSafetyEventRepository) {}

  async getStatus(sessionId: string): Promise<AiTeacherSafetyStatusResult> {
    const events = await this.safetyEventRepository.findBySessionId(sessionId);

    const hasRejection = events.some((event) => event.decision === 'rejected');

    return {
      sessionId,
      status: hasRejection ? 'limited' : 'ok',
      lastCheckedAt: events[0]?.created_at ?? null,
    };
  }
}
