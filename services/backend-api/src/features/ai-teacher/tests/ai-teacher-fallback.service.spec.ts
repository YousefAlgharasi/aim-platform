import { AiTeacherFallbackService } from '../ai-teacher-fallback.service';
import {
  AiTeacherMode,
  AiTeacherValidationStatus,
} from '../interfaces/ai-teacher-contracts.interface';

describe('AiTeacherFallbackService', () => {
  let service: AiTeacherFallbackService;

  beforeEach(() => {
    service = new AiTeacherFallbackService();
  });

  it('returns a fallback with is_fallback true for provider failure', () => {
    const result = service.getFallback(
      AiTeacherMode.EXPLAIN_MORE,
      AiTeacherValidationStatus.FALLBACK_USED,
    );
    expect(result.is_fallback).toBe(true);
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.reason).toBe(AiTeacherValidationStatus.FALLBACK_USED);
  });

  it('returns a fallback when validator blocks output', () => {
    const result = service.getFallback(
      AiTeacherMode.EXPLAIN_WHY,
      AiTeacherValidationStatus.FAILED_ANSWER_LEAKAGE,
    );
    expect(result.is_fallback).toBe(true);
    expect(result.reason).toBe(AiTeacherValidationStatus.FAILED_ANSWER_LEAKAGE);
  });

  it('returns a different message per mode', () => {
    const modes = Object.values(AiTeacherMode);
    const messages = modes.map((mode) =>
      service.getFallback(mode, AiTeacherValidationStatus.FALLBACK_USED).message,
    );
    const unique = new Set(messages);
    expect(unique.size).toBe(modes.length);
  });

  it('fallback message does not expose provider output or internal details', () => {
    const result = service.getFallback(
      AiTeacherMode.REMEDIATION,
      AiTeacherValidationStatus.FAILED_PROHIBITED_LANGUAGE,
    );
    expect(result.message).not.toMatch(/error|exception|provider|api|key|stack/i);
  });
});
