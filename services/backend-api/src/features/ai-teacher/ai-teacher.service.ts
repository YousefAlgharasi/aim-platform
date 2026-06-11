import { Injectable, Logger } from '@nestjs/common';

import {
  AI_TEACHER_MAX_INVOCATIONS_PER_SESSION,
  AI_TEACHER_MAX_RESPONSE_WORDS,
} from './ai-teacher.constants';
import {
  AiTeacherContext,
  AiTeacherInvocationRecord,
  AiTeacherResponse,
} from './ai-teacher.types';

@Injectable()
export class AiTeacherService {
  private readonly logger = new Logger(AiTeacherService.name);

  isInvocationAllowed(sessionInvocationCount: number): boolean {
    return sessionInvocationCount < AI_TEACHER_MAX_INVOCATIONS_PER_SESSION;
  }

  async explain(context: AiTeacherContext): Promise<AiTeacherResponse> {
    if (!this.isInvocationAllowed(context.sessionInvocationCount)) {
      this.logger.warn(
        `AI Teacher invocation limit reached for session — hookType=${context.hookType}`,
      );
      return this.fallbackResponse();
    }

    const raw = await this.callGateway(context);
    const valid = this.validate(raw, context);

    if (!valid) {
      this.logger.warn(
        `AI Teacher response failed validation — hookType=${context.hookType}`,
      );
      return this.fallbackResponse();
    }

    return { explanation: raw, isFallback: false, validationPassed: true };
  }

  recordInvocation(record: AiTeacherInvocationRecord): void {
    this.logger.log(
      `AI Teacher invocation recorded — sessionId=${record.sessionId} hookType=${record.hookType} position=${record.invocationPositionInSession}`,
    );
  }

  private async callGateway(_context: AiTeacherContext): Promise<string> {
    return '';
  }

  private validate(raw: string, context: AiTeacherContext): boolean {
    if (!raw || raw.trim().length === 0) {
      return false;
    }
    const wordCount = raw.trim().split(/\s+/).length;
    if (wordCount > AI_TEACHER_MAX_RESPONSE_WORDS) {
      return false;
    }
    if (
      context.correctAnswer &&
      context.hookType === 'retry_with_help' &&
      raw.includes(context.correctAnswer)
    ) {
      return false;
    }
    return true;
  }

  private fallbackResponse(): AiTeacherResponse {
    return {
      explanation:
        "Let's focus on the lesson skill. Try working through the question step by step.",
      isFallback: true,
      validationPassed: false,
    };
  }
}
