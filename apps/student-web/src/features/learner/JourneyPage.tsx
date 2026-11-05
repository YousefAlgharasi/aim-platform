import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/common/ErrorState';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { fetchStudentCourses, type StudentCourse } from '../curriculum/curriculumApi';
import { studyPlanApi } from './learnerApi';

const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Band = (typeof BANDS)[number];
const BAND_NAME: Record<Band, string> = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper intermediate', C1: 'Advanced', C2: 'Proficiency' };

export const bandOf = (levelCode: string | null): Band | null => {
  const m = /^([ABC][12])/i.exec(levelCode ?? '');
  return m ? (m[1].toUpperCase() as Band) : null;
};

export interface BandSummary { band: Band; courses: number; lessons: number; done: number; percent: number; state: 'done' | 'current' | 'next' }

/** Group courses into CEFR bands; the first band that is not finished is "current". */
export function summarizeBands(courses: StudentCourse[]): BandSummary[] {
  const rows = BANDS.map((band) => {
    const list = courses.filter((c) => bandOf(c.levelCode) === band);
    const lessons = list.reduce((n, c) => n + c.lessonCount, 0);
    const done = list.reduce((n, c) => n + c.completedLessonCount, 0);
    return { band, courses: list.length, lessons, done, percent: lessons ? Math.round((done / lessons) * 100) : 0 };
  }).filter((r) => r.courses > 0);
  const currentIdx = rows.findIndex((r) => r.done < r.lessons);
  return rows.map((r, i) => ({ ...r, state: currentIdx === -1 || i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'next' }));
}

export function JourneyPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<StudentCourse[] | null>(null);
  const [lessonsPerDay, setLessonsPerDay] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentCourses().then(setCourses).catch((e) => setError(getErrorMessage(e, t('Could not load your journey'))));
    studyPlanApi.get().then((r) => setLessonsPerDay(r.plan?.dailyGoalLessons ?? null)).catch(() => undefined);
  }, [t]);

  const bands = useMemo(() => (courses ? summarizeBands(courses) : []), [courses]);

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!courses) return <DetailSkeleton />;

  const current = bands.find((b) => b.state === 'current');
  const perDay = lessonsPerDay ?? 1;
  const daysLeft = current ? Math.ceil((current.lessons - current.done) / perDay) : 0;
  const weeks = Math.max(1, Math.round(daysLeft / 7));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageTitleBar title={t('My journey')} subtitle={t('From first words to fluency, level by level.')} />

      {current ? (
        <div className="hero-surface relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-secondary p-5 text-white shadow-xl shadow-brand/25 sm:p-7">
          <p className="m-0 text-sm font-bold text-on-brand">{t('You are working on')}</p>
          <p className="m-0 mt-1 text-3xl font-extrabold tracking-tight">{current.band} · {t(BAND_NAME[current.band])}</p>
          <p className="m-0 mt-2 text-sm text-on-brand">
            {t('{left} lessons left in this level. At {n} per day, that is about {weeks} weeks.', { left: current.lessons - current.done, n: perDay, weeks })}
          </p>
          {lessonsPerDay === null && (
            <p className="m-0 mt-1 text-xs text-on-brand">{t('Set your daily goal for a better estimate.')} <Link to="/onboarding" className="font-bold text-white">{t('Set plan')}</Link></p>
          )}
        </div>
      ) : (
        <div className="rounded-3xl bg-success-soft p-5 text-success-ink ring-1 ring-success-line"><p className="m-0 font-extrabold">{t('You have completed every level. Well done!')}</p></div>
      )}

      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {bands.map((b) => (
          <li key={b.band} aria-current={b.state === 'current' ? 'step' : undefined}
            className={`flex items-center gap-4 rounded-[20px] p-4 ring-1 shadow-card ${b.state === 'current' ? 'bg-brand-soft ring-brand' : 'bg-surface ring-line'} ${b.state === 'next' ? 'opacity-70' : ''}`}>
            <span className={`grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-extrabold ${b.state === 'done' ? 'bg-success text-white' : b.state === 'current' ? 'bg-gradient-to-br from-brand to-secondary text-white' : 'bg-surface-muted text-ink-muted'}`}>
              {b.state === 'done' ? '✓' : b.band}
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 flex items-baseline justify-between gap-2 font-extrabold text-ink">
                <span>{b.band} · {t(BAND_NAME[b.band])}</span>
                <span className="text-sm font-bold tabular-nums text-ink-muted">{b.percent}%</span>
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={b.percent} aria-label={`${b.band}`}>
                <div className="h-full rounded-full bg-gradient-to-r from-brand to-secondary" style={{ width: `${b.percent}%` }} />
              </div>
              <p className="m-0 mt-1.5 text-xs text-ink-muted">{t('{done} of {total} lessons', { done: b.done, total: b.lessons })}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
