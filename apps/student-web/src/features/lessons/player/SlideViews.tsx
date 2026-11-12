import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '../../../components/common/Banner';
import { Markdown } from '../../../components/common/Markdown';
import { CheckIcon, SparkleIcon } from '../../../components/common/Icons';
import { useI18n } from '../../../i18n/I18nContext';
import { plural } from '../../../i18n';
import { SelectToSave } from '../../learner/SelectToSave';
import type { Character } from '../dialogue/characters';
import type { Example, Mistake } from './slides';
import { Presenter } from './Presenter';

const H2 = 'lpl-display m-0 text-2xl font-semibold leading-tight text-ink sm:text-[1.75rem]';

/** An example sentence, shown as a card. */
export function ExampleTile({ example }: { example: Example }) {
  return (
    <div className="lpl-tile lpl-tile-static">
      <span className="min-w-0">
        <span dir="auto" className="lpl-display block text-xl font-medium leading-snug">{example.text}</span>
        {example.note && <span dir="auto" className="mt-0.5 block text-sm text-ink-muted">{example.note}</span>}
      </span>
    </div>
  );
}

interface SayProps { guide: Character; title?: string; body: string; examples?: Example[] }

export function SaySlide({ guide, title, body, examples }: SayProps) {
  return (
    <>
      <Presenter guide={guide}>
        <SelectToSave source="lesson">
          <div className="flex flex-col gap-3">
            {title && <h2 className={H2}>{title}</h2>}
            <Markdown text={body} className="text-lg leading-relaxed text-ink" />
          </div>
        </SelectToSave>
      </Presenter>
      {examples && examples.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {examples.map((e, i) => (
            <li key={i}><ExampleTile example={e} /></li>
          ))}
        </ul>
      )}
    </>
  );
}

export function PointsSlide({ guide, title, points }: { guide: Character; title: string; points: string[] }) {
  return (
    <Presenter guide={guide}>
      <SelectToSave source="lesson">
        <div className="flex flex-col gap-4">
          <h2 className={H2}>{title}</h2>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-success text-white"><CheckIcon className="size-4 text-white" /></span>
                <span dir="auto" className="text-lg leading-snug text-ink">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </SelectToSave>
    </Presenter>
  );
}

export function MistakesSlide({ guide, title, items }: { guide: Character; title: string; items: Mistake[] }) {
  const { t } = useI18n();
  return (
    <>
      <Presenter guide={guide}>
        <h2 className={H2}>{title}</h2>
      </Presenter>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((m, i) => (
          <li key={i} className="flex flex-col gap-2 rounded-2xl border-2 border-line-strong bg-surface p-4">
            <p className="m-0 flex items-start gap-2.5 text-lg text-danger-ink">
              <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-danger-soft text-sm font-bold">✕</span>
              <span dir="auto" className="[text-decoration-thickness:2px] line-through"><span className="sr-only">{t('Wrong')}: </span>{m.wrong}</span>
            </p>
            <p className="m-0 flex items-start gap-2.5 text-lg font-semibold text-success-ink">
              <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success-soft"><CheckIcon className="size-3.5 text-success-ink" /></span>
              <span dir="auto"><span className="sr-only">{t('Right')}: </span>{m.right}</span>
            </p>
            <p dir="auto" className="m-0 text-base leading-snug text-ink-muted">{m.why}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function TutorTile({ href, title, hint }: { href: string; title: string; hint?: string }) {
  return (
    <Link to={href} className="lpl-tile no-underline">
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><SparkleIcon className="size-6" /></span>
      <span className="min-w-0 flex-1">
        <span className="lpl-display block text-xl font-medium">{title}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-muted">{hint}</span>}
      </span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 text-ink-muted rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
    </Link>
  );
}

interface IntroProps { guide: Character; title: string; completed: boolean; locked: boolean; stepCount: number; minutes: number | null; xp: number }

export function IntroSlide({ guide, title, completed, locked, stepCount, minutes, xp }: IntroProps) {
  const { t } = useI18n();
  const facts = [
    plural(stepCount, { one: t('1 step'), two: t('2 steps'), few: t('{n} steps', { n: stepCount }), other: t('{n} steps', { n: stepCount }) }),
    minutes ? t('~{n} min', { n: minutes }) : null,
    xp > 0 ? t('{n} XP', { n: xp }) : null,
  ].filter(Boolean);
  return (
    <>
      <Presenter guide={guide} large>
        <div className="flex flex-col gap-3">
          <p className="lpl-display m-0 text-lg font-medium text-ink-muted">{t('Hi, I’m {name}!', { name: guide.name })}</p>
          <h1 dir="auto" className="lpl-display m-0 text-[2rem] font-semibold leading-tight text-ink [unicode-bidi:plaintext] sm:text-[2.5rem]">{title}</h1>
          {/* Steps, minutes and XP are a tablet-and-up detail; phones keep the intro short. */}
          {facts.length > 0 && <p className="m-0 text-base text-ink-muted max-sm:hidden">{facts.join(', ')}</p>}
          {completed && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-success-ink"><CheckIcon className="size-4" /> {t('Completed')}</span>
          )}
        </div>
      </Presenter>
      {locked && (
        <Banner variant="warning">
          {t('Complete the previous lesson before starting this one. You can read the content, but practice and progress are unlocked in order.')}
        </Banner>
      )}
    </>
  );
}

interface FinishProps { guide: Character; completed: boolean; tutorHref: string; children: ReactNode }

export function FinishSlide({ guide, completed, tutorHref, children }: FinishProps) {
  const { t } = useI18n();
  return (
    <>
      <Presenter guide={guide} large>
        <div className="flex flex-col gap-2">
          <h2 className={H2}>{completed ? t('Lesson mastered') : t('Ready to practice?')}</h2>
          <p className="m-0 text-lg leading-relaxed text-ink-soft">
            {completed
              ? t('Reinforce your knowledge or practice with quick exercises.')
              : t('Finish this lesson by completing its practice questions. Your answers are checked by AIM and the lesson is marked complete when you reach the end.')}
          </p>
        </div>
      </Presenter>
      <TutorTile href={tutorHref} title={t('Ask AI tutor')} />
      <div className="flex items-center justify-between gap-3">{children}</div>
    </>
  );
}
