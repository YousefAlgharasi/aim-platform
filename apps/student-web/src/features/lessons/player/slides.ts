// Pure: turns a lesson into the cards of the lesson player. Every word on a card comes from the lesson itself
// (its explanation, description and steps); nothing here writes lesson content.
import type { LessonAsset, LessonDetail } from '../lessonsApi';

export interface Example { text: string; note?: string }
export interface Mistake { wrong: string; right: string; why: string }

export type Slide =
  | { kind: 'intro' }
  | { kind: 'say'; title?: string; body: string; examples?: Example[] }
  | { kind: 'points'; title: string; points: string[] }
  | { kind: 'mistakes'; title: string; items: Mistake[] }
  | { kind: 'asset'; asset: LessonAsset }
  | { kind: 'finish' };

export interface SlideLabels { keyPoints: string; recap: string; mistakes: string }

/**
 * intro → explanation cards → the lesson's activities → finish.
 * With a written explanation: overview, each section, key points, common mistakes, recap, then every step as a card.
 * Without one: the description, then the steps in order (a text step becomes a talking card, the rest show as they are).
 */
export function buildSlides(
  lesson: Pick<LessonDetail, 'description' | 'explanation'>,
  assets: LessonAsset[],
  labels: SlideLabels,
): Slide[] {
  const slides: Slide[] = [{ kind: 'intro' }];
  const ex = lesson.explanation;
  if (ex) {
    if (ex.overview?.trim()) slides.push({ kind: 'say', body: ex.overview });
    for (const s of ex.sections ?? []) {
      if (!s.body?.trim()) continue;
      slides.push({ kind: 'say', title: s.heading, body: s.body, examples: (s.examples ?? []).filter((e) => e.text) });
    }
    if (ex.keyPoints?.length) slides.push({ kind: 'points', title: labels.keyPoints, points: ex.keyPoints });
    if (ex.commonMistakes?.length) slides.push({ kind: 'mistakes', title: labels.mistakes, items: ex.commonMistakes });
    if (ex.recap?.trim()) slides.push({ kind: 'say', title: labels.recap, body: ex.recap });
    for (const a of assets) slides.push({ kind: 'asset', asset: a });
  } else {
    if (lesson.description?.trim()) slides.push({ kind: 'say', body: lesson.description });
    for (const a of assets) {
      if (a.type === 'text') {
        if (a.description?.trim()) slides.push({ kind: 'say', title: a.title, body: a.description });
      } else {
        slides.push({ kind: 'asset', asset: a });
      }
    }
  }
  slides.push({ kind: 'finish' });
  return slides;
}
