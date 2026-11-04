// Context for a speaking-practice session (`practice:<topicId>:<attemptId>` contextRef): the
// admin-written role the AI plays in the conversation. Read-only; it carries no mastery, level,
// weakness, difficulty or recommendation value. Returns null for any other contextRef.

import { ForbiddenException, Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../../database/database.service';
import { parsePracticeContextRef } from '../../../practice/practice-context-ref';

export interface PracticeTopicContext {
  readonly topic: string;
  readonly rolePrompt: string;
  readonly timeLimitSeconds: number | null;
}

@Injectable()
export class PracticeTopicContextAdapter {
  constructor(private readonly db: DatabaseService) {}

  async getContext(studentId: string, contextRef: string): Promise<PracticeTopicContext | null> {
    const ref = parsePracticeContextRef(contextRef);
    if (!ref) return null;
    const result = await this.db.query<{ ai_prompt: string; title: string | null; time_limit_seconds: number | null }>(
      `SELECT t.ai_prompt, en.title, t.time_limit_seconds
       FROM practice_attempts a
       JOIN practice_topics t ON t.id = a.topic_id
       LEFT JOIN practice_topic_translations en ON en.topic_id = t.id AND en.locale = 'en'
       WHERE a.id = $1 AND a.topic_id = $2 AND a.student_id = $3 AND a.kind = 'speaking'`,
      [ref.attemptId, ref.topicId, studentId],
    );
    const row = result.rows[0];
    if (!row) return null;
    return { topic: row.title ?? '', rolePrompt: row.ai_prompt, timeLimitSeconds: row.time_limit_seconds };
  }

  /** A practice session may only be opened for an attempt the practice API created for this student. */
  async assertOwned(studentId: string, contextRef: string): Promise<void> {
    if (!(await this.getContext(studentId, contextRef))) {
      throw new ForbiddenException('Practice sessions can only be started from the Practice page.');
    }
  }
}
