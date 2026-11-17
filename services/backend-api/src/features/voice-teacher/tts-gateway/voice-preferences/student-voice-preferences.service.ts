// Per-student AI Teacher voice choice. NULL means "use the platform default" for that language.
import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../../../../database/database.service';
import { VoiceLang, isValidVoice } from './voice-catalog';

export interface StudentVoiceChoice {
  readonly en: string | null;
  readonly ar: string | null;
}

@Injectable()
export class StudentVoicePreferencesService {
  private readonly logger = new Logger(StudentVoicePreferencesService.name);

  constructor(private readonly db: DatabaseService) {}

  async get(internalStudentId: string): Promise<StudentVoiceChoice> {
    const r = await this.db.query<{ en_voice: string | null; ar_voice: string | null }>(
      `SELECT en_voice, ar_voice FROM student_voice_preferences WHERE student_id = $1`,
      [internalStudentId],
    );
    return { en: r.rows[0]?.en_voice ?? null, ar: r.rows[0]?.ar_voice ?? null };
  }

  /** Sets the voices sent in [patch]; `null` resets that language to the default. Unknown voices are rejected by the caller. */
  async set(internalStudentId: string, patch: { en?: string | null; ar?: string | null }): Promise<StudentVoiceChoice> {
    const current = await this.get(internalStudentId);
    const next: StudentVoiceChoice = {
      en: patch.en === undefined ? current.en : patch.en,
      ar: patch.ar === undefined ? current.ar : patch.ar,
    };
    await this.db.query(
      `INSERT INTO student_voice_preferences (student_id, en_voice, ar_voice, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (student_id) DO UPDATE SET en_voice = EXCLUDED.en_voice, ar_voice = EXCLUDED.ar_voice, updated_at = now()`,
      [internalStudentId, next.en, next.ar],
    );
    return next;
  }

  /**
   * The voices to speak with for a student id in any of its forms (users.id or the auth uid). Never throws:
   * on any problem the platform default voice is used, so speech always works.
   */
  async resolveForStudent(studentId: string): Promise<StudentVoiceChoice> {
    try {
      const r = await this.db.query<{ en_voice: string | null; ar_voice: string | null }>(
        `SELECT p.en_voice, p.ar_voice
           FROM users u
           JOIN student_voice_preferences p ON p.student_id = u.id
          WHERE u.id::text = $1 OR u.supabase_auth_uid::text = $1
          LIMIT 1`,
        [studentId],
      );
      const row = r.rows[0];
      return {
        en: row?.en_voice && isValidVoice('en', row.en_voice) ? row.en_voice : null,
        ar: row?.ar_voice && isValidVoice('ar', row.ar_voice) ? row.ar_voice : null,
      };
    } catch (error) {
      this.logger.warn(`voice preference lookup failed, using defaults: ${error instanceof Error ? error.message : error}`);
      return { en: null, ar: null };
    }
  }

  async getPreview(language: VoiceLang, voice: string): Promise<Buffer | null> {
    const r = await this.db.query<{ audio: Buffer }>(
      `SELECT audio FROM voice_preview_audio WHERE language = $1 AND voice = $2`,
      [language, voice],
    );
    return r.rows[0]?.audio ?? null;
  }

  async savePreview(language: VoiceLang, voice: string, audio: Buffer): Promise<void> {
    await this.db.query(
      `INSERT INTO voice_preview_audio (language, voice, audio) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [language, voice, audio],
    );
  }
}
