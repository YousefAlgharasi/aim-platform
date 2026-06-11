import { Injectable } from '@nestjs/common';

import {
  AiTeacherMode,
  AiTeacherValidationStatus,
} from './interfaces/ai-teacher-contracts.interface';

export interface AiTeacherFallbackResult {
  message: string;
  reason: AiTeacherValidationStatus;
  is_fallback: true;
}

@Injectable()
export class AiTeacherFallbackService {
  private static readonly FALLBACK_MESSAGES: Record<AiTeacherMode, string> = {
    [AiTeacherMode.EXPLAIN_MORE]:
      "Let's look at this again. Try reading the explanation once more and focus on the key words.",
    [AiTeacherMode.GIVE_EXAMPLE]:
      'Here is a tip: look for the pattern in the examples you have already seen.',
    [AiTeacherMode.EXPLAIN_WHY]:
      'That was not quite right. Review the explanation and try again — you are making progress.',
    [AiTeacherMode.REMEDIATION]:
      'Take your time with this skill. Re-read the lesson and try the practice questions again.',
  };

  getFallback(
    mode: AiTeacherMode,
    reason: AiTeacherValidationStatus,
  ): AiTeacherFallbackResult {
    return {
      message: AiTeacherFallbackService.FALLBACK_MESSAGES[mode],
      reason,
      is_fallback: true,
    };
  }
}
