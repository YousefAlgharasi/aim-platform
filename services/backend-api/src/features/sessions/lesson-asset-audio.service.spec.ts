import { LessonAssetAudioService } from './lesson-asset-audio.service';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';

describe('LessonAssetAudioService', () => {
  const studentId = 'student-1';
  const id = 'item-1';
  const baseRow: any = { id: 'item-1', type: 'audio', status: 'published', metadata: { script: 'Listen carefully: Bat.' } };

  function buildService(overrides: { row?: unknown; ref?: string | null } = {}) {
    const row = 'row' in overrides ? overrides.row : baseRow;
    const db = { query: jest.fn().mockResolvedValue({ rows: row ? [row] : [] }) } as unknown as DatabaseService;
    const ref = 'ref' in overrides ? overrides.ref : 'lesson-asset_item-1_student-1_en';
    const persistent = {
      getStudentAudioRef: jest.fn().mockResolvedValue(ref),
      warmUp: jest.fn().mockResolvedValue({ generated: 0, alreadyStored: 0, failed: 0 }),
    };
    return { service: new LessonAssetAudioService(db, persistent as any), db, persistent };
  }

  it('throws NOT_FOUND when the item does not exist', async () => {
    const { service } = buildService({ row: null });
    await expect(service.ensureAudio(id, studentId, 'en')).rejects.toThrow(AppError);
  });

  it('treats an unpublished asset as not found', async () => {
    const { service } = buildService({ row: { ...baseRow, status: 'draft' } });
    await expect(service.ensureAudio(id, studentId, 'en')).rejects.toThrow(AppError);
  });

  it('throws a validation error when the item has no listening audio', async () => {
    const { service } = buildService({ row: { ...baseRow, type: 'image' } });
    await expect(service.ensureAudio(id, studentId, 'en')).rejects.toThrow(AppError);
  });

  it('returns scriptMissing: true (no audio work) when no script is authored — a real content gap', async () => {
    const { service, persistent } = buildService({ row: { ...baseRow, metadata: { script: '  ' } } });
    expect(await service.ensureAudio(id, studentId, 'en')).toEqual({ audioRef: null, scriptMissing: true });
    expect(persistent.getStudentAudioRef).not.toHaveBeenCalled();
  });

  it('asks for audio from the authored script only, with no link to placement questions', async () => {
    const { service, persistent } = buildService();
    await service.ensureAudio(id, studentId, 'en');
    expect(persistent.getStudentAudioRef).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'lesson-asset', subjectId: id, questionId: null, script: 'Listen carefully: Bat.', languageCode: 'en', studentId }),
    );
  });

  it('keeps the existing response contract: exactly { audioRef, scriptMissing }', async () => {
    const { service } = buildService();
    const result = await service.ensureAudio(id, studentId, 'en');
    expect(Object.keys(result).sort()).toEqual(['audioRef', 'scriptMissing']);
    expect(result).toEqual({ audioRef: 'lesson-asset_item-1_student-1_en', scriptMissing: false });
  });

  it('returns audioRef null gracefully when audio could not be produced', async () => {
    const { service } = buildService({ ref: null });
    expect(await service.ensureAudio(id, studentId, 'en')).toEqual({ audioRef: null, scriptMissing: false });
  });

  it('propagates a persistence failure instead of returning a reference to nothing', async () => {
    const { service, persistent } = buildService();
    persistent.getStudentAudioRef.mockRejectedValue(new AppError({ code: ApiErrorCode.SERVICE_UNAVAILABLE, message: 'x', statusCode: 503 }));
    await expect(service.ensureAudio(id, studentId, 'en')).rejects.toMatchObject({ code: ApiErrorCode.SERVICE_UNAVAILABLE });
  });

  it('warm-up hands scripts to the shared helper with null placement ids', async () => {
    const { service, db, persistent } = buildService();
    (db.query as jest.Mock).mockResolvedValue({ rows: [baseRow] });
    await service.warmUp();
    expect(persistent.warmUp).toHaveBeenCalledWith([{ questionId: null, script: 'Listen carefully: Bat.' }], 'en', 'lesson-warmup');
  });

  it('does not start warm-up outside production', () => {
    const { service } = buildService();
    const spy = jest.spyOn(service, 'warmUp').mockResolvedValue();
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    service.onApplicationBootstrap();
    process.env.NODE_ENV = env;
    expect(spy).not.toHaveBeenCalled();
  });
});
