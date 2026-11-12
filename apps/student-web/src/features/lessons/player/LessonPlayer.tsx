import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BackButton } from '../../../components/common/BackButton';
import { buttonClasses } from '../../../components/common/buttonStyles';
import { LockIcon } from '../../curriculum/CurriculumIcons';
import { LevelBadge } from '../../level/LevelBadge';
import { useI18n } from '../../../i18n/I18nContext';
import { ContentBlockRenderer } from '../ContentBlockRenderer';
import { LessonNavigation } from '../LessonNavigation';
import type { LessonPosition, LessonRouteState } from '../LessonPlayerShell';
import type { LessonAsset, LessonDetail } from '../lessonsApi';
import { pickGuide } from '../dialogue/guide';
import { FinishSlide, IntroSlide, MistakesSlide, PointsSlide, SaySlide } from './SlideViews';
import { buildSlides } from './slides';
import './player.css';

interface LessonPlayerProps {
  lesson: LessonDetail;
  assets: LessonAsset[];
  position: LessonPosition;
  completed: boolean;
  courseId?: string;
  practiceState: LessonRouteState;
  /** On the first card, the back arrow returns to the lesson's start screen instead of leaving the lesson. */
  onBackToStart?: () => void;
}

/** Round icon-only control, the same look as the app's other icon buttons (back arrow, sound toggle). */
const ICON_BTN = 'grid size-14 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink-soft ring-1 ring-line-strong transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

const stepKey = (lessonId: string) => `aim-lesson-step:${lessonId}`;

function readStep(lessonId: string, last: number): number {
  try {
    const n = Number.parseInt(sessionStorage.getItem(stepKey(lessonId)) ?? '', 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), last) : 0;
  } catch {
    return 0;
  }
}

function ArrowGlyph({ back = false }: { back?: boolean }) {
  return (
    <svg aria-hidden="true" className={`size-5 ${back ? 'rtl:rotate-180' : 'rotate-180 rtl:rotate-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
  );
}

/**
 * The lesson as a short guided walk, one card at a time (like the mainstream learning apps): a student character
 * introduces the lesson, explains it, the lesson's activities follow, and the last card starts practice.
 * Progress is shown by one bar; the bottom bar always holds the next action.
 */
export function LessonPlayer({ lesson, assets, position, completed, courseId, practiceState, onBackToStart }: LessonPlayerProps) {
  const { t } = useI18n();
  const guide = useMemo(() => pickGuide(lesson.id), [lesson.id]);
  const slides = useMemo(
    () => buildSlides(lesson, assets, { keyPoints: t('Key points'), recap: t('Recap'), mistakes: t('Common mistakes') }),
    [lesson, assets, t],
  );
  const last = slides.length - 1;
  const [index, setIndex] = useState(() => readStep(lesson.id, last));

  const slide = slides[Math.min(index, last)];

  const go = useCallback((to: number) => {
    setIndex(Math.min(Math.max(to, 0), last));
    window.scrollTo({ top: 0 });
  }, [last]);

  useEffect(() => {
    try { sessionStorage.setItem(stepKey(lesson.id), String(index)); } catch { /* a convenience only */ }
  }, [index, lesson.id]);

  // Arrow keys move between cards (mirrored in right-to-left layouts).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const rtl = document.documentElement.dir === 'rtl';
      if (e.key === 'ArrowRight') go(index + (rtl ? -1 : 1));
      if (e.key === 'ArrowLeft') go(index + (rtl ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  const totalSeconds = assets.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);
  const minutes = totalSeconds > 0 ? Math.max(1, Math.round(totalSeconds / 60)) : null;
  const percent = Math.max(4, Math.round((index / last) * 100));
  const tutorHref = `/ai-teacher?lessonId=${encodeURIComponent(lesson.id)}&lessonTitle=${encodeURIComponent(lesson.title)}`;
  const isLast = index >= last;

  let body: ReactNode;
  switch (slide.kind) {
    case 'intro':
      body = <IntroSlide guide={guide} title={lesson.title} completed={completed} locked={position.locked} stepCount={assets.length} minutes={minutes} xp={lesson.xpValue} />;
      break;
    case 'say':
      body = <SaySlide guide={guide} title={slide.title} body={slide.body} examples={slide.examples} />;
      break;
    case 'points':
      body = <PointsSlide guide={guide} title={slide.title} points={slide.points} />;
      break;
    case 'mistakes':
      body = <MistakesSlide guide={guide} title={slide.title} items={slide.items} />;
      break;
    case 'asset':
      body = <ContentBlockRenderer asset={slide.asset} stepNumber={assets.indexOf(slide.asset) + 1} />;
      break;
    default:
      body = (
        <FinishSlide guide={guide} completed={completed} tutorHref={tutorHref}>
          <LessonNavigation position={position} courseId={courseId} />
        </FinishSlide>
      );
  }

  return (
    <div className="-mb-24 flex min-h-[calc(100dvh-1.5rem)] w-full flex-col md:-mb-8 md:min-h-[calc(100dvh-5rem)]">
      <div className="flex items-center gap-3">
        <BackButton fallback={courseId ? `/curriculum/${courseId}` : '/curriculum'} onBack={index === 0 ? onBackToStart : undefined} />
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={t('Lesson progress')}
        >
          <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{ width: `${percent}%` }} />
        </div>
        <LevelBadge showName={false} />
      </div>

      <h1 className={`${slide.kind === 'intro' ? 'hidden' : 'sr-only'}`}>{lesson.title}</h1>

      <div
        key={index}
        role="group"
        aria-roledescription="slide"
        aria-label={t('Step {n} of {total}', { n: index + 1, total: slides.length })}
        className={`ix-fade-up mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pb-8 pt-6 sm:pt-10 ${slide.kind === 'intro' || slide.kind === 'finish' ? 'justify-center' : ''}`}
      >
        {body}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t-2 border-line bg-page/95 px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          {index > 0 && (
            <button type="button" onClick={() => go(index - 1)} aria-label={t('Previous')} title={t('Previous')} className={ICON_BTN}>
              <ArrowGlyph back />
            </button>
          )}
          {!isLast ? (
            <button type="button" onClick={() => go(index + 1)} className={`${buttonClasses('primary', 'lg')} flex-1`}>
              {slide.kind === 'intro' ? t('Let’s go') : t('Continue')}
            </button>
          ) : position.locked ? (
            <span className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-surface-strong px-4 text-center text-sm font-semibold text-ink-muted">
              <LockIcon className="size-4 shrink-0" />{t('Practice unlocks after the previous lesson')}
            </span>
          ) : (
            <Link to={`/practice/lesson/${lesson.id}`} state={practiceState} className={`${buttonClasses('primary', 'lg')} flex-1 !h-auto min-h-14 !whitespace-normal py-2 text-center leading-tight`}>
              {completed ? t('Practice again') : t('Start practice to complete lesson')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
