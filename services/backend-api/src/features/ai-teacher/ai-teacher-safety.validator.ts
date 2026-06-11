import { Injectable } from '@nestjs/common';

import {
  AiTeacherValidationStatus,
} from './interfaces/ai-teacher-contracts.interface';

export interface AiTeacherValidationResult {
  status: AiTeacherValidationStatus;
  passed: boolean;
  word_count: number;
}

@Injectable()
export class AiTeacherSafetyValidator {
  private static readonly MAX_WORD_COUNT = 150;

  private static readonly PROHIBITED_PATTERNS: RegExp[] = [
    /\b(hate|kill|abuse|racist|sexist|slur)\b/i,
  ];

  validate(
    responseText: string,
    questionText: string | null,
    correctAnswer: string | null,
  ): AiTeacherValidationResult {
    const wordCount = this.countWords(responseText);

    if (wordCount > AiTeacherSafetyValidator.MAX_WORD_COUNT) {
      return { status: AiTeacherValidationStatus.FAILED_EXCESSIVE_LENGTH, passed: false, word_count: wordCount };
    }

    if (this.containsProhibitedLanguage(responseText)) {
      return { status: AiTeacherValidationStatus.FAILED_PROHIBITED_LANGUAGE, passed: false, word_count: wordCount };
    }

    if (correctAnswer && this.containsAnswerLeakage(responseText, correctAnswer)) {
      return { status: AiTeacherValidationStatus.FAILED_ANSWER_LEAKAGE, passed: false, word_count: wordCount };
    }

    return { status: AiTeacherValidationStatus.PASSED, passed: true, word_count: wordCount };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private containsProhibitedLanguage(text: string): boolean {
    return AiTeacherSafetyValidator.PROHIBITED_PATTERNS.some((pattern) =>
      pattern.test(text),
    );
  }

  private containsAnswerLeakage(responseText: string, correctAnswer: string): boolean {
    const normalised = (s: string) => s.toLowerCase().trim();
    return normalised(responseText).includes(normalised(correctAnswer));
  }
}
