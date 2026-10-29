import { PlacementQuestionAudioService } from './placement-question-audio.service';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';

describe('PlacementQuestionAudioService', () => {
  const studentId = 'student-1';
  const questionId = 'q-1';

  interface Row {
    readonly id: string;
    readonly question_type: string;
    readonly listening_script: string | null;
  }

  const baseRow: Row = {
    id: questionId,
    question_type: 'listening_choice',
    listening_script: 'Man: Good morning! How are you today?',
  };

  function buildService(overrides: { row?: Row | null; ref?: string | null } = {}) {
    const row = 'row' in overrides ? overrides.row : baseRow;
    const db = { query: jest.fn().mockResolvedValue({ rows: row ? [row] : [] }) } as unknown as DatabaseService;
    const ref = 'ref' in overrides ? overrides.ref : 'placement-question_q-1_student-1_en';
    const persistent = {
      getStudentAudioRef: jest.fn().mockResolvedValue(ref),
      warmUp: jest.fn().mockResolvedValue({ generated: 1, alreadyStored: 0, failed: 0 }),
    };
    const service = new PlacementQuestionAudioService(db, persistent as any);
    return { service, db, persistent };
  }

  it('throws NOT_FOUND when the question does not exist', async () => {
    const { service } = buildService({ row: null });
    await expect(service.ensureAudio(questionId, studentId, 'en')).rejects.toThrow(AppError);
  });

  it('throws a validation error when the question is not listening_choice', async () => {
    const { service } = buildService({ row: { ...baseRow, question_type: 'multiple_choice' } });
    await expect(service.ensureAudio(questionId, studentId, 'en')).rejects.toThrow(AppError);
  });

  it('refuses a request without a student identity', async () => {
    const { service, persistent } = buildService();
    await expect(service.ensureAudio(questionId, '  ', 'en')).rejects.toMatchObject({ code: ApiErrorCode.FORBIDDEN });
    expect(persistent.getStudentAudioRef).not.toHaveBeenCalled();
  });

  it('returns scriptMissing: true (no audio work) when listening_script is null — a real content gap', async () => {
    const { service, persistent } = buildService({ row: { ...baseRow, listening_script: null } });
    expect(await service.ensureAudio(questionId, studentId, 'en')).toEqual({ audioRef: null, scriptMissing: true });
    expect(persistent.getStudentAudioRef).not.toHaveBeenCalled();
  });

  it('asks for audio from listening_script only (never prompt/correct_answer)', async () => {
    const { service, persistent } = buildService();
    await service.ensureAudio(questionId, studentId, 'en');
    expect(persistent.getStudentAudioRef).toHaveBeenCalledWith({
      scope: 'placement-question',
      subjectId: questionId,
      questionId,
      script: baseRow.listening_script,
      languageCode: 'en',
      studentId,
    });
  });

  it('keeps the existing response contract: exactly { audioRef, scriptMissing }', async () => {
    const { service } = buildService();
    const result = await service.ensureAudio(questionId, studentId, 'en');
    expect(Object.keys(result).sort()).toEqual(['audioRef', 'scriptMissing']);
    expect(result).toEqual({ audioRef: 'placement-question_q-1_student-1_en', scriptMissing: false });
  });

  it('returns audioRef null gracefully when audio could not be produced', async () => {
    const { service } = buildService({ ref: null });
    expect(await service.ensureAudio(questionId, studentId, 'en')).toEqual({ audioRef: null, scriptMissing: false });
  });

  it('propagates a persistence failure instead of returning a reference to nothing', async () => {
    const { service, persistent } = buildService();
    persistent.getStudentAudioRef.mockRejectedValue(new AppError({ code: ApiErrorCode.SERVICE_UNAVAILABLE, message: 'x', statusCode: 503 }));
    await expect(service.ensureAudio(questionId, studentId, 'en')).rejects.toMatchObject({ code: ApiErrorCode.SERVICE_UNAVAILABLE });
  });

  describe('warm-up', () => {
    it('hands every scripted listening question to the shared warm-up', async () => {
      const { service, db, persistent } = buildService();
      (db.query as jest.Mock).mockResolvedValue({ rows: [baseRow, { ...baseRow, id: 'q-2', listening_script: 'Another line.' }] });

      await service.warmUp();

      expect(persistent.warmUp).toHaveBeenCalledWith(
        [{ questionId: 'q-1', script: baseRow.listening_script }, { questionId: 'q-2', script: 'Another line.' }],
        'en',
        'placement-warmup',
      );
    });

    it('never starts on bootstrap outside production or when disabled', () => {
      const { service } = buildService();
      const spy = jest.spyOn(service, 'warmUp').mockResolvedValue();
      const env = { ...process.env };
      process.env.NODE_ENV = 'test';
      service.onApplicationBootstrap();
      process.env.NODE_ENV = 'production';
      process.env.TTS_AUDIO_WARMUP = 'false';
      service.onApplicationBootstrap();
      expect(spy).not.toHaveBeenCalled();
      process.env = env;
    });
  });
});
