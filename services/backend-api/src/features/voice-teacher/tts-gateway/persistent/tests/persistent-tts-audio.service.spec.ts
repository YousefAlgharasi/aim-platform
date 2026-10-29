import { AppError } from '../../../../../common/errors/app-error';
import { ApiErrorCode } from '../../../../../common/errors/api-error-code';
import { isAudioWarmupEnabled } from '../persistent-tts-audio.service';
import { buildAssetKey, buildStoragePath, normalizeScript } from '../tts-audio-key.util';
import { buildHarness, makeWav } from './fakes';

const SCRIPT = 'Man: Good morning! How are you today?\nWoman: I am fine, thank you.';
const req = (over: Record<string, unknown> = {}) => ({
  questionId: 'q-1',
  script: SCRIPT,
  languageCode: 'en',
  studentId: 'student-1',
  ...over,
});

describe('PersistentTtsAudioService', () => {
  it('generates on the first request and persists the file and its metadata', async () => {
    const h = buildHarness();
    const audio = await h.newInstance().getAudio(req());

    expect(audio?.contentType).toBe('audio/wav');
    expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    expect(h.store.objects.size).toBe(1);
    const [row] = [...h.repo.rows.values()];
    expect(row.status).toBe('ready');
    expect(row.storage_path).toBe(buildStoragePath(buildAssetKey(SCRIPT, 'en', h.config)));
    expect(Number(row.size_bytes)).toBe(h.store.objects.get(row.storage_path as string)?.length);
  });

  it('reuses the same asset for repeated requests without another TTS call', async () => {
    const h = buildHarness();
    const svc = h.newInstance();
    await svc.getAudio(req());
    await svc.getAudio(req());
    await svc.getAudio(req());
    expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    expect(h.store.putCalls).toBe(1);
  });

  it('lets different students reuse one asset', async () => {
    const h = buildHarness();
    const svc = h.newInstance();
    await svc.getAudio(req({ studentId: 'student-1' }));
    await svc.getAudio(req({ studentId: 'student-2' }));
    await h.newInstance().getAudio(req({ studentId: 'student-3' }));
    expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
  });

  it('does not put student identity into the Storage path or the TTS session id', async () => {
    const h = buildHarness();
    await h.newInstance().getAudio(req({ studentId: 'student-secret-42' }));
    expect([...h.store.objects.keys()].join()).not.toContain('student');
    expect(h.gateway.synthesize.mock.calls[0][0].sessionId).not.toContain('student');
  });

  it('survives a backend restart without regenerating existing assets', async () => {
    const h = buildHarness();
    await h.newInstance().getAudio(req());
    const restarted = h.newInstance(); // empty memory, same database and Storage
    const audio = await restarted.getAudio(req());
    expect(audio?.data.length).toBeGreaterThan(0);
    expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
  });

  describe('asset identity', () => {
    it('regenerates when the script changes, but not for cosmetic whitespace', async () => {
      const h = buildHarness();
      const svc = h.newInstance();
      await svc.getAudio(req());
      await svc.getAudio(req({ script: `  ${SCRIPT.replace(' ', '   ')}\r\n` }));
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);

      await svc.getAudio(req({ script: 'Man: A completely different line.' }));
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(2);
      expect(h.store.objects.size).toBe(2);
    });

    it('treats a different language as a distinct asset', async () => {
      const h = buildHarness();
      const svc = h.newInstance();
      await svc.getAudio(req({ languageCode: 'en' }));
      await svc.getAudio(req({ languageCode: 'ar' }));
      await svc.getAudio(req({ languageCode: 'EN ' })); // same as en
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(2);
    });

    it('treats a different voice configuration as a distinct asset', async () => {
      const h = buildHarness();
      await h.newInstance().getAudio(req());
      h.config.voice = 'noura';
      await h.newInstance().getAudio(req());
      h.config.model = 'orpheus-arabic';
      await h.newInstance().getAudio(req());
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(3);
      expect(h.store.objects.size).toBe(3);
    });

    it('shares one asset between questions that have identical scripts', async () => {
      const h = buildHarness();
      await h.newInstance().getAudio(req({ questionId: 'q-1' }));
      await h.newInstance().getAudio(req({ questionId: 'q-2' }));
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    });

    it('normalizes scripts deterministically', () => {
      expect(normalizeScript('  A  b\r\n  c\t d  ')).toBe('A b\nc d');
    });
  });

  describe('duplicate-generation prevention', () => {
    it('shares one synthesis between concurrent requests in a process', async () => {
      const h = buildHarness({ gatewayDelayMs: 50 });
      const svc = h.newInstance();
      await Promise.all([1, 2, 3, 4].map((n) => svc.getAudio(req({ studentId: `s-${n}` }))));
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    });

    it('shares one synthesis between concurrent requests on different backend instances', async () => {
      const h = buildHarness({ gatewayDelayMs: 80 });
      const results = await Promise.all([h.newInstance(), h.newInstance(), h.newInstance()].map((svc, i) => svc.getAudio(req({ studentId: `s-${i}` }))));
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
      for (const audio of results) expect(audio?.data.length).toBeGreaterThan(0);
    });

    it('takes over from an instance that died mid-generation once its lease expires', async () => {
      const h = buildHarness();
      const key = buildAssetKey(SCRIPT, 'en', h.config);
      await h.repo.claim(key, 'q-1', 'crashed-instance'); // lease held, never completed
      h.repo.expireLeases();

      const audio = await h.newInstance().getAudio(req());
      expect(audio).not.toBeNull();
      expect([...h.repo.rows.values()][0].status).toBe('ready');
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    });
  });

  describe('failures', () => {
    it('does not cache a TTS failure as a usable asset, and retries next time', async () => {
      let fail = true;
      const h = buildHarness({ failTts: () => fail });
      const svc = h.newInstance();

      expect(await svc.getAudio(req())).toBeNull();
      const [row] = [...h.repo.rows.values()];
      expect(row.status).toBe('failed');
      expect(row.storage_path).toBeNull();
      expect(h.store.objects.size).toBe(0);

      fail = false;
      expect(await svc.getAudio(req())).not.toBeNull();
      expect([...h.repo.rows.values()][0].status).toBe('ready');
    });

    it('rejects the TTS output when the gateway hands back no usable audio', async () => {
      const h = buildHarness();
      h.gateway.synthesize.mockResolvedValueOnce({ status: 'success', audioRef: 'missing-ref', durationMs: 1, contentType: 'audio/wav' });
      expect(await h.newInstance().getAudio(req())).toBeNull();
      expect([...h.repo.rows.values()][0].status).toBe('failed');
    });

    it('reports a Storage upload failure and never publishes a nonexistent asset', async () => {
      const h = buildHarness();
      h.store.failPut = true;
      const svc = h.newInstance();

      await expect(svc.getAudio(req())).rejects.toBeInstanceOf(AppError);
      const [row] = [...h.repo.rows.values()];
      expect(row.status).toBe('failed');
      expect(row.storage_path).toBeNull();
      expect(row.last_error).toBe('STORAGE_UPLOAD_FAILED');

      h.store.failPut = false;
      expect(await svc.getAudio(req())).not.toBeNull();
    });

    it('recovers from a database failure after upload by adopting the orphaned file, without another TTS call', async () => {
      const h = buildHarness();
      h.repo.failNextMarkReady = true;
      const svc = h.newInstance();

      await expect(svc.getAudio(req())).rejects.toBeInstanceOf(AppError);
      expect(h.store.objects.size).toBe(1); // orphan exists, metadata is not ready
      expect([...h.repo.rows.values()][0].status).toBe('failed');

      const audio = await svc.getAudio(req());
      expect(audio).not.toBeNull();
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
      expect(h.store.putCalls).toBe(1);
      expect([...h.repo.rows.values()][0].status).toBe('ready');
    });

    it('does not treat a Storage outage as a missing file (no needless regeneration)', async () => {
      const h = buildHarness();
      await h.newInstance().getAudio(req());
      h.store.failGet = true;
      await expect(h.newInstance().getAudio(req())).rejects.toBeInstanceOf(AppError);
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    });
  });

  describe('missing or damaged Storage objects', () => {
    it('repairs a ready asset whose file is gone', async () => {
      const h = buildHarness();
      await h.newInstance().getAudio(req());
      h.store.objects.clear();

      const audio = await h.newInstance().getAudio(req());
      expect(audio?.data.length).toBeGreaterThan(0);
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(2);
      expect(h.store.objects.size).toBe(1);
    });

    it('repairs a file whose size or format no longer matches its metadata', async () => {
      const h = buildHarness();
      await h.newInstance().getAudio(req());
      const [path] = [...h.store.objects.keys()];
      h.store.objects.set(path, Buffer.from('not audio'));

      await h.newInstance().getAudio(req());
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(2);

      h.store.objects.set(path, makeWav(9, 100)); // valid WAV but wrong size
      await h.newInstance().getAudio(req());
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(3);
    });

    it('lets only one of several concurrent instances repair a missing file', async () => {
      const h = buildHarness({ gatewayDelayMs: 50 });
      await h.newInstance().getAudio(req());
      h.store.objects.clear();
      h.gateway.synthesize.mockClear();

      await Promise.all([h.newInstance(), h.newInstance(), h.newInstance()].map((s) => s.getAudio(req())));
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    });
  });

  it('hasReadyAsset is a cheap metadata check that never downloads or generates', async () => {
    const h = buildHarness();
    const svc = h.newInstance();
    expect(await svc.hasReadyAsset(req())).toBe(false);
    await svc.getAudio(req());
    h.store.failGet = true; // would throw if it tried to download
    expect(await h.newInstance().hasReadyAsset(req())).toBe(true);
    expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
  });

  describe('getStudentAudioRef', () => {
    const studentReq = (over: Record<string, unknown> = {}) => ({ scope: 'practice-question', subjectId: 'pq-1', questionId: null, script: SCRIPT, languageCode: 'en', studentId: 'student-1', ...over });

    it('issues a reference the owner can stream and nobody else can', async () => {
      const h = buildHarness();
      const svc = h.newInstance();
      const mine = await svc.getStudentAudioRef(studentReq({ studentId: 'student-1' }));
      const theirs = await svc.getStudentAudioRef(studentReq({ studentId: 'student-2' }));

      expect(mine).not.toBe(theirs);
      expect((await h.audioStorage.retrieveAudio(mine as string, 'student-1'))?.contentType).toBe('audio/wav');
      expect(await h.audioStorage.retrieveAudio(mine as string, 'student-2')).toBeNull();
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    });

    it('is deterministic per student and content, so repeat taps do not accumulate references', async () => {
      const svc = buildHarness().newInstance();
      expect(await svc.getStudentAudioRef(studentReq())).toBe(await svc.getStudentAudioRef(studentReq()));
      expect(await svc.getStudentAudioRef(studentReq())).not.toBe(await svc.getStudentAudioRef(studentReq({ subjectId: 'pq-2' })));
    });

    it('refuses a blank student identity before doing any work', async () => {
      const h = buildHarness();
      await expect(h.newInstance().getStudentAudioRef(studentReq({ studentId: ' ' }))).rejects.toMatchObject({ code: ApiErrorCode.FORBIDDEN });
      expect(h.gateway.synthesize).not.toHaveBeenCalled();
    });

    it('returns null (nothing issued) when audio cannot be produced', async () => {
      const h = buildHarness({ failTts: () => true });
      expect(await h.newInstance().getStudentAudioRef(studentReq())).toBeNull();
    });

    it('lets content from other tables pass questionId null without any placement link', async () => {
      const h = buildHarness();
      await h.newInstance().getStudentAudioRef(studentReq({ questionId: null }));
      expect([...h.repo.rows.values()][0].question_id).toBeNull();
    });
  });

  describe('warmUp helper', () => {
    it('generates only missing assets, skips stored ones, and counts failures without stopping', async () => {
      const h = buildHarness();
      const svc = h.newInstance();
      await svc.getAudio(req({ script: 'Already stored line.' }));
      h.gateway.synthesize.mockClear();

      const tally = await svc.warmUp(
        [{ questionId: null, script: 'Already stored line.' }, { questionId: null, script: 'Brand new line.' }, { questionId: null, script: 'Brand new line.' }],
        'en',
        'warmup',
      );

      expect(tally).toEqual({ generated: 1, alreadyStored: 2, failed: 0 });
      expect(h.gateway.synthesize).toHaveBeenCalledTimes(1);
    });

    it('survives a failing item', async () => {
      const h = buildHarness({ failTts: () => true });
      expect(await h.newInstance().warmUp([{ questionId: null, script: 'x' }, { questionId: null, script: 'y' }], 'en', 'w')).toEqual({ generated: 0, alreadyStored: 0, failed: 2 });
    });

    it('is enabled in production only, and either switch can turn it off', () => {
      expect(isAudioWarmupEnabled({ NODE_ENV: 'production' })).toBe(true);
      expect(isAudioWarmupEnabled({ NODE_ENV: 'development' })).toBe(false);
      expect(isAudioWarmupEnabled({ NODE_ENV: 'production', TTS_AUDIO_WARMUP: 'false' })).toBe(false);
      expect(isAudioWarmupEnabled({ NODE_ENV: 'production', PLACEMENT_AUDIO_WARMUP: 'false' })).toBe(false);
    });
  });

  it('never runs more than 2 provider syntheses at once, however many distinct clips are requested', async () => {
    const h = buildHarness();
    let active = 0;
    let peak = 0;
    const real = h.gateway.synthesize.getMockImplementation() as (r: any) => Promise<any>;
    h.gateway.synthesize.mockImplementation(async (r: any) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 30));
      try {
        return await real(r);
      } finally {
        active -= 1;
      }
    });
    const svc = h.newInstance();
    await Promise.all(Array.from({ length: 8 }, (_, i) => svc.getAudio(req({ script: `Distinct clip number ${i}.` }))));

    expect(h.gateway.synthesize).toHaveBeenCalledTimes(8);
    expect(peak).toBeLessThanOrEqual(2);
  });
});
