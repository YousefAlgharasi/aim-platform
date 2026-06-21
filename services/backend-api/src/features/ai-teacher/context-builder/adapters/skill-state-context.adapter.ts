// P8-033: Add AIM Skill State Context
// Wraps StudentSkillStateReadService (P5-069) — exposes backend-approved,
// already-computed AIM skill state as read-only AI Teacher prompt context.
// Never recomputes mastery; never writes; AIM Engine remains sole authority.

import { Injectable } from '@nestjs/common';
import { StudentSkillStateReadService } from '../../../aim/result/student-skill-state-read.service';

export interface SkillStateContextEntry {
  readonly skillId: string;
  readonly masteryScore: number;
  readonly masteryTrend: string;
}

@Injectable()
export class SkillStateContextAdapter {
  constructor(private readonly skillStateRead: StudentSkillStateReadService) {}

  async getSkillStateContext(studentId: string): Promise<SkillStateContextEntry[] | null> {
    const { skillStates } = await this.skillStateRead.getSkillStatesForStudent(studentId);
    if (skillStates.length === 0) {
      return null;
    }
    return skillStates.map((entry) => ({
      skillId: entry.skillId,
      masteryScore: entry.masteryScore,
      masteryTrend: entry.masteryTrend,
    }));
  }
}
