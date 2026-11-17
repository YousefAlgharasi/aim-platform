import { apiClient } from '../../api/client';

// Student voice choice for the AI Teacher (Groq English + Arabic voices):
//   GET /student/voice-preferences          languages the admin enabled, their voices and the current choice
//   PUT /student/voice-preferences          { en?: id|null, ar?: id|null }  (null = platform default)
//   GET /student/voice-preferences/preview  ?language=&voice=  audio sample
export type VoiceGender = 'female' | 'male';
export type VoiceLang = 'en' | 'ar';

export interface VoiceOption {
  id: string;
  name: string;
  nameAr: string;
  gender: VoiceGender;
}

export interface VoiceLanguage {
  code: VoiceLang;
  voices: VoiceOption[];
  selected: string | null;
  /** Arabic speech needs the Arabic model to be set up by the admin. */
  available: boolean;
}

export const voiceApi = {
  get: () => apiClient.get<{ languages: VoiceLanguage[] }>('/student/voice-preferences'),
  save: (patch: { en?: string | null; ar?: string | null }) =>
    apiClient.put<{ en: string | null; ar: string | null }>('/student/voice-preferences', patch),
  preview: (language: VoiceLang, voice: string) =>
    apiClient.getBlob(`/student/voice-preferences/preview?language=${language}&voice=${encodeURIComponent(voice)}`),
};

export function voiceLabel(v: VoiceOption, arabic: boolean): string {
  return arabic ? v.nameAr : v.name;
}
