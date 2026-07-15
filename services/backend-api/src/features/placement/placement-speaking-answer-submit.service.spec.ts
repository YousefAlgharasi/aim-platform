// P4-052: PlacementSpeakingAnswerSubmitService unit tests.
//
// Coverage:
//   - Happy path: transcribes audio (mocked STT), grades it (mocked AI
//     provider via PlacementAiGradingService), and persists the transcript
//     as answer_value + ai_score/ai_feedback.
//   - Attempt not found / not owned -> ATTEMPT_NOT_FOUND.
//   - Attempt expired -> ATTEMPT_EXPIRED (delegated to PlacementAttemptTimerService).
//   - Question is not a speaking question -> INVALID_ANSWER_VALUE.
//   - Duplicate answer -> DUPLICATE_ANSWER.

import { HttpStatus } from '@nestjs/common';
import { QueryResult } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';
import { PlacementAuditService } from './placement-audit.service';
import { PlacementAttemptTimerService } from './placement-attempt-timer.service';
import { PlacementAiGradingService } from './placement-ai-grading.service';
import { SttGateway } from '../voice-teacher/stt-gateway/stt-gateway.interface';
import { PlacementSpeakingAnswerSubmitService } from './placement-speaking-answer-submit.service';

const ATTEMPT_ID = 'attempt-1';
const STUDENT_ID = 'student-1';
const QUESTION_ID = 'question-1';

function makeDeps(overrides?: {
  attemptRows?: any[];
  questionRows?: any[];
  duplicateRows?: any[];
  insertRows?: any[];
}) {
  const attemptRows = overrides?.attemptRows ?? [
    { id: ATTEMPT_ID, student_id: STUDENT_ID, placement_test_id: 'test-1', status: 'active', started_at: new Date().toISOString(), expires_at: null },
  ];
  const questionRows = overrides?.questionRows ?? [
    { id: QUESTION_ID, question_type: 'speaking', prompt: 'Talk about yourself.', skill_code: 'speaking' },
  ];
  const duplicateRows = overrides?.duplicateRows ?? [];
  const insertRows = overrides?.insertRows ?? [
    {
      id: 'answer-1',
      placement_attempt_id: ATTEMPT_ID,
      placement_question_id: QUESTION_ID,
      transcript: 'My name is Ali.',
      created_at: new Date().toISOString(),
    },
  ];

  const db: jest.Mocked<Pick<DatabaseService, 'query'>> = {
    query: jest
      .fn()
      .mockResolvedValueOnce({ rows: attemptRows, rowCount: attemptRows.length } as unknown as QueryResult)
      .mockResolvedValueOnce({ rows: questionRows, rowCount: questionRows.length } as unknown as QueryResult)
      .mockResolvedValueOnce({ rows: duplicateRows, rowCount: duplicateRows.length } as unknown as QueryResult)
      .mockResolvedValueOnce({ rows: insertRows, rowCount: insertRows.length } as unknown as QueryResult),
  };

  const audit: jest.Mocked<Pick<PlacementAuditService, 'logAnswerSubmitted'>> = {
    logAnswerSubmitted: jest.fn().mockResolvedValue(undefined),
  };

  const timer: jest.Mocked<Pick<PlacementAttemptTimerService, 'assertNotExpired'>> = {
    assertNotExpired: jest.fn().mockResolvedValue(undefined),
  };

  const grading: jest.Mocked<Pick<PlacementAiGradingService, 'gradeSpeaking'>> = {
    gradeSpeaking: jest.fn().mockResolvedValue({ score: 6, feedback: 'Decent fluency.' }),
  };

  const sttGateway: jest.Mocked<Pick<SttGateway, 'transcribe'>> = {
    transcribe: jest.fn().mockResolvedValue({ status: 'success', transcript: 'My name is Ali.', durationMs: 1200 }),
  };

  const svc = new PlacementSpeakingAnswerSubmitService(
    db as unknown as DatabaseService,
    audit as unknown as PlacementAuditService,
    timer as unknown as PlacementAttemptTimerService,
    grading as unknown as PlacementAiGradingService,
    sttGateway as unknown as SttGateway,
  );

  return { svc, db, audit, timer, grading, sttGateway };
}

describe('PlacementSpeakingAnswerSubmitService', () => {
  it('transcribes and AI-grades a speaking answer end-to-end', async () => {
    const { svc, sttGateway, grading, db } = makeDeps();

    const result = await svc.submitSpeakingAnswer(ATTEMPT_ID, STUDENT_ID, {
      placement_question_id: QUESTION_ID,
      audio: Buffer.from('fake-audio-bytes'),
      contentType: 'audio/webm',
    });

    expect(sttGateway.transcribe).toHaveBeenCalledWith({
      audio: expect.any(Buffer),
      contentType: 'audio/webm',
    });
    expect(grading.gradeSpeaking).toHaveBeenCalledWith('Talk about yourself.', 'My name is Ali.');
    expect(result.transcript).toBe('My name is Ali.');
    // Insert query call included the graded score/feedback.
    expect(db.query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO placement_answers'),
      expect.arrayContaining([ATTEMPT_ID, QUESTION_ID, expect.any(String), 'speaking', 6, 'Decent fluency.']),
    );
  });

  it('throws ATTEMPT_NOT_FOUND when the attempt does not belong to the student', async () => {
    const { svc } = makeDeps({ attemptRows: [] });

    await expect(
      svc.submitSpeakingAnswer(ATTEMPT_ID, STUDENT_ID, {
        placement_question_id: QUESTION_ID,
        audio: Buffer.from('x'),
        contentType: 'audio/webm',
      }),
    ).rejects.toMatchObject({
      code: PlacementErrorCode.ATTEMPT_NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND,
    } satisfies Partial<AppError>);
  });

  it('propagates ATTEMPT_EXPIRED from the timer service', async () => {
    const { svc, timer } = makeDeps();
    timer.assertNotExpired.mockRejectedValueOnce(
      new AppError({
        code: PlacementErrorCode.ATTEMPT_EXPIRED,
        message: 'expired',
        statusCode: HttpStatus.CONFLICT,
      }),
    );

    await expect(
      svc.submitSpeakingAnswer(ATTEMPT_ID, STUDENT_ID, {
        placement_question_id: QUESTION_ID,
        audio: Buffer.from('x'),
        contentType: 'audio/webm',
      }),
    ).rejects.toMatchObject({ code: PlacementErrorCode.ATTEMPT_EXPIRED });
  });

  it('throws INVALID_ANSWER_VALUE when the question is not a speaking question', async () => {
    const { svc } = makeDeps({
      questionRows: [{ id: QUESTION_ID, question_type: 'writing', prompt: 'x', skill_code: 'writing' }],
    });

    await expect(
      svc.submitSpeakingAnswer(ATTEMPT_ID, STUDENT_ID, {
        placement_question_id: QUESTION_ID,
        audio: Buffer.from('x'),
        contentType: 'audio/webm',
      }),
    ).rejects.toMatchObject({ code: PlacementErrorCode.INVALID_ANSWER_VALUE });
  });

  it('throws DUPLICATE_ANSWER when an answer already exists for this question', async () => {
    const { svc } = makeDeps({ duplicateRows: [{ id: 'existing-answer' }] });

    await expect(
      svc.submitSpeakingAnswer(ATTEMPT_ID, STUDENT_ID, {
        placement_question_id: QUESTION_ID,
        audio: Buffer.from('x'),
        contentType: 'audio/webm',
      }),
    ).rejects.toMatchObject({ code: PlacementErrorCode.DUPLICATE_ANSWER });
  });
});
