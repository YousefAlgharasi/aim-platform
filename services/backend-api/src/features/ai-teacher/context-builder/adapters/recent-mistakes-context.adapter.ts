// P8-037: Add Recent Mistakes Context
// Wraps ErrorPatternsReadService (backend-classified error_patterns, P5-035)
// to expose backend-approved, already-classified recurring mistake types as
// read-only AI Teacher prompt context, supporting mistake explanation and
// targeted hints without AI Teacher reclassifying or recomputing patterns.

import { Injectable } from '@nestjs/common';
import { ErrorPatternsReadService } from '../../../aim/result/error-patterns-read.service';

export interface RecentMistakeContextEntry {
  readonly skillId: string;
  readonly patternType: string;
  readonly patternCode: string | null;
  readonly occurrenceCount: number;
}

@Injectable()
export class RecentMistakesContextAdapter {
  constructor(private readonly errorPatternsRead: ErrorPatternsReadService) {}

  async getRecentMistakesContext(studentId: string): Promise<RecentMistakeContextEntry[]> {
    const { errorPatterns } = await this.errorPatternsRead.getActiveErrorPatternsForStudent(
      studentId,
    );
    return errorPatterns.map((entry) => ({
      skillId: entry.skillId,
      patternType: entry.patternType,
      patternCode: entry.patternCode,
      occurrenceCount: entry.occurrenceCount,
    }));
  }
}
