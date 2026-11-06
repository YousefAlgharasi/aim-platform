import type { Band } from '../../level/bands';

export interface DailyWord {
  word: string;
  pos: string;
  en: string;
  ar: string;
  example: string;
}

/** Hand-picked words per CEFR band. The word for a day is chosen from the learner's band by the date, so it is stable all day. */
export const WORDS: Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1', DailyWord[]> = {
  A1: [
    { word: 'borrow', pos: 'verb', en: 'to take something and give it back later', ar: 'يستعير', example: 'Can I borrow your pen?' },
    { word: 'early', pos: 'adjective', en: 'before the usual or expected time', ar: 'مبكرًا', example: 'I wake up early on Sundays.' },
    { word: 'cheap', pos: 'adjective', en: 'not costing much money', ar: 'رخيص', example: 'This bag is cheap but strong.' },
    { word: 'repeat', pos: 'verb', en: 'to say or do something again', ar: 'يكرّر', example: 'Please repeat the question.' },
    { word: 'neighbour', pos: 'noun', en: 'a person who lives near you', ar: 'جار', example: 'My neighbour is very kind.' },
    { word: 'journey', pos: 'noun', en: 'a trip from one place to another', ar: 'رحلة', example: 'The journey took two hours.' },
  ],
  A2: [
    { word: 'improve', pos: 'verb', en: 'to become better, or to make something better', ar: 'يحسّن', example: 'I want to improve my English.' },
    { word: 'popular', pos: 'adjective', en: 'liked by many people', ar: 'شائع / محبوب', example: 'Football is popular in my country.' },
    { word: 'delay', pos: 'noun', en: 'a time when something happens later than planned', ar: 'تأخير', example: 'There was a delay at the airport.' },
    { word: 'comfortable', pos: 'adjective', en: 'making you feel relaxed and at ease', ar: 'مريح', example: 'This chair is very comfortable.' },
    { word: 'decide', pos: 'verb', en: 'to choose after thinking', ar: 'يقرّر', example: 'We decided to stay home.' },
    { word: 'schedule', pos: 'noun', en: 'a plan of when things will happen', ar: 'جدول زمني', example: 'My schedule is full on Monday.' },
  ],
  B1: [
    { word: 'achieve', pos: 'verb', en: 'to succeed in doing something you worked for', ar: 'يحقّق', example: 'She worked hard to achieve her goal.' },
    { word: 'reliable', pos: 'adjective', en: 'able to be trusted to do what is expected', ar: 'موثوق', example: 'He is a reliable friend.' },
    { word: 'consider', pos: 'verb', en: 'to think carefully about something', ar: 'يأخذ في الاعتبار', example: 'Consider all the options before you choose.' },
    { word: 'opportunity', pos: 'noun', en: 'a chance to do something good', ar: 'فرصة', example: 'This job is a great opportunity.' },
    { word: 'rely', pos: 'verb', en: 'to depend on someone or something', ar: 'يعتمد على', example: 'You can rely on me.' },
    { word: 'maintain', pos: 'verb', en: 'to keep something in good condition or at the same level', ar: 'يحافظ على', example: 'It is important to maintain a healthy routine.' },
  ],
  B2: [
    { word: 'elaborate', pos: 'verb', en: 'to explain something in more detail', ar: 'يسهب / يوضّح بالتفصيل', example: 'Could you elaborate on your idea?' },
    { word: 'reluctant', pos: 'adjective', en: 'not willing, and slow to act', ar: 'متردد', example: 'He was reluctant to share his plans.' },
    { word: 'crucial', pos: 'adjective', en: 'extremely important', ar: 'حاسم', example: 'Sleep is crucial for good health.' },
    { word: 'overcome', pos: 'verb', en: 'to deal with a problem and win against it', ar: 'يتغلّب على', example: 'She overcame her fear of speaking.' },
    { word: 'ambiguous', pos: 'adjective', en: 'having more than one possible meaning', ar: 'غامض', example: 'The instructions were ambiguous.' },
    { word: 'sustain', pos: 'verb', en: 'to keep something going over time', ar: 'يديم / يستمر في', example: 'It is hard to sustain this pace.' },
  ],
  C1: [
    { word: 'meticulous', pos: 'adjective', en: 'very careful about every detail', ar: 'دقيق جدًا', example: 'He is meticulous about his research.' },
    { word: 'mitigate', pos: 'verb', en: 'to make something less harmful or serious', ar: 'يخفّف', example: 'Trees help mitigate the effects of heat.' },
    { word: 'inevitable', pos: 'adjective', en: 'certain to happen and impossible to avoid', ar: 'حتمي', example: 'Change is inevitable.' },
    { word: 'scrutinize', pos: 'verb', en: 'to examine something very closely', ar: 'يدقّق في', example: 'Auditors scrutinize every report.' },
    { word: 'pragmatic', pos: 'adjective', en: 'dealing with things in a practical, realistic way', ar: 'عملي / واقعي', example: 'She took a pragmatic approach to the problem.' },
    { word: 'nuance', pos: 'noun', en: 'a small difference in meaning or feeling', ar: 'فارق دقيق', example: 'The translation missed the nuance.' },
  ],
};

/** Whole days since 1970 for a local calendar date: the same number for everyone on the same day. */
export function dayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/** The word for a day. C2 learners draw from the C1 list; no level yet draws from A2. */
export function wordOfTheDay(band: Band | null, date: Date): DailyWord {
  const key = band === null ? 'A2' : band === 'C2' ? 'C1' : band;
  const list = WORDS[key];
  return list[dayNumber(date) % list.length];
}
