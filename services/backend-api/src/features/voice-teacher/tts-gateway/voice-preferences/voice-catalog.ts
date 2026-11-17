// The voices students may choose from. Groq text-to-speech only offers two models, so only two languages exist:
//   English  canopylabs/orpheus-v1-english   voices: autumn diana hannah (female), austin daniel troy (male)
//   Arabic   canopylabs/orpheus-arabic-saudi voices: aisha lulwa noura (female), abdullah fahad sultan (male)
// (the voice list was confirmed with Groq's own "voice must be one of" error). Both are useful for learning English
// with Arabic support; no other Groq language is offered on purpose.

export type VoiceLang = 'en' | 'ar';
export type VoiceGender = 'female' | 'male';

export interface VoiceOption {
  readonly id: string;
  readonly name: string;
  readonly nameAr: string;
  readonly gender: VoiceGender;
}

export const VOICE_CATALOG: Readonly<Record<VoiceLang, readonly VoiceOption[]>> = {
  en: [
    { id: 'hannah', name: 'Hannah', nameAr: 'هانا', gender: 'female' },
    { id: 'autumn', name: 'Autumn', nameAr: 'أوتم', gender: 'female' },
    { id: 'diana', name: 'Diana', nameAr: 'ديانا', gender: 'female' },
    { id: 'austin', name: 'Austin', nameAr: 'أوستن', gender: 'male' },
    { id: 'daniel', name: 'Daniel', nameAr: 'دانيال', gender: 'male' },
    { id: 'troy', name: 'Troy', nameAr: 'تروي', gender: 'male' },
  ],
  ar: [
    { id: 'lulwa', name: 'Lulwa', nameAr: 'لولوة', gender: 'female' },
    { id: 'noura', name: 'Noura', nameAr: 'نورة', gender: 'female' },
    { id: 'aisha', name: 'Aisha', nameAr: 'عائشة', gender: 'female' },
    { id: 'abdullah', name: 'Abdullah', nameAr: 'عبدالله', gender: 'male' },
    { id: 'fahad', name: 'Fahad', nameAr: 'فهد', gender: 'male' },
    { id: 'sultan', name: 'Sultan', nameAr: 'سلطان', gender: 'male' },
  ],
};

export function isValidVoice(lang: VoiceLang, voice: string): boolean {
  return VOICE_CATALOG[lang].some((v) => v.id === voice);
}

/** The sentence spoken as a sample, per language. */
export const PREVIEW_TEXT: Readonly<Record<VoiceLang, string>> = {
  en: "Hi! I'm your English teacher. Let's learn together.",
  ar: 'مرحبًا! أنا معلمك. هيا نتعلم معًا.',
};
