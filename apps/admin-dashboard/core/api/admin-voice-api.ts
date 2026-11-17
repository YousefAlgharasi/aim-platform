import { adminApiClient } from './admin-api-client';

export type VoiceLang = 'ar' | 'en';

export type AdminVoiceSettings = {
  readonly allowedLanguages: VoiceLang[];
  readonly sttDefaultLanguage: VoiceLang;
  readonly sttMode: 'auto' | 'fixed';
  readonly ttsDefaultLanguage: VoiceLang;
  readonly ttsArModel: string | null;
  readonly ttsArVoice: string | null;
  readonly updatedAt: string | null;
};

function decode(v: unknown): AdminVoiceSettings {
  const o = (v ?? {}) as Record<string, unknown>;
  const lang = (x: unknown): VoiceLang => (x === 'ar' ? 'ar' : 'en');
  return {
    allowedLanguages: (Array.isArray(o.allowedLanguages) ? o.allowedLanguages : ['ar', 'en']).map(lang),
    sttDefaultLanguage: lang(o.sttDefaultLanguage),
    sttMode: o.sttMode === 'fixed' ? 'fixed' : 'auto',
    ttsDefaultLanguage: lang(o.ttsDefaultLanguage),
    ttsArModel: typeof o.ttsArModel === 'string' ? o.ttsArModel : null,
    ttsArVoice: typeof o.ttsArVoice === 'string' ? o.ttsArVoice : null,
    updatedAt: typeof o.updatedAt === 'string' ? o.updatedAt : null,
  };
}

export async function fetchAdminVoiceSettings(token: string): Promise<AdminVoiceSettings> {
  const env = await adminApiClient.get('/admin/voice/settings', decode, { headers: { authorization: `Bearer ${token}` } });
  return env.data;
}

export async function updateAdminVoiceSettings(
  token: string,
  body: Partial<Omit<AdminVoiceSettings, 'updatedAt'>>,
): Promise<AdminVoiceSettings> {
  const env = await adminApiClient.put('/admin/voice/settings', decode, {
    headers: { authorization: `Bearer ${token}` },
    body,
  });
  return env.data;
}
