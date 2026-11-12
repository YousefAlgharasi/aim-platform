import { Link } from 'react-router-dom';
import { BackButton } from '../../components/common/BackButton';
import { Banner } from '../../components/common/Banner';
import { CheckIcon } from '../../components/common/Icons';
import { buttonClasses } from '../../components/common/buttonStyles';
import { useI18n } from '../../i18n/I18nContext';
import type { Character } from './dialogue/characters';
import '../voice-teacher/voice-room.css';
import './player/player.css';

interface LessonStartProps {
  lessonId: string;
  title: string;
  /** The student character who presents this lesson's reading mode. */
  guide: Character;
  completed: boolean;
  locked: boolean;
  courseId?: string;
  onRead: () => void;
}

/**
 * What the student sees when they open a lesson: two ways to learn it.
 *  1. (main) Start the lesson with the AI teacher: a live voice conversation where the teacher talks the lesson through.
 *  2. (secondary) Read it with a student character, one card at a time, then start practice.
 */
export function LessonStart({ lessonId, title, guide, completed, locked, courseId, onRead }: LessonStartProps) {
  const { t } = useI18n();
  const liveHref = `/voice-teacher?lessonId=${encodeURIComponent(lessonId)}&lessonTitle=${encodeURIComponent(title)}`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex items-start gap-3">
        <BackButton fallback={courseId ? `/curriculum/${courseId}` : '/curriculum'} />
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 dir="auto" className="m-0 text-[1.75rem] font-semibold leading-tight text-ink [unicode-bidi:plaintext] sm:text-[2.25rem]">{title}</h1>
          {completed && (
            <span className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-success-ink">
              <CheckIcon className="size-4" /> {t('Completed')}
            </span>
          )}
        </div>
      </div>

      {locked && (
        <Banner variant="warning">
          {t('Complete the previous lesson before starting this one. You can read the content, but practice and progress are unlocked in order.')}
        </Banner>
      )}

      {/* Main: live lesson with the AI teacher */}
      <section aria-labelledby="lesson-live-title" className="flex flex-col items-center gap-5 rounded-3xl bg-brand-soft p-6 text-center ring-1 ring-brand-line sm:p-8">
        <span aria-hidden="true" className="vr-orb" data-state="speaking" style={{ ['--vr-size' as string]: '8rem' }} />
        <div className="flex flex-col gap-2">
          <h2 id="lesson-live-title" className="m-0 text-2xl font-semibold leading-snug text-ink sm:text-[1.75rem]">{t('Start the lesson with your AI teacher')}</h2>
          <p className="m-0 text-base leading-relaxed text-ink-soft">{t('Your teacher talks you through the lesson out loud. Answer by speaking or typing.')}</p>
        </div>
        <Link to={liveHref} className={`${buttonClasses('primary', 'lg')} w-full sm:w-auto sm:min-w-64`}>
          {t('Start live lesson')}
        </Link>
      </section>

      {/* Secondary: read it with a student character */}
      <button
        type="button"
        onClick={onRead}
        className="lpl-tile cursor-pointer"
      >
        <img src={guide.avatar} alt="" draggable={false} className="size-14 shrink-0 rounded-full bg-brand-soft object-cover ring-1 ring-line" />
        <span className="min-w-0 flex-1">
          <span className="lpl-display block text-xl font-medium">{t('Read it with {name}', { name: guide.name })}</span>
          <span className="mt-0.5 block text-sm text-ink-muted">{t('Go through the lesson step by step at your own pace.')}</span>
        </span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0 text-ink-muted rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}
