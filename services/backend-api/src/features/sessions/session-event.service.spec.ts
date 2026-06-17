import { HttpStatus } from '@nestjs/common';
import { SessionEventService } from './session-event.service';
import { ApiErrorCode } from '../../common/errors/api-error-code';

function makeDatabaseService(
  responses: Array<{ rowCount: number; rows: unknown[] }>,
) {
  const query = jest.fn();
  responses.forEach((response) => query.mockResolvedValueOnce(response));
  return { query };
}

const EVENT_ROW = {
  id: 'event-001',
  learning_session_id: 'session-001',
  student_id: 'student-001',
  event_type: 'item_submitted',
  item_id: 'item-001',
  response_time_ms: 1200,
  payload: {},
  occurred_at: '2026-06-17T00:00:00.000Z',
  recorded_at: '2026-06-17T00:00:01.000Z',
};

describe('SessionEventService', () => {
  describe('recordEvent', () => {
    it('throws VALIDATION_ERROR for an invalid eventType', async () => {
      const db = makeDatabaseService([]);
      const service = new SessionEventService(db as never);

      await expect(
        service.recordEvent({
          learningSessionId: 'session-001',
          studentId: 'student-001',
          eventType: 'not_a_real_event' as never,
        }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.VALIDATION_ERROR,
        statusCode: HttpStatus.BAD_REQUEST,
      });

      expect(db.query).not.toHaveBeenCalled();
    });

    it('throws VALIDATION_ERROR when payload is an array', async () => {
      const db = makeDatabaseService([]);
      const service = new SessionEventService(db as never);

      await expect(
        service.recordEvent({
          learningSessionId: 'session-001',
          studentId: 'student-001',
          eventType: 'hesitation',
          payload: [1, 2, 3] as never,
        }),
      ).rejects.toMatchObject({ code: ApiErrorCode.VALIDATION_ERROR });
    });

    it('throws VALIDATION_ERROR for a negative responseTimeMs', async () => {
      const db = makeDatabaseService([]);
      const service = new SessionEventService(db as never);

      await expect(
        service.recordEvent({
          learningSessionId: 'session-001',
          studentId: 'student-001',
          eventType: 'item_submitted',
          responseTimeMs: -5,
        }),
      ).rejects.toMatchObject({ code: ApiErrorCode.VALIDATION_ERROR });
    });

    it('throws NOT_FOUND when the session is missing, foreign, or inactive', async () => {
      const db = makeDatabaseService([{ rowCount: 0, rows: [] }]);
      const service = new SessionEventService(db as never);

      await expect(
        service.recordEvent({
          learningSessionId: 'session-999',
          studentId: 'student-001',
          eventType: 'idle_gap',
        }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });

    it('records an event and bumps last_activity_at on the owning session', async () => {
      const db = makeDatabaseService([
        { rowCount: 1, rows: [{ id: 'session-001' }] },
        { rowCount: 1, rows: [EVENT_ROW] },
        { rowCount: 1, rows: [] },
      ]);
      const service = new SessionEventService(db as never);

      const result = await service.recordEvent({
        learningSessionId: 'session-001',
        studentId: 'student-001',
        eventType: 'item_submitted',
        itemId: 'item-001',
        responseTimeMs: 1200,
        occurredAt: '2026-06-17T00:00:00.000Z',
      });

      expect(result).toEqual({
        id: 'event-001',
        eventType: 'item_submitted',
        occurredAt: '2026-06-17T00:00:00.000Z',
      });

      const insertCall = db.query.mock.calls[1];
      expect(insertCall[0]).toContain('INSERT INTO session_events');
      expect(insertCall[1]).toEqual([
        'session-001',
        'student-001',
        'item_submitted',
        'item-001',
        1200,
        '{}',
        '2026-06-17T00:00:00.000Z',
      ]);

      const updateCall = db.query.mock.calls[2];
      expect(updateCall[0]).toContain('UPDATE learning_sessions');
      expect(updateCall[1]).toEqual([
        '2026-06-17T00:00:00.000Z',
        'session-001',
      ]);
    });

    it('defaults occurredAt to now when omitted', async () => {
      const db = makeDatabaseService([
        { rowCount: 1, rows: [{ id: 'session-001' }] },
        { rowCount: 1, rows: [EVENT_ROW] },
        { rowCount: 1, rows: [] },
      ]);
      const service = new SessionEventService(db as never);

      await service.recordEvent({
        learningSessionId: 'session-001',
        studentId: 'student-001',
        eventType: 'idle_gap',
      });

      const insertCall = db.query.mock.calls[1];
      expect(typeof insertCall[1][6]).toBe('string');
      expect(() => new Date(insertCall[1][6] as string)).not.toThrow();
    });
  });
});
