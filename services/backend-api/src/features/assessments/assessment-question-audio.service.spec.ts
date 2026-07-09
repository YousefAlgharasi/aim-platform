import { AssessmentQuestionAudioService } from './assessment-question-audio.service';
import { DatabaseService } from '../../database/database.service';
import { TtsSafeFailureService } from '../voice-teacher/tts-gateway/tts-safe-failure.service';
import { AppError } from '../../common/errors/app-error';

describe('AssessmentQuestionAudioService', () => {
  const studentId = 'student-1';
  const questionId = 'q-1';

  interface Row {
    readonly id: string;
    readonly type: string;
    readonly listening_script: string | null;
  }

  const baseRow: Row = {
    id: questionId,
    type: 'listening_choice',
    listening_script: 'Listen carefully: Bat.',
  };

  function buildService(overrides: {
    /** Pass `null` explicitly to simulate no matching row (NOT_FOUND). */
    row?: Row | null;
    ttsGateway?: { synthesize: jest.Mock } | null;
  } = {}) {
    const row = 'row' in overrides ? overrides.row : baseRow;
    const db = {
      query: jest.fn().mockResolvedValue({ rows: row ? [row] : [] }),
    } as unknown as DatabaseService;

    const ttsGateway =
      overrides.ttsGateway === undefined
        ? { synthesize: jest.fn().mockResolvedValue({ status: 'success', audioRef: 'tts_abc', durationMs: 1200, contentType: 'audio/mpeg' }) }
        : overrides.ttsGateway;

    const service = new AssessmentQuestionAudioService(
      db,
      ttsGateway as any,
      new TtsSafeFailureService(),
    );

    return { service, db, ttsGateway };
  }

  it('throws NOT_FOUND when the question does not exist', async () => {
    const { service } = buildService({ row: null });
    await expect(service.ensureAudio(questionId, studentId, 'en')).rejects.toThrow(AppError);
  });

  it('throws a validation error when the question is not listening_choice', async () => {
    const { service } = buildService({ row: { ...baseRow, type: 'multiple_choice' } });
    await expect(service.ensureAudio(questionId, studentId, 'en')).rejects.toThrow(AppError);
  });

  it('returns scriptMissing: true (no TTS call) when listening_script is null — a real content gap', async () => {
    const { service, ttsGateway } = buildService({ row: { ...baseRow, listening_script: null } });

    const result = await service.ensureAudio(questionId, studentId, 'en');

    expect(result).toEqual({ audioRef: null, scriptMissing: true });
    expect((ttsGateway as any).synthesize).not.toHaveBeenCalled();
  });

  it('synthesizes audio from listening_script (never stem/correct answer) when present', async () => {
    const { service, ttsGateway } = buildService();

    const result = await service.ensureAudio(questionId, studentId, 'en');

    expect((ttsGateway as any).synthesize).toHaveBeenCalledWith(
      expect.objectContaining({ text: baseRow.listening_script, studentId }),
    );
    expect(result).toEqual({ audioRef: 'tts_abc', scriptMissing: false });
  });

  it('returns audioRef null gracefully when the TTS gateway is not bound', async () => {
    const { service } = buildService({ ttsGateway: null });

    const result = await service.ensureAudio(questionId, studentId, 'en');

    expect(result).toEqual({ audioRef: null, scriptMissing: false });
  });

  it('returns audioRef null gracefully when synthesis fails', async () => {
    const { service } = buildService({
      ttsGateway: { synthesize: jest.fn().mockResolvedValue({ status: 'error', audioRef: null, durationMs: null, contentType: null }) },
    });

    const result = await service.ensureAudio(questionId, studentId, 'en');

    expect(result).toEqual({ audioRef: null, scriptMissing: false });
  });
});
