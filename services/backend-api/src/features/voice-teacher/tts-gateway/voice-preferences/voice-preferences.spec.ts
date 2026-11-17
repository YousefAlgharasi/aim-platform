import { BadRequestException } from '@nestjs/common';
import { StudentVoicePreferencesController } from './student-voice-preferences.controller';
import { StudentVoicePreferencesService } from './student-voice-preferences.service';
import { VOICE_CATALOG, isValidVoice } from './voice-catalog';
import { TtsAudioGenerationService } from '../tts-audio-generation.service';

describe('voice catalog', () => {
  it('offers only the Groq voices, three female and three male per language', () => {
    for (const lang of ['en', 'ar'] as const) {
      expect(VOICE_CATALOG[lang]).toHaveLength(6);
      expect(VOICE_CATALOG[lang].filter((v) => v.gender === 'female')).toHaveLength(3);
      expect(VOICE_CATALOG[lang].filter((v) => v.gender === 'male')).toHaveLength(3);
    }
    expect(isValidVoice('en', 'austin')).toBe(true);
    expect(isValidVoice('en', 'lulwa')).toBe(false);
    expect(isValidVoice('ar', 'lulwa')).toBe(true);
    expect(isValidVoice('ar', 'nope')).toBe(false);
  });
});

function setup(settings = { allowedLanguages: ['en', 'ar'], ttsArModel: 'm' }) {
  const rows = new Map<string, { en: string | null; ar: string | null }>();
  const db = {
    query: jest.fn(async (sql: string, p: unknown[] = []) => {
      if (sql.includes('FROM student_voice_preferences WHERE')) {
        const r = rows.get(p[0] as string);
        return { rows: r ? [{ en_voice: r.en, ar_voice: r.ar }] : [] };
      }
      if (sql.startsWith('INSERT INTO student_voice_preferences')) {
        rows.set(p[0] as string, { en: p[1] as string | null, ar: p[2] as string | null });
        return { rows: [] };
      }
      if (sql.includes('FROM users u')) {
        const r = rows.get(p[0] as string);
        return { rows: r ? [{ en_voice: r.en, ar_voice: r.ar }] : [] };
      }
      return { rows: [] };
    }),
  };
  const prefs = new StudentVoicePreferencesService(db as never);
  const languages = { get: jest.fn().mockResolvedValue(settings) };
  const tts = { synthesizePreview: jest.fn().mockResolvedValue(Buffer.from('wav')) };
  const controller = new StudentVoicePreferencesController(prefs, languages as never, tts as unknown as TtsAudioGenerationService);
  return { controller, prefs, languages, tts, db };
}

describe('StudentVoicePreferencesController', () => {
  it('saves a valid choice and lists it back', async () => {
    const { controller } = setup();
    await controller.put('u1', { en: 'austin', ar: 'fahad' });
    const out = await controller.get('u1');
    expect(out.languages.find((l) => l.code === 'en')?.selected).toBe('austin');
    expect(out.languages.find((l) => l.code === 'ar')?.selected).toBe('fahad');
  });

  it('rejects a voice that belongs to the other language or does not exist', async () => {
    const { controller } = setup();
    await expect(controller.put('u1', { en: 'lulwa' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.put('u1', { ar: 'zzz' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('null resets a language to the default and leaves the other alone', async () => {
    const { controller } = setup();
    await controller.put('u1', { en: 'troy', ar: 'noura' });
    const out = await controller.put('u1', { en: null });
    expect(out).toEqual({ en: null, ar: 'noura' });
  });

  it('refuses a voice for a language the admin disabled and hides that language', async () => {
    const { controller } = setup({ allowedLanguages: ['en'], ttsArModel: 'm' });
    await expect(controller.put('u1', { ar: 'fahad' })).rejects.toBeInstanceOf(BadRequestException);
    expect((await controller.get('u1')).languages.map((l) => l.code)).toEqual(['en']);
  });

  it('marks Arabic unavailable when no Arabic model is configured', async () => {
    const { controller } = setup({ allowedLanguages: ['en', 'ar'], ttsArModel: null as never });
    expect((await controller.get('u1')).languages.find((l) => l.code === 'ar')?.available).toBe(false);
  });

  it('generates a preview once and then serves it from storage', async () => {
    const { controller, tts, prefs } = setup();
    const store = new Map<string, Buffer>();
    jest.spyOn(prefs, 'getPreview').mockImplementation(async (l, v) => store.get(`${l}:${v}`) ?? null);
    jest.spyOn(prefs, 'savePreview').mockImplementation(async (l, v, a) => { store.set(`${l}:${v}`, a); });
    const res = () => ({ set: jest.fn(), end: jest.fn() });
    await controller.preview('en', 'austin', res() as never);
    await controller.preview('en', 'austin', res() as never);
    expect(tts.synthesizePreview).toHaveBeenCalledTimes(1);
    await expect(controller.preview('en', 'lulwa', res() as never)).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('student voice used for speech', () => {
  it('resolveForStudent returns only valid voices and never throws', async () => {
    const good = new StudentVoicePreferencesService({ query: async () => ({ rows: [{ en_voice: 'daniel', ar_voice: 'bogus' }] }) } as never);
    expect(await good.resolveForStudent('x')).toEqual({ en: 'daniel', ar: null });
    const broken = new StudentVoicePreferencesService({ query: async () => { throw new Error('db down'); } } as never);
    expect(await broken.resolveForStudent('x')).toEqual({ en: null, ar: null });
  });
});
