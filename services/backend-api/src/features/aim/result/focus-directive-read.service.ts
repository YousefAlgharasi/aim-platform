// P20-013 — FocusDirectiveReadService.
//
// Scope: Read-only backend service exposing the student's current active
// AI Teacher focus directive from ai_focus_directives (P20-003).
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller/adapter
//     layer). Clients cannot supply a studentId to override ownership.
//   - Read-only. directive_text is generated exclusively by
//     AimFocusDirectiveService (aim/persistence) — never here.
//   - Only active=true rows are returned — superseded directives are
//     internal history, not surfaced here.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { UsersService } from '../../users/users.service';
import { StudentProfileService } from '../../students/student-profile.service';

export interface FocusDirectiveEntry {
  readonly skillId: string;
  readonly directiveText: string;
  readonly source: string;
  readonly generatedAt: string;
}

interface FocusDirectiveRow {
  readonly skill_id: string;
  readonly directive_text: string;
  readonly source: string;
  readonly generated_at: string;
}

@Injectable()
export class FocusDirectiveReadService {
  private readonly logger = new Logger(FocusDirectiveReadService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly users: UsersService,
    private readonly studentProfiles: StudentProfileService,
  ) {}

  /**
   * Returns the student's current active focus directive, or null if none
   * exists (new student, or nothing has produced a directive yet). No AIM
   * Engine call is made — this returns only the last-persisted value.
   */
  async getActiveForStudent(studentId: string): Promise<FocusDirectiveEntry | null> {
    // ai_focus_directives.student_id is an FK to student_profiles(id), not
    // the raw Supabase Auth UID this method receives (see
    // AimFocusDirectiveService, which persists rows keyed the same way).
    const user = await this.users.findBySupabaseUid(studentId);
    const profile = user ? await this.studentProfiles.findByUserId(user.id) : null;
    if (!profile) {
      return null;
    }

    const result = await this.db.query<FocusDirectiveRow>(
      `SELECT skill_id, directive_text, source, generated_at
       FROM ai_focus_directives
       WHERE student_id = $1 AND active = true
       ORDER BY generated_at DESC
       LIMIT 1`,
      [profile.id],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    this.logger.debug('focus_directive_read', { studentId, skillId: row.skill_id });

    return {
      skillId: row.skill_id,
      directiveText: row.directive_text,
      source: row.source,
      generatedAt: row.generated_at,
    };
  }
}
