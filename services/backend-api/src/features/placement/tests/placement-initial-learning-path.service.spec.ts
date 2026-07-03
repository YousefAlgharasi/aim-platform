// P20-004: Regression test for the always-NULL skill_id bug.
// PlacementInitialLearningPathService.createInitialPath() must resolve a real
// skill_id (and entry_type: 'skill') whenever a weakness_map/skill_mastery_map
// code matches a real skills.key, and must only write skill_id: null for
// entries that are genuinely section-level (entry_type: 'section').

import { PlacementInitialLearningPathService } from '../placement-initial-learning-path.service';
import { DatabaseService } from '../../../database/database.service';

const RESULT_ID = 'aaaaaaaa-0000-0000-0000-000000000001';
const SKILL_ID = 'bbbbbbbb-0000-0000-0000-000000000002';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: any[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

describe('PlacementInitialLearningPathService.createInitialPath', () => {
  it('resolves a real skill_id and entry_type "skill" for weakness_map entries that match a skills.key', async () => {
    const insertedValues: unknown[][] = [];

    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('FROM placement_results')) {
        return {
          rows: [
            {
              id: RESULT_ID,
              estimated_level: 'intermediate',
              weakness_map: {
                weaknesses: [
                  { skill_code: 'grammar.past_simple.questions', mastery_score: 0.3, priority: 1, signal: 'emerging' },
                  { skill_code: 'grammar', mastery_score: 0.5, priority: 2, signal: 'emerging' },
                ],
              },
              skill_mastery_map: {},
            },
          ],
          rowCount: 1,
        };
      }
      if (sql.includes('FROM skills')) {
        expect(params[0]).toEqual(['grammar.past_simple.questions', 'grammar']);
        return {
          rows: [{ id: SKILL_ID, key: 'grammar.past_simple.questions' }],
          rowCount: 1,
        };
      }
      if (sql.includes('INSERT INTO initial_learning_path')) {
        insertedValues.push([...params]);
        return { rows: [{ id: 'entry-1', priority: 1 }, { id: 'entry-2', priority: 2 }], rowCount: 2 };
      }
      if (sql.includes('UPDATE placement_results')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const service = new PlacementInitialLearningPathService(db);
    const summary = await service.createInitialPath(RESULT_ID);

    expect(summary.source).toBe('weakness_map');
    expect(summary.pathEntryCount).toBe(2);

    // Flattened INSERT params: (result_id, priority, entry_type, skill_code, skill_id,
    //   skill_key, skill_name, estimated_level, source) per row, in insertion order.
    const [values] = insertedValues;
    const [
      ,
      ,
      entryType1,
      skillCode1,
      skillId1,
      skillKey1,
      ,
      ,
      ,
      ,
      ,
      entryType2,
      skillCode2,
      skillId2,
      skillKey2,
    ] = values;

    expect(entryType1).toBe('skill');
    expect(skillCode1).toBeNull();
    expect(skillId1).toBe(SKILL_ID);
    expect(skillKey1).toBe('grammar.past_simple.questions');

    expect(entryType2).toBe('section');
    expect(skillCode2).toBe('grammar');
    expect(skillId2).toBeNull();
    expect(skillKey2).toBeNull();
  });
});
