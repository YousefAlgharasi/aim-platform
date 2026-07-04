// P20-018: Add Difficulty Decision Context
// Backend-approved, read-only adapter that resolves the AI Teacher's
// "has this student's difficulty just changed, and why" context.
//
// Authority boundary (docs/phase-18/ai-teacher-authority-rules.md):
//   - This adapter reads ONLY the already-generated rationale string from
//     difficulty_decisions, via DifficultyDecisionReadService. It does not
//     compute a difficulty value itself — that decision is made entirely by
//     the AIM Engine's DifficultyAdapter and persisted by
//     aim/persistence/difficulty-decision.service.ts.
//   - Returns null when no decision exists yet — difficulty context is
//     optional for an AI Teacher turn, so this never throws and never
//     fabricates a default rationale.

import { Injectable } from '@nestjs/common';

import { DifficultyDecisionReadService } from '../../../aim/result/difficulty-decision-read.service';

export interface DifficultyDecisionContext {
  readonly skillId: string;
  readonly rationale: string;
}

@Injectable()
export class DifficultyDecisionContextAdapter {
  constructor(private readonly difficultyDecision: DifficultyDecisionReadService) {}

  async getDifficultyDecisionContext(
    studentId: string,
  ): Promise<DifficultyDecisionContext | null> {
    const { found, difficultyDecision } =
      await this.difficultyDecision.getLatestForStudent(studentId);

    if (!found || !difficultyDecision) {
      return null;
    }

    return {
      skillId: difficultyDecision.skillId,
      rationale: difficultyDecision.rationale,
    };
  }
}
