// Pure: turns a lesson into the cards of the lesson player. Every word on a card comes from the lesson itself
// (its explanation, description and steps); nothing here writes lesson content.
import type { AssetTranslation, LessonAsset, LessonDetail, LessonExplanation } from '../lessonsApi';

/** `ar` is the Arabic supporting version of the same example/mistake, when one exists. */
export interface Example { text: string; note?: string; ar?: { text?: string; note?: string } }
export interface Mistake { wrong: string; right: string; why: string; ar?: { wrong?: string; right?: string; why?: string } }

/** Arabic supporting text for a card; every field optional. */
export interface SlideAr { title?: string; body?: string }

export type Slide =
  | { kind: 'intro'; arTitle?: string }
  | { kind: 'say'; title?: string; body: string; examples?: Example[]; ar?: SlideAr }
  | { kind: 'points'; title: string; points: string[]; arPoints?: string[] }
  | { kind: 'mistakes'; title: string; items: Mistake[] }
  | { kind: 'asset'; asset: LessonAsset; ar?: AssetTranslation }
  | { kind: 'finish' };

export interface SlideLabels { keyPoints: string; recap: string; mistakes: string }

/**
 * intro → explanation cards → the lesson's activities → finish.
 * With a written explanation: overview, each section, key points, common mistakes, recap, then every step as a card.
 * Without one: the description, then the steps in order (a text step becomes a talking card, the rest show as they are).
 */
export function buildSlides(
  lesson: Pick<LessonDetail, 'description' | 'explanation'> & Partial<Pick<LessonDetail, 'translations'>>,
  assets: LessonAsset[],
  labels: SlideLabels,
): Slide[] {
  const tr = lesson.translations?.ar;
  const slides: Slide[] = [{ kind: 'intro', arTitle: clean(tr?.title) }];
  const ex = lesson.explanation;
  const arEx = tr?.explanation ?? undefined;
  if (ex) {
    if (ex.overview?.trim()) slides.push({ kind: 'say', body: ex.overview, ar: arSay(undefined, arEx?.overview) });
    (ex.sections ?? []).forEach((s, i) => {
      if (!s.body?.trim()) return;
      const as = arEx?.sections?.[i];
      slides.push({ kind: 'say', title: s.heading, body: s.body, examples: pairExamples(s.examples, as?.examples), ar: arSay(as?.heading, as?.body) });
    });
    if (ex.keyPoints?.length) slides.push({ kind: 'points', title: labels.keyPoints, points: ex.keyPoints, arPoints: arPoints(ex, arEx) });
    if (ex.commonMistakes?.length) slides.push({ kind: 'mistakes', title: labels.mistakes, items: pairMistakes(ex, arEx) });
    if (ex.recap?.trim()) slides.push({ kind: 'say', title: labels.recap, body: ex.recap, ar: arSay(undefined, arEx?.recap) });
    for (const a of assets) slides.push({ kind: 'asset', asset: a, ar: assetAr(a, lesson.translations) });
  } else {
    if (lesson.description?.trim()) slides.push({ kind: 'say', body: lesson.description, ar: arSay(undefined, tr?.description) });
    for (const a of assets) {
      const ar = assetAr(a, lesson.translations);
      if (a.type === 'text') {
        if (a.description?.trim()) slides.push({ kind: 'say', title: a.title, body: a.description, ar: arSay(ar?.title, ar?.description) });
      } else {
        slides.push({ kind: 'asset', asset: a, ar });
      }
    }
  }
  slides.push({ kind: 'finish' });
  return slides;
}

function clean(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

function arSay(title?: string, body?: string): SlideAr | undefined {
  const ar = { title: clean(title), body: clean(body) };
  return ar.title || ar.body ? ar : undefined;
}

/** Arabic text for one asset: the asset's own translation wins over the lesson-level one. Null-safe; undefined when there is none. */
export function assetAr(asset: LessonAsset, lessonTr?: LessonDetail['translations']): AssetTranslation | undefined {
  const own = asset.translations?.ar;
  const nested = lessonTr?.ar?.assets?.[asset.id];
  const out: AssetTranslation = {
    title: clean(own?.title) ?? clean(nested?.title),
    description: clean(own?.description) ?? clean(nested?.description),
    metadata: own?.metadata ?? nested?.metadata ?? undefined,
  };
  return out.title || out.description || out.metadata ? out : undefined;
}

// Arabic items are paired with the English ones by position (the backend keeps the same shape).
function pairExamples(en: Example[] | undefined, ar: { text?: string; note?: string }[] | undefined): Example[] {
  const kept: Example[] = [];
  (en ?? []).forEach((e, i) => {
    if (!e.text) return;
    const a = ar?.[i];
    const text = clean(a?.text);
    const note = clean(a?.note);
    kept.push(text || note ? { ...e, ar: { text, note } } : e);
  });
  return kept;
}

function pairMistakes(en: LessonExplanation, ar?: LessonExplanation): Mistake[] {
  return (en.commonMistakes ?? []).map((m, i) => {
    const a = ar?.commonMistakes?.[i];
    const t = { wrong: clean(a?.wrong), right: clean(a?.right), why: clean(a?.why) };
    return t.wrong || t.right || t.why ? { ...m, ar: t } : m;
  });
}

function arPoints(en: LessonExplanation, ar?: LessonExplanation): string[] | undefined {
  if (!ar?.keyPoints?.length) return undefined;
  return en.keyPoints.map((_, i) => ar.keyPoints[i] ?? '');
}
