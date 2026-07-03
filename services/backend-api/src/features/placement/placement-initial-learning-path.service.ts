// Phase 4 — P4-047
// PlacementInitialLearningPathService.
//
// Scope: Initial learning path generation from placement result only.
//
// Responsibility:
//   After PlacementResultService (P4-046) creates the placement_results row,
//   this service:
//
//   1. Reads the weakness_map and estimated_level from placement_results.
//   2. Derives an ordered list of curriculum entry points per P4-034 rules:
//        a. Primary rule: follow weakness_map rank order.
//        b. Fallback rule: if weakness_map is empty, use section mastery order.
//   3. Inserts rows into the initial_learning_path table (P4-024).
//   4. Updates placement_results.initial_path_id with the UUID of the first
//      path entry (the highest-priority entry).
//
// Call sequence (within result finalisation):
//   P4-046 createResult() → P4-047 createInitialPath()
//
// Security rules:
//   - Backend-only — never called directly by Flutter or any client.
//   - skill_id, skill_key, skill_code, and source are NEVER returned to Flutter.
//   - Flutter receives only: priority, entryType, skillName, estimatedLevel
//     (via the result API, P4-048).
//   - No AIM Engine runtime, AI Teacher, lesson scheduling, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.
//
// Level mapping (placement_results.estimated_level → initial_learning_path.estimated_level):
//   beginner/elementary → A1
//   intermediate        → A2
//   upper_intermediate/advanced → B1
//   (Per P4-030 § threshold alignment — P4-031 §5 uses the 5-level set,
//    initial_learning_path stores the 3-level CEFR annotation.)

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface PlacementResultForPath {
  readonly id: string;
  readonly estimated_level: string;
  readonly weakness_map: {
    weaknesses: Array<{
      skill_code: string;
      mastery_score: number;
      priority: number;
      signal: string;
    }>;
  };
  readonly skill_mastery_map: Record<
    string,
    { total_questions: number; correct_answers: number; mastery_score: number }
  >;
}

interface PathEntryInsert {
  readonly priority: number;
  readonly entry_type: 'section' | 'skill';
  readonly skill_code: string | null;
  readonly skill_id: string | null;
  readonly skill_key: string | null;
  readonly skill_name: string;
  readonly estimated_level: 'A1' | 'A2' | 'B1';
  readonly source: 'weakness_map' | 'fallback';
}

/** Summary returned after path creation. */
export interface InitialPathCreationSummary {
  readonly resultId: string;
  readonly pathEntryCount: number;
  readonly source: 'weakness_map' | 'fallback';
}

// Canonical section display names
const SECTION_DISPLAY_NAMES: Record<string, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  reading: 'Reading',
  listening: 'Listening',
};

// Map 5-level estimated_level → 3-level CEFR annotation for initial_learning_path.
// Exported so other placement services (e.g. PlacementLevelStateService, P20-006)
// reuse the same mapping instead of redefining it.
export const LEVEL_TO_CEFR: Record<string, 'A1' | 'A2' | 'B1'> = {
  beginner: 'A1',
  elementary: 'A1',
  intermediate: 'A2',
  upper_intermediate: 'B1',
  advanced: 'B1',
};

// Section ordering used for fallback (priority of known sections)
const SECTION_ORDER = ['grammar', 'vocabulary', 'reading', 'listening'];

@Injectable()
export class PlacementInitialLearningPathService {
  private readonly logger = new Logger(PlacementInitialLearningPathService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Resolve skill_code values against the skills table by their unique `key`
   * column. Entries whose skill_code matches a real skill's key are skill-level
   * (P4-033 tiers 2/3, e.g. "grammar.past_simple.questions"); entries that don't
   * match (the four section codes: grammar/vocabulary/reading/listening) stay
   * section-level. Never guesses — only resolves what's actually in `skills`.
   */
  private async resolveSkillsByKey(
    codes: readonly string[],
  ): Promise<Map<string, { id: string; key: string }>> {
    const uniqueCodes = Array.from(new Set(codes));
    if (uniqueCodes.length === 0) return new Map();

    const result = await this.db.query<{ id: string; key: string }>(
      `SELECT id, key FROM skills WHERE key = ANY($1)`,
      [uniqueCodes],
    );

    return new Map(result.rows.map((r) => [r.key, r]));
  }

  async createInitialPath(resultId: string): Promise<InitialPathCreationSummary> {
    // -----------------------------------------------------------------------
    // 1. Fetch the placement result.
    // -----------------------------------------------------------------------
    const resultRow = await this.db.query<PlacementResultForPath>(
      `SELECT id, estimated_level, weakness_map, skill_mastery_map
       FROM placement_results
       WHERE id = $1
       LIMIT 1`,
      [resultId],
    );

    if ((resultRow.rowCount ?? 0) === 0) {
      throw new NotFoundException(`Placement result not found: ${resultId}`);
    }

    const result = resultRow.rows[0];
    const cefrLevel = LEVEL_TO_CEFR[result.estimated_level] ?? 'A1';
    const weaknesses =
      (result.weakness_map as any)?.weaknesses ?? [];

    // -----------------------------------------------------------------------
    // 2. Build path entries.
    // -----------------------------------------------------------------------
    let pathEntries: PathEntryInsert[];
    let source: 'weakness_map' | 'fallback';

    if (weaknesses.length > 0) {
      // Primary rule: follow weakness_map rank order (P4-034 §3.1)
      const skillsByKey = await this.resolveSkillsByKey(
        weaknesses.map((w: { skill_code: string }) => w.skill_code),
      );
      pathEntries = this.buildFromWeaknessMap(weaknesses, cefrLevel, skillsByKey);
      source = 'weakness_map';
    } else {
      // Fallback rule: rank by ascending mastery score (P4-034 §3.2)
      const skillsByKey = await this.resolveSkillsByKey(SECTION_ORDER);
      pathEntries = this.buildFallback(result.skill_mastery_map as any, cefrLevel, skillsByKey);
      source = 'fallback';
    }

    // -----------------------------------------------------------------------
    // 3. Deduplicate: each skill_code appears at most once; section-type
    //    entries take precedence over skill-type for the same code (P4-034 §7).
    // -----------------------------------------------------------------------
    pathEntries = this.deduplicate(pathEntries);

    if (pathEntries.length === 0) {
      // Safety fallback: always produce at least one path entry
      pathEntries = [
        {
          priority: 1,
          entry_type: 'section',
          skill_code: 'grammar',
          skill_id: null,
          skill_key: null,
          skill_name: SECTION_DISPLAY_NAMES['grammar'],
          estimated_level: cefrLevel,
          source: 'fallback',
        },
      ];
      source = 'fallback';
    }

    // -----------------------------------------------------------------------
    // 4. Bulk-insert into initial_learning_path.
    // -----------------------------------------------------------------------
    const insertedIds = await this.insertPathEntries(resultId, pathEntries);

    // -----------------------------------------------------------------------
    // 5. Update placement_results.initial_path_id with the first entry id.
    // -----------------------------------------------------------------------
    if (insertedIds.length > 0) {
      await this.db.query(
        `UPDATE placement_results
         SET initial_path_id = $1
         WHERE id = $2`,
        [insertedIds[0], resultId],
      );
    }

    this.logger.log(
      `PlacementInitialLearningPathService: result ${resultId} — ` +
        `${pathEntries.length} path entries (source: ${source}), ` +
        `initial_path_id=${insertedIds[0] ?? 'none'}`,
    );

    return {
      resultId,
      pathEntryCount: pathEntries.length,
      source,
    };
  }

  // -------------------------------------------------------------------------
  // Private: primary rule — build from weakness_map
  // -------------------------------------------------------------------------

  private buildFromWeaknessMap(
    weaknesses: Array<{
      skill_code: string;
      mastery_score: number;
      priority: number;
      signal: string;
    }>,
    cefrLevel: 'A1' | 'A2' | 'B1',
    skillsByKey: Map<string, { id: string; key: string }>,
  ): PathEntryInsert[] {
    // weakness_map mixes section-level tier-1 entries (skill_code = section code:
    // grammar/vocabulary/reading/listening) with skill-level tier-2/3 entries
    // (skill_code = a real skills.key, e.g. "grammar.past_simple.questions").
    // Resolve against skillsByKey to tell which is which — never guess.
    return weaknesses
      .sort((a, b) => a.priority - b.priority)
      .map((w, index) => {
        const matchedSkill = skillsByKey.get(w.skill_code);
        return {
          priority: index + 1,
          entry_type: matchedSkill ? ('skill' as const) : ('section' as const),
          skill_code: matchedSkill ? null : w.skill_code,
          skill_id: matchedSkill?.id ?? null,
          skill_key: matchedSkill?.key ?? null,
          skill_name: SECTION_DISPLAY_NAMES[w.skill_code] ?? w.skill_code,
          estimated_level: cefrLevel,
          source: 'weakness_map' as const,
        };
      });
  }

  // -------------------------------------------------------------------------
  // Private: fallback rule — rank by ascending mastery score
  // -------------------------------------------------------------------------

  private buildFallback(
    skillMasteryMap: Record<
      string,
      { total_questions: number; correct_answers: number; mastery_score: number }
    >,
    cefrLevel: 'A1' | 'A2' | 'B1',
    skillsByKey: Map<string, { id: string; key: string }>,
  ): PathEntryInsert[] {
    const sections = SECTION_ORDER.map((code) => ({
      skill_code: code,
      mastery_score: skillMasteryMap[code]?.mastery_score ?? 0,
    }));

    // Sort ascending by mastery score — lowest mastery = highest priority (P4-034 §3.2)
    sections.sort((a, b) => a.mastery_score - b.mastery_score);

    return sections.map((s, index) => {
      const matchedSkill = skillsByKey.get(s.skill_code);
      return {
        priority: index + 1,
        entry_type: matchedSkill ? ('skill' as const) : ('section' as const),
        skill_code: matchedSkill ? null : s.skill_code,
        skill_id: matchedSkill?.id ?? null,
        skill_key: matchedSkill?.key ?? null,
        skill_name: SECTION_DISPLAY_NAMES[s.skill_code] ?? s.skill_code,
        estimated_level: cefrLevel,
        source: 'fallback' as const,
      };
    });
  }

  // -------------------------------------------------------------------------
  // Private: deduplicate — each skill_code once at its highest priority
  // -------------------------------------------------------------------------

  private deduplicate(entries: PathEntryInsert[]): PathEntryInsert[] {
    const seen = new Set<string>();
    const result: PathEntryInsert[] = [];
    let nextPriority = 1;

    for (const entry of entries) {
      const key = entry.skill_code ?? entry.skill_key ?? `skill:${entry.skill_name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ ...entry, priority: nextPriority++ });
    }

    return result;
  }

  // -------------------------------------------------------------------------
  // Private: bulk insert and return inserted IDs in priority order
  // -------------------------------------------------------------------------

  private async insertPathEntries(
    resultId: string,
    entries: PathEntryInsert[],
  ): Promise<string[]> {
    if (entries.length === 0) return [];

    // Build parameterised VALUES list
    const values: unknown[] = [];
    const placeholders: string[] = [];
    let paramIdx = 1;

    for (const entry of entries) {
      placeholders.push(
        `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, ` +
          `$${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`,
      );
      values.push(
        resultId,
        entry.priority,
        entry.entry_type,
        entry.skill_code,
        entry.skill_id,
        entry.skill_key,
        entry.skill_name,
        entry.estimated_level,
        entry.source,
      );
    }

    const insertResult = await this.db.query<{ id: string; priority: number }>(
      `INSERT INTO initial_learning_path
         (placement_result_id, priority, entry_type, skill_code, skill_id,
          skill_key, skill_name, estimated_level, source)
       VALUES ${placeholders.join(', ')}
       RETURNING id, priority`,
      values,
    );

    // Sort by priority and return IDs
    return insertResult.rows
      .sort((a, b) => a.priority - b.priority)
      .map((r) => r.id);
  }
}
