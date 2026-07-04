// P20-013: Add Focus Directive Context
// Backend-approved, read-only adapter that resolves the AI Teacher's
// "what to focus extra practice/explanation on right now" context.
//
// Authority boundary (docs/phase-18/ai-teacher-authority-rules.md):
//   - This adapter reads ONLY the already-generated directive_text string
//     from ai_focus_directives, via FocusDirectiveReadService. It does not
//     read weakness_records, recommendations, or difficulty_decisions
//     directly, and computes no mastery/level/weakness/difficulty/
//     recommendation/review-schedule value itself — that generation step
//     lives entirely in aim/persistence/aim-focus-directive.service.ts.
//   - Returns null when no active directive exists (new student, or nothing
//     has produced a directive yet) — focus-directive context is optional
//     for an AI Teacher turn, so this never throws and never fabricates a
//     default directive.

import { Injectable } from '@nestjs/common';

import { FocusDirectiveReadService } from '../../../aim/result/focus-directive-read.service';

export interface FocusDirectiveContext {
  readonly skillId: string;
  readonly directiveText: string;
}

@Injectable()
export class FocusDirectiveContextAdapter {
  constructor(private readonly focusDirective: FocusDirectiveReadService) {}

  async getFocusDirectiveContext(studentId: string): Promise<FocusDirectiveContext | null> {
    const directive = await this.focusDirective.getActiveForStudent(studentId);

    if (!directive) {
      return null;
    }

    return {
      skillId: directive.skillId,
      directiveText: directive.directiveText,
    };
  }

  /**
   * P21-012: Short, templated one-line label built from the same
   * `directive_text` this adapter already reads — distinct from the
   * flowing greeting prose so Flutter can render it with its own styling
   * (a small callout, not a chat bubble) separately from the greeting
   * message itself. Returns null when no active directive exists; this
   * never fabricates a directive.
   */
  async getFocusRecap(studentId: string): Promise<string | null> {
    const context = await this.getFocusDirectiveContext(studentId);

    if (!context) {
      return null;
    }

    return `Today we're focusing on: ${context.directiveText}`;
  }
}
