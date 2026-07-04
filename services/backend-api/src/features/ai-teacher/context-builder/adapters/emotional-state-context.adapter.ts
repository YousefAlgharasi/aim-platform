// P20-020: Add Emotional/Frustration Signal Context
// Backend-approved, read-only adapter that resolves the AI Teacher's
// "how is this student doing right now, emotionally" context, so the AI
// Teacher can adjust tone (slow down, add encouragement) for the student's
// active session.
//
// Authority boundary (docs/phase-18/ai-teacher-authority-rules.md):
//   - This adapter reads ONLY the coarse, already-computed
//     frustration_level/engagement_level enum values from session_summaries
//     (via SessionStateReadService), never the raw numeric frustration_score
//     computed by aim-engine's EmotionalStateDetector. Those enums are
//     documented as coarse EDUCATIONAL signals only — never clinical or
//     diagnostic labels (see frustration-signal.service.ts /
//     session-summary.service.ts comments) — and this adapter must never
//     construct clinical/psychological-sounding language from them.
//   - Returns null when no session summary has been persisted yet for the
//     student's active session — this context is optional for an AI Teacher
//     turn, so this never throws and never fabricates a default signal.

import { Injectable } from '@nestjs/common';

import { SessionStateReadService } from '../../../aim/result/session-state-read.service';

export interface EmotionalStateContext {
  readonly frustrationLevel: string;
  readonly engagementLevel: string;
}

@Injectable()
export class EmotionalStateContextAdapter {
  constructor(private readonly sessionState: SessionStateReadService) {}

  async getEmotionalStateContext(
    studentId: string,
    sessionId: string,
  ): Promise<EmotionalStateContext | null> {
    const { behavioralSignal } = await this.sessionState.getSessionState(studentId, sessionId);

    if (!behavioralSignal) {
      return null;
    }

    return {
      frustrationLevel: behavioralSignal.frustrationLevel,
      engagementLevel: behavioralSignal.engagementLevel,
    };
  }
}
