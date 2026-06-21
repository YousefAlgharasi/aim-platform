// P8-026: Add Backend AI Chat Repositories
// Backend-only persistence abstraction for ai_teacher_feedback.
// student_id must be resolved by the caller from the authenticated JWT
// after validating the student owns the message's session; rating is
// advisory only and never feeds back into AIM Engine decisions.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiTeacherFeedbackRow } from './ai-chat-repository.types';

@Injectable()
export class AiTeacherFeedbackRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    messageId: string,
    studentId: string,
    rating: 'helpful' | 'not_helpful',
  ): Promise<AiTeacherFeedbackRow> {
    const result = await this.db.query<AiTeacherFeedbackRow>(
      `INSERT INTO ai_teacher_feedback (message_id, student_id, rating)
       VALUES ($1, $2, $3)
       RETURNING id, message_id, student_id, rating, created_at`,
      [messageId, studentId, rating],
    );

    return result.rows[0];
  }

  async findByMessageId(messageId: string): Promise<AiTeacherFeedbackRow | null> {
    const result = await this.db.query<AiTeacherFeedbackRow>(
      `SELECT id, message_id, student_id, rating, created_at
       FROM ai_teacher_feedback
       WHERE message_id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }

  // ---------------------------------------------------------------------
  // P18-051: Admin AI Safety Review API — flagged feedback ('not_helpful')
  // read-only listing for admins.
  // ---------------------------------------------------------------------

  async listRecentNotHelpful(limit: number): Promise<AiTeacherFeedbackRow[]> {
    const result = await this.db.query<AiTeacherFeedbackRow>(
      `SELECT id, message_id, student_id, rating, created_at
       FROM ai_teacher_feedback
       WHERE rating = 'not_helpful'
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );

    return result.rows;
  }
}
