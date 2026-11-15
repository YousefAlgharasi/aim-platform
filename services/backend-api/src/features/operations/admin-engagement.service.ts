import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ACHIEVEMENT_RULE_LABELS, ACHIEVEMENT_RULE_TYPES, isRuleType } from '../achievements/achievement-rules';

export interface AdminAchievement {
  id: string; key: string; title: string; description: string; icon: string; category: string; isActive: boolean;
  ruleType: string | null; ruleThreshold: number | null; unlockedCount: number;
}

export const ACHIEVEMENT_CATEGORIES = ['lessons', 'streak', 'assessment', 'milestone'] as const;
const ACH_COLS = 'id, key, title, description, icon, category, is_active, rule_type, rule_threshold';
const toAchievement = (x: any, unlockedCount = 0): AdminAchievement => ({
  id: x.id, key: x.key, title: x.title, description: x.description, icon: x.icon, category: x.category,
  isActive: x.is_active, ruleType: x.rule_type ?? null, ruleThreshold: x.rule_threshold ?? null, unlockedCount,
});
export interface AdminChallenge {
  id: string; key: string; title: string; description: string; challengeType: string; targetCount: number; isActive: boolean;
}

export const CHALLENGE_TYPES = ['lessons', 'streak'] as const;

const str = (v: unknown, field: string, max: number): string => {
  if (typeof v !== 'string' || !v.trim() || v.trim().length > max) {
    throw new BadRequestException(`${field} must be a non-empty string up to ${max} characters`);
  }
  return v.trim();
};

/**
 * Admin control of the data behind the student Achievements page and Daily Challenge card.
 * Achievements and challenges are both data-driven: an achievement carries an unlock rule
 * (rule type + threshold, see achievement-rules.ts), so admins can create and edit them.
 */
@Injectable()
export class AdminEngagementService {
  private readonly logger = new Logger(AdminEngagementService.name);

  constructor(private readonly db: DatabaseService) {}

  // operations_audit_logs.resource_type is constrained to a fixed list that excludes these
  // entities, so edits are recorded in the application log until that constraint is widened.
  private audit = {
    logAction: async (actorId: string, action: string, entity: string, id: string, details: Record<string, unknown>) => {
      this.logger.log(JSON.stringify({ audit: action, actorId, entity, id, details }));
    },
  };

  ruleOptions() {
    return ACHIEVEMENT_RULE_TYPES.map((value) => ({ value, label: ACHIEVEMENT_RULE_LABELS[value] }));
  }

  async listAchievements(): Promise<AdminAchievement[]> {
    const r = await this.db.query<any>(
      `SELECT ${ACH_COLS.split(', ').map((c) => `d.${c}`).join(', ')},
              (SELECT count(*) FROM student_achievements sa WHERE sa.achievement_id = d.id)::int AS unlocked_count
         FROM achievement_definitions d ORDER BY d.created_at, d.key`,
    );
    return r.rows.map((x) => toAchievement(x, x.unlocked_count));
  }

  private rule(body: Record<string, unknown>): { type: string; threshold: number } {
    if (!isRuleType(body.ruleType)) throw new BadRequestException(`ruleType must be one of: ${ACHIEVEMENT_RULE_TYPES.join(', ')}`);
    const t = body.ruleThreshold;
    if (typeof t !== 'number' || !Number.isInteger(t) || t < 1 || t > 1_000_000) {
      throw new BadRequestException('ruleThreshold must be an integer from 1 to 1000000');
    }
    return { type: body.ruleType, threshold: t };
  }

  private category(v: unknown): string {
    if (typeof v !== 'string' || !(ACHIEVEMENT_CATEGORIES as readonly string[]).includes(v)) {
      throw new BadRequestException(`category must be one of: ${ACHIEVEMENT_CATEGORIES.join(', ')}`);
    }
    return v;
  }

  async createAchievement(body: Record<string, unknown>, adminId: string): Promise<AdminAchievement> {
    const key = str(body.key, 'key', 60);
    if (!/^[a-z0-9_]+$/.test(key)) throw new BadRequestException('key may only contain a-z, 0-9 and _');
    const rule = this.rule(body);
    try {
      const r = await this.db.query<any>(
        `INSERT INTO achievement_definitions (key, title, description, icon, category, is_active, rule_type, rule_threshold)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING ${ACH_COLS}`,
        [key, str(body.title, 'title', 80), str(body.description, 'description', 240), str(body.icon ?? 'emoji_events', 'icon', 60),
         this.category(body.category ?? 'milestone'), body.isActive !== false, rule.type, rule.threshold],
      );
      await this.audit.logAction(adminId, 'achievement.created', 'achievement_definition', r.rows[0].id, { key, rule });
      return toAchievement(r.rows[0]);
    } catch (e: any) {
      if (e?.code === '23505') throw new ConflictException(`An achievement with key '${key}' already exists`);
      throw e;
    }
  }

  async updateAchievement(id: string, body: Record<string, unknown>, adminId: string): Promise<AdminAchievement> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    const add = (col: string, v: unknown) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
    if (body.title !== undefined) add('title', str(body.title, 'title', 80));
    if (body.description !== undefined) add('description', str(body.description, 'description', 240));
    if (body.icon !== undefined) add('icon', str(body.icon, 'icon', 60));
    if (body.category !== undefined) add('category', this.category(body.category));
    if (body.ruleType !== undefined || body.ruleThreshold !== undefined) {
      const rule = this.rule(body);
      add('rule_type', rule.type);
      add('rule_threshold', rule.threshold);
    }
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') throw new BadRequestException('isActive must be a boolean');
      add('is_active', body.isActive);
    }
    if (!sets.length) throw new BadRequestException('No editable fields supplied');
    vals.push(id);
    const r = await this.db.query<any>(
      `UPDATE achievement_definitions SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING ${ACH_COLS}`,
      vals,
    );
    const x = r.rows[0];
    if (!x) throw new NotFoundException('Achievement not found');
    await this.audit.logAction(adminId, 'achievement.updated', 'achievement_definition', id, { changes: body });
    return toAchievement(x);
  }

  async listChallenges(): Promise<AdminChallenge[]> {
    const r = await this.db.query<any>(
      `SELECT id, key, title, description, challenge_type, target_count, is_active FROM daily_challenge_templates ORDER BY created_at, key`,
    );
    return r.rows.map(toChallenge);
  }

  async createChallenge(body: Record<string, unknown>, adminId: string): Promise<AdminChallenge> {
    const key = str(body.key, 'key', 60);
    if (!/^[a-z0-9_]+$/.test(key)) throw new BadRequestException('key may only contain a-z, 0-9 and _');
    const type = this.type(body.challengeType);
    const target = this.target(body.targetCount);
    try {
      const r = await this.db.query<any>(
        `INSERT INTO daily_challenge_templates (key, title, description, challenge_type, target_count, is_active)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id, key, title, description, challenge_type, target_count, is_active`,
        [key, str(body.title, 'title', 80), str(body.description, 'description', 240), type, target, body.isActive !== false],
      );
      await this.audit.logAction(adminId, 'daily_challenge.created', 'daily_challenge_template', r.rows[0].id, { key });
      return toChallenge(r.rows[0]);
    } catch (e: any) {
      if (e?.code === '23505') throw new ConflictException(`A challenge with key '${key}' already exists`);
      throw e;
    }
  }

  async updateChallenge(id: string, body: Record<string, unknown>, adminId: string): Promise<AdminChallenge> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    const add = (col: string, v: unknown) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
    if (body.title !== undefined) add('title', str(body.title, 'title', 80));
    if (body.description !== undefined) add('description', str(body.description, 'description', 240));
    if (body.challengeType !== undefined) add('challenge_type', this.type(body.challengeType));
    if (body.targetCount !== undefined) add('target_count', this.target(body.targetCount));
    if (body.isActive !== undefined) {
      if (typeof body.isActive !== 'boolean') throw new BadRequestException('isActive must be a boolean');
      add('is_active', body.isActive);
    }
    if (!sets.length) throw new BadRequestException('No editable fields supplied');
    vals.push(id);
    const r = await this.db.query<any>(
      `UPDATE daily_challenge_templates SET ${sets.join(', ')} WHERE id = $${vals.length}
       RETURNING id, key, title, description, challenge_type, target_count, is_active`,
      vals,
    );
    if (!r.rows[0]) throw new NotFoundException('Challenge not found');
    await this.audit.logAction(adminId, 'daily_challenge.updated', 'daily_challenge_template', id, { changes: body });
    return toChallenge(r.rows[0]);
  }

  private type(v: unknown): string {
    if (typeof v !== 'string' || !(CHALLENGE_TYPES as readonly string[]).includes(v)) {
      throw new BadRequestException(`challengeType must be one of: ${CHALLENGE_TYPES.join(', ')}`);
    }
    return v;
  }

  private target(v: unknown): number {
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 20) {
      throw new BadRequestException('targetCount must be an integer from 1 to 20');
    }
    return v;
  }
}

function toChallenge(x: any): AdminChallenge {
  return { id: x.id, key: x.key, title: x.title, description: x.description, challengeType: x.challenge_type, targetCount: x.target_count, isActive: x.is_active };
}
