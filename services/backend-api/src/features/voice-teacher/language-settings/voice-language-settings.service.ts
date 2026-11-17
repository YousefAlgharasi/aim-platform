// Admin-controlled speech languages. Only Arabic and English can ever be enabled.
import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';

export type VoiceLanguage = 'ar' | 'en';
export const VOICE_LANGUAGES: readonly VoiceLanguage[] = ['ar', 'en'];

export interface VoiceLanguageSettings {
  allowedLanguages: VoiceLanguage[];
  sttDefaultLanguage: VoiceLanguage;
  sttMode: 'auto' | 'fixed';
  ttsDefaultLanguage: VoiceLanguage;
  ttsArModel: string | null;
  ttsArVoice: string | null;
  updatedAt: string | null;
}

const DEFAULTS: VoiceLanguageSettings = {
  allowedLanguages: ['ar', 'en'],
  sttDefaultLanguage: 'en',
  sttMode: 'auto',
  ttsDefaultLanguage: 'en',
  ttsArModel: null,
  ttsArVoice: null,
  updatedAt: null,
};
const CACHE_MS = 15_000;

interface Row {
  allowed_languages: string[];
  stt_default_language: string;
  stt_mode: string;
  tts_default_language: string;
  tts_ar_model: string | null;
  tts_ar_voice: string | null;
  updated_at: string;
}

/** "ar-SA" / "Arabic" / "arabic" -> "ar"; anything unsupported -> null. */
export function toVoiceLanguage(raw: string | null | undefined): VoiceLanguage | null {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'ar' || v.startsWith('ar-') || v === 'arabic') return 'ar';
  if (v === 'en' || v.startsWith('en-') || v === 'english') return 'en';
  return null;
}

@Injectable()
export class VoiceLanguageSettingsService {
  private readonly logger = new Logger(VoiceLanguageSettingsService.name);
  private cache: { at: number; value: VoiceLanguageSettings } | null = null;

  constructor(private readonly db: DatabaseService) {}

  async get(): Promise<VoiceLanguageSettings> {
    if (this.cache && Date.now() - this.cache.at < CACHE_MS) return this.cache.value;
    try {
      const r = await this.db.query<Row>(
        `SELECT allowed_languages, stt_default_language, stt_mode, tts_default_language,
                tts_ar_model, tts_ar_voice, updated_at
           FROM voice_language_settings WHERE id = 1`,
      );
      const row = r.rows[0];
      const value: VoiceLanguageSettings = row
        ? {
            allowedLanguages: row.allowed_languages.filter((l): l is VoiceLanguage => l === 'ar' || l === 'en'),
            sttDefaultLanguage: row.stt_default_language === 'ar' ? 'ar' : 'en',
            sttMode: row.stt_mode === 'fixed' ? 'fixed' : 'auto',
            ttsDefaultLanguage: row.tts_default_language === 'ar' ? 'ar' : 'en',
            ttsArModel: row.tts_ar_model,
            ttsArVoice: row.tts_ar_voice,
            updatedAt: String(row.updated_at),
          }
        : DEFAULTS;
      this.cache = { at: Date.now(), value };
      return value;
    } catch (error) {
      // Never break voice because the settings table is unreachable: ar+en is the safe default.
      this.logger.warn(`voice settings unavailable, using defaults: ${error instanceof Error ? error.message : error}`);
      return DEFAULTS;
    }
  }

  async update(input: Partial<Omit<VoiceLanguageSettings, 'updatedAt'>>, updatedBy: string | null): Promise<VoiceLanguageSettings> {
    const cur = await this.get();
    const next = { ...cur, ...input };
    const allowed = Array.from(new Set(next.allowedLanguages.filter((l) => VOICE_LANGUAGES.includes(l))));
    if (allowed.length === 0) throw new Error('At least one language (ar or en) must stay enabled.');
    if (!allowed.includes(next.sttDefaultLanguage)) next.sttDefaultLanguage = allowed[0];
    if (!allowed.includes(next.ttsDefaultLanguage)) next.ttsDefaultLanguage = allowed[0];
    await this.db.query(
      `UPDATE voice_language_settings
          SET allowed_languages = $1, stt_default_language = $2, stt_mode = $3, tts_default_language = $4,
              tts_ar_model = $5, tts_ar_voice = $6, updated_by = $7, updated_at = now()
        WHERE id = 1`,
      [allowed, next.sttDefaultLanguage, next.sttMode, next.ttsDefaultLanguage, next.ttsArModel || null, next.ttsArVoice || null, updatedBy],
    );
    this.cache = null;
    return this.get();
  }

  /** The language Whisper should be forced to, or null to let it detect (auto mode, both languages enabled). */
  async resolveStt(requested?: string | null): Promise<{ forced: VoiceLanguage | null; settings: VoiceLanguageSettings }> {
    const settings = await this.get();
    const req = toVoiceLanguage(requested);
    if (req && settings.allowedLanguages.includes(req)) return { forced: req, settings };
    if (settings.allowedLanguages.length === 1) return { forced: settings.allowedLanguages[0], settings };
    if (settings.sttMode === 'fixed') return { forced: settings.sttDefaultLanguage, settings };
    return { forced: null, settings };
  }

  /** Which language to speak: the requested one when enabled, else the TTS default. */
  async resolveTts(requested?: string | null): Promise<{ language: VoiceLanguage; settings: VoiceLanguageSettings }> {
    const settings = await this.get();
    const req = toVoiceLanguage(requested);
    const language = req && settings.allowedLanguages.includes(req) ? req : settings.ttsDefaultLanguage;
    return { language, settings };
  }
}
