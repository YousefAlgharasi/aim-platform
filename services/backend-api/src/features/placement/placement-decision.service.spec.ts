// P4-052: PlacementDecisionService unit tests (first-login placement gate).
//
// Coverage:
//   - should_show_gate=true when no decision, no completed attempt, no level state.
//   - should_show_gate=false when a decision was already persisted.
//   - should_show_gate=false when a completed placement attempt already exists.
//   - should_show_gate=false when a student_level_state row already exists.
//   - setDecision persists the choice and returns should_show_gate=false.
//   - setDecision rejects an invalid decision value.

import { HttpStatus } from '@nestjs/common';
import { QueryResult } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementDecisionService } from './placement-decision.service';

const STUDENT_ID = 'student-1';

function makeDb(responses: Array<{ rows: any[]; rowCount?: number }>): jest.Mocked<Pick<DatabaseService, 'query'>> {
  const query = jest.fn();
  for (const r of responses) {
    query.mockResolvedValueOnce({ rows: r.rows, rowCount: r.rowCount ?? r.rows.length } as unknown as QueryResult);
  }
  return { query };
}

describe('PlacementDecisionService', () => {
  describe('getGateStatus', () => {
    it('shows the gate when there is no decision, no completed attempt, and no level state', async () => {
      const db = makeDb([{ rows: [] }, { rows: [] }, { rows: [] }]);
      const svc = new PlacementDecisionService(db as unknown as DatabaseService);
      const result = await svc.getGateStatus(STUDENT_ID);
      expect(result).toEqual({ should_show_gate: true, decision: null });
    });

    it('does not show the gate once a decision has been persisted', async () => {
      const db = makeDb([{ rows: [{ placement_decision: 'start_from_scratch' }] }]);
      const svc = new PlacementDecisionService(db as unknown as DatabaseService);
      const result = await svc.getGateStatus(STUDENT_ID);
      expect(result).toEqual({ should_show_gate: false, decision: 'start_from_scratch' });
    });

    it('does not show the gate when a completed placement attempt already exists', async () => {
      const db = makeDb([{ rows: [] }, { rows: [{ id: 'attempt-1' }] }]);
      const svc = new PlacementDecisionService(db as unknown as DatabaseService);
      const result = await svc.getGateStatus(STUDENT_ID);
      expect(result.should_show_gate).toBe(false);
    });

    it('does not show the gate when a student_level_state row already exists', async () => {
      const db = makeDb([{ rows: [] }, { rows: [] }, { rows: [{ student_id: STUDENT_ID }] }]);
      const svc = new PlacementDecisionService(db as unknown as DatabaseService);
      const result = await svc.getGateStatus(STUDENT_ID);
      expect(result.should_show_gate).toBe(false);
    });
  });

  describe('setDecision', () => {
    it('persists take_placement and returns should_show_gate=false', async () => {
      const db = makeDb([{ rows: [{ placement_decision: 'take_placement' }] }]);
      const svc = new PlacementDecisionService(db as unknown as DatabaseService);
      const result = await svc.setDecision(STUDENT_ID, 'take_placement');
      expect(result).toEqual({ should_show_gate: false, decision: 'take_placement' });
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE student_profiles'),
        [STUDENT_ID, 'take_placement'],
      );
    });

    it('persists start_from_scratch and returns should_show_gate=false', async () => {
      const db = makeDb([{ rows: [{ placement_decision: 'start_from_scratch' }] }]);
      const svc = new PlacementDecisionService(db as unknown as DatabaseService);
      const result = await svc.setDecision(STUDENT_ID, 'start_from_scratch');
      expect(result.decision).toBe('start_from_scratch');
    });

    it('rejects an invalid decision value', async () => {
      const db = makeDb([]);
      const svc = new PlacementDecisionService(db as unknown as DatabaseService);
      await expect(svc.setDecision(STUDENT_ID, 'invalid_choice' as any)).rejects.toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
      } satisfies Partial<AppError>);
    });

    it('throws when the student profile does not exist', async () => {
      const db = makeDb([{ rows: [] }]);
      const svc = new PlacementDecisionService(db as unknown as DatabaseService);
      await expect(svc.setDecision(STUDENT_ID, 'take_placement')).rejects.toMatchObject({
        statusCode: HttpStatus.NOT_FOUND,
      } satisfies Partial<AppError>);
    });
  });
});
