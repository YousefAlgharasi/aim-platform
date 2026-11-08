// SkillTitlesService.
//
// Scope: read-only catalogue of skill key → readable title, so the app shows "Short Vowel Sounds"
// instead of the raw key "en.a1.pho.short_vowels". Titles only: no mastery, no student data.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface SkillTitle {
  readonly key: string;
  readonly title: string;
}

@Injectable()
export class SkillTitlesService {
  constructor(private readonly db: DatabaseService) {}

  async list(): Promise<SkillTitle[]> {
    const result = await this.db.query<SkillTitle>(
      `SELECT key, title FROM skills WHERE status = 'published' ORDER BY key ASC`,
    );
    return result.rows;
  }
}
