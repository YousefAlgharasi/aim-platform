/**
 * P21-012: "Today we're focusing on" recap as a distinct field.
 *
 * The AIM focus directive (`ai_focus_directives.directive_text`) already
 * silently drives the AI Teacher's behavior via `FocusDirectiveContextAdapter`
 * (Phase 20, P20-013). This service builds a short, separately-labelled
 * one-line recap from the same real directive/skill data, exposed as its
 * own `focusRecap` field on the session-start/history responses — never
 * folded into the greeting's prose, so Flutter can style it distinctly
 * (P21-020). Returns null when no active directive exists; this label is
 * never fabricated.
 */
import { Injectable } from '@nestjs/common';

import { FocusDirectiveContextAdapter } from '../context-builder/adapters/focus-directive-context.adapter';
import { SkillsService } from '../../curriculum/skills/skills.service';

@Injectable()
export class FocusRecapService {
  constructor(
    private readonly focusDirectiveContext: FocusDirectiveContextAdapter,
    private readonly skills: SkillsService,
  ) {}

  async getFocusRecap(studentId: string): Promise<string | null> {
    const directive = await this.focusDirectiveContext.getFocusDirectiveContext(studentId);

    if (!directive) {
      return null;
    }

    let skillName = directive.skillId;
    try {
      const skill = await this.skills.getSkill(directive.skillId);
      skillName = skill.title;
    } catch {
      // Stale skill id — fall back to the directive's own skillId rather
      // than fabricating a title, and still surface the recap.
    }

    return `Today we're focusing on: ${skillName}`;
  }
}
