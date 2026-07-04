/**
 * P21-013: "Last session" recap using real skill-state/weakness data.
 *
 * Reopen-threshold rule (documented here, not left implicit):
 *   A "last session" recap is generated when get-or-create (P21-007)
 *   creates a genuinely NEW `ai_chat_sessions` row AND a prior session for
 *   the same (studentId, contextRef) exists with status='closed' AND that
 *   prior session's `updated_at` is more than `REOPEN_THRESHOLD_MS` (1 hour)
 *   in the past.
 *
 *   Why 1 hour, and why "closed" at all: a same-session resume (the prior
 *   session is still 'active') is handled by getOrCreateForContext
 *   returning that row directly — no new row, no recap, since the student
 *   never actually left. A new row after a closed session within the last
 *   hour is far more likely to be a quick accidental close/reopen (e.g. a
 *   dropped connection, a stray back-navigation) than a genuine return
 *   after a break, so no recap fires for those either — a recap on a
 *   session the student just closed seconds ago would read as bizarre
 *   ("welcome back" a minute later). Past the 1 hour mark, it's a
 *   reasonable and simple proxy for "the student came back after a real
 *   gap", which is exactly when a recap of real progress is useful.
 *
 * Separate message vs. merged into the greeting: this is surfaced as its
 * own `lastSessionRecap` field on `StartChatSessionResult`, the same
 * pattern already used for `focusRecap` (P21-012) — NOT persisted as an
 * `ai_chat_messages` row. Reasoning: the recap is a derived, point-in-time
 * summary of AIM data, not a durable conversational turn; treating it as
 * a message would mean it lives in the permanent transcript forever (wrong
 * once the data has moved on), and duplicating the two recap mechanisms
 * (focusRecap and this) with two different persistence models would be a
 * more confusing surface for a future maintainer than one consistent
 * "extra fields alongside the session" pattern. Flutter (P21-020) renders
 * it as a distinctly-styled "Welcome back" card, same as it does for
 * focusRecap's callout — both are ephemeral, both are fields, not
 * messages.
 *
 * Never fabricates specifics: only real, current `student_skill_states`/
 * `weakness_records` values for the skill the student is currently
 * recommended to work on (the same AIM-Engine-chosen skill
 * `CurriculumSkillContextAdapter` already resolves) are used. Returns null
 * whenever there is nothing genuine to say.
 */
import { Injectable } from '@nestjs/common';

import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';
import { CurriculumSkillContextAdapter } from '../context-builder/adapters/curriculum-skill-context.adapter';
import { StudentSkillStateReadService } from '../../aim/result/student-skill-state-read.service';
import { WeaknessRecordsReadService } from '../../aim/result/weakness-records-read.service';

const REOPEN_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour — see rationale above.

@Injectable()
export class LastSessionRecapService {
  constructor(
    private readonly chatSessionRepository: AiChatSessionRepository,
    private readonly curriculumSkillContext: CurriculumSkillContextAdapter,
    private readonly skillStateRead: StudentSkillStateReadService,
    private readonly weaknessRecordsRead: WeaknessRecordsReadService,
  ) {}

  /**
   * Only ever called by ChatSessionStartService when get-or-create just
   * created a brand-new session (never on a resumed/active session).
   */
  async getRecapForNewSession(studentId: string, contextRef: string): Promise<string | null> {
    const priorSession = await this.chatSessionRepository.findMostRecentClosedForContext(
      studentId,
      contextRef,
    );

    if (!priorSession) {
      return null;
    }

    const closedAgoMs = Date.now() - new Date(priorSession.updated_at).getTime();
    if (closedAgoMs < REOPEN_THRESHOLD_MS) {
      return null;
    }

    return this.buildRecapText(studentId);
  }

  private async buildRecapText(studentId: string): Promise<string | null> {
    const skill = await this.curriculumSkillContext.getSkillContext(studentId);

    if (!skill) {
      // No AIM-Engine-chosen current skill to reference — never fabricate
      // one just to have something to say.
      return null;
    }

    const [skillStates, weaknesses] = await Promise.all([
      this.skillStateRead.getSkillStatesForStudent(studentId),
      this.weaknessRecordsRead.getWeaknessRecordsForStudent(studentId),
    ]);

    const skillState = skillStates.skillStates.find((entry) => entry.skillId === skill.skillId);
    const openWeakness = weaknesses.weaknessRecords.find(
      (entry) => entry.skillId === skill.skillId && entry.status !== 'resolved',
    );

    const parts: string[] = [`Welcome back! Last time we were working on ${skill.title}.`];

    if (skillState) {
      parts.push(`Your progress there is currently trending ${skillState.masteryTrend}.`);
    }

    if (openWeakness) {
      parts.push(`We still have an open focus area to work through together.`);
    }

    if (!skillState && !openWeakness) {
      // Skill exists but no real skill-state/weakness data yet for it —
      // still a truthful, non-fabricated recap.
      return parts[0];
    }

    return parts.join(' ');
  }
}
