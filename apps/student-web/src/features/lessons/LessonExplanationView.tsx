import { SelectToSave } from '../learner/SelectToSave';
import { Markdown } from '../../components/common/Markdown';
import { useI18n } from '../../i18n/I18nContext';
import type { LessonExplanation } from './lessonsApi';
import { ArMarkdown, ArText, En } from './Bilingual';
import './player/player.css';
import { SpeakableText } from './SpeakableText';

/**
 * The written teaching part of a lesson: overview, explained sections with
 * examples, key points, common mistakes and a recap. All text is authored
 * English lesson content (served by GET /curriculum/lessons/:id), so it is
 * rendered verbatim and every block lets the learner select a word to save it.
 */
export function LessonExplanationView({ explanation, arExplanation }: { explanation: LessonExplanation; arExplanation?: LessonExplanation | null }) {
  const { t } = useI18n();
  const { overview, sections, keyPoints, commonMistakes, recap } = explanation;
  const ar = arExplanation ?? undefined;

  return (
    <section aria-label={t('Lesson explanation')} className="flex flex-col gap-8">
      <SelectToSave source="lesson">
        <En as="p" className="m-0 text-lg leading-relaxed text-ink sm:text-xl">{overview}</En>
      </SelectToSave>
      <ArText text={ar?.overview} className="-mt-5 text-base sm:text-lg" />

      {sections.length > 1 && (
        <nav aria-label={t('In this lesson')} className="flex flex-wrap gap-2">
          {sections.map((s, i) => (
            <a
              key={i}
              href={`#lesson-section-${i + 1}`}
              className="rounded-full bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-soft no-underline ring-1 ring-line transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {i + 1}. <bdi lang="en" dir="ltr">{s.heading}</bdi>
            </a>
          ))}
        </nav>
      )}

      {sections.map((s, i) => (
        <article key={i} id={`lesson-section-${i + 1}`} className="flex scroll-mt-24 flex-col gap-4">
          <div className="flex items-baseline gap-3">
            <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-ink">{i + 1}</span>
            <div className="min-w-0">
              <En as="h2" className="m-0 block text-xl font-semibold tracking-tight text-ink sm:text-2xl">{s.heading}</En>
              <ArText text={ar?.sections?.[i]?.heading} className="mt-0.5 text-base" />
            </div>
          </div>
          <SelectToSave source="lesson">
            <div lang="en" dir="ltr"><Markdown text={s.body} className="text-base leading-relaxed text-ink-soft" /></div>
          </SelectToSave>
          <ArMarkdown text={ar?.sections?.[i]?.body} className="text-base leading-relaxed" />
          {s.examples && s.examples.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label={t('Examples')}>
              {s.examples.map((ex, j) => (
                <li key={j} className="rounded-xl bg-surface px-4 py-3 ring-1 ring-line">
                  <SpeakableText text={ex.text} className="block text-base font-semibold leading-loose text-ink" />
                  {ex.note && <En className="mt-0.5 block text-sm text-ink-muted">{ex.note}</En>}
                  <ArText text={ar?.sections?.[i]?.examples?.[j]?.text} as="span" className="mt-1 block text-base" />
                  <ArText text={ar?.sections?.[i]?.examples?.[j]?.note} as="span" className="mt-0.5 block text-sm text-ink-muted" />
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}

      {keyPoints.length > 0 && (
        <div className="rounded-2xl bg-brand-soft p-5 ring-1 ring-brand-line sm:p-6">
          <h2 className="m-0 text-lg font-semibold text-brand-ink">{t('Key points to remember')}</h2>
          <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
            {keyPoints.map((k, i) => (
              <li key={i} className="flex items-start gap-3 text-base leading-relaxed text-ink">
                <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
                <span className="flex min-w-0 flex-col gap-1">
                  <En>{k}</En>
                  <ArText text={ar?.keyPoints?.[i]} as="span" className="block text-base" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {commonMistakes && commonMistakes.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="m-0 text-xl font-semibold tracking-tight text-ink">{t('Common mistakes')}</h2>
          {commonMistakes.map((m, i) => (
            <div key={i} className="rounded-2xl bg-surface p-4 ring-1 ring-line sm:p-5">
              <p lang="en" dir="ltr" className="m-0 text-base text-ink-muted">
                <span className="me-2 text-sm font-bold uppercase tracking-wide text-danger-ink">{t('Not')}</span>
                <bdi className="line-through decoration-danger-ink/50">{m.wrong}</bdi>
              </p>
              <ArText text={ar?.commonMistakes?.[i]?.wrong} className="mt-0.5 text-base" />
              <p className="m-0 mt-1.5 text-base font-semibold leading-loose text-ink">
                <span className="me-2 text-sm font-bold tracking-wide text-success-ink">{t('Say')}</span>
                <SpeakableText text={m.right} />
              </p>
              <En as="p" className="m-0 mt-2 block text-sm leading-relaxed text-ink-muted">{m.why}</En>
              <ArText text={ar?.commonMistakes?.[i]?.right} className="mt-2 text-base font-semibold" />
              <ArText text={ar?.commonMistakes?.[i]?.why} className="mt-1 text-sm" />
            </div>
          ))}
        </div>
      )}

      {recap && (
        <div className="border-s-4 border-brand ps-4">
          <p lang="en" dir="ltr" className="m-0 text-base leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">{t('Quick recap')}: </strong>{recap}
          </p>
          <ArText text={ar?.recap} className="mt-2 text-base" />
        </div>
      )}
    </section>
  );
}
