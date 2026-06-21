// P18-025: Create AI Teacher Repository Layer
// Backend-only persistence abstraction for ai_teacher_safety_checks. Stores
// classification metadata only — never the raw triggering content.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiTeacherSafetyCheckRow } from './governance-repository.types';

export interface CreateAiTeacherSafetyCheckInput {
  readonly targetType: 'message' | 'voice_segment';
  readonly targetId: string;
  readonly category: string;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly action: 'allowed' | 'flagged' | 'blocked';
  readonly metadata?: Record<string, unknown>;
}

@Injectable()
export class AiTeacherSafetyCheckRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(input: CreateAiTeacherSafetyCheckInput): Promise<AiTeacherSafetyCheckRow> {
    const result = await this.db.query<AiTeacherSafetyCheckRow>(
      `INSERT INTO ai_teacher_safety_checks (target_type, target_id, category, severity, action, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, target_type, target_id, category, severity, action, metadata, created_at`,
      [
        input.targetType,
        input.targetId,
        input.category,
        input.severity,
        input.action,
        JSON.stringify(input.metadata ?? {}),
      ],
    );
    return result.rows[0];
  }

  async findByTarget(
    targetType: 'message' | 'voice_segment',
    targetId: string,
  ): Promise<AiTeacherSafetyCheckRow[]> {
    const result = await this.db.query<AiTeacherSafetyCheckRow>(
      `SELECT id, target_type, target_id, category, severity, action, metadata, created_at
       FROM ai_teacher_safety_checks
       WHERE target_type = $1 AND target_id = $2
       ORDER BY created_at DESC`,
      [targetType, targetId],
    );
    return result.rows;
  }
}
