import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { fetchStudentCourses, type StudentCourse } from '../curriculum/curriculumApi';
import { studyPlanApi } from './learnerApi';
import { BAND_NAME, bandOf, bandIndex, summarizeBands, type Band, type BandSummary } from '../level/bands';
import { useLearnerLevel } from '../level/LevelContext';

export { bandOf, summarizeBands, type BandSummary };

/** The course to open next: first unfinished course in the band. */
function nextCourse(courses: StudentCourse[], band: Band): StudentCourse | null {
  return courses.find((c) => bandOf(c.levelCode) === band && c.completedLessonCount < c.lessonCount) ?? null;
}

export function JourneyPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<StudentCourse[] | null>(null);
  const [lessonsPerDay, setLessonsPerDay] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError(''); setCourses(null);
    fetchStudentCourses().then(setCourses).catch((e) => setError(getErrorMessage(e, t('Could not load your journey'))));
    studyPlanApi.get().then((r) => setLessonsPerDay(r.plan?.dailyGoalLessons ?? null)).catch(() => undefined);
  }, [t]);
  useEffect(() => { load(); }, [load]);

  const { band: level } = useLearnerLevel();
  const bands = useMemo(() => {
    const rows = courses ? summarizeBands(courses) : [];
    if (!level) return rows;
    // The student's level wins over raw lesson counts: bands below it are passed, the level itself is current.
    const curIdx = rows.findIndex((r) => bandIndex(r.band) >= bandIndex(level));
    return rows.map((r, i): BandSummary => ({ ...r, state: curIdx === -1 || i < curIdx ? 'done' : i === curIdx ? 'current' : 'next' }));
  }, [courses, level]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!courses) return <DetailSkeleton />;

  const current = bands.find((b) => b.state === 'current');
  const perDay = lessonsPerDay ?? 1;
  const daysLeft = current ? Math.ceil((current.lessons - current.done) / perDay) : 0;
  const weeks = Math.max(1, Math.round(daysLeft / 7));
  const resume = current ? nextCourse(courses, current.band) : null;
  const totalLessons = bands.reduce((n, b) => n + b.lessons, 0);
  const totalDone = bands.reduce((n, b) => n + b.done, 0);
  const overall = totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageTitleBar title={t('My journey')} subtitle={t('From first words to fluency, level by level.')} />

      {current ? (
        <div className="hero-panel">
          <p className="m-0 text-sm font-bold text-on-brand">{t('You are working on')}</p>
          <p className="m-0 mt-1 text-3xl font-extrabold tracking-tight">{current.band} · {t(BAND_NAME[current.band])}</p>
          <p className="m-0 mt-2 text-sm text-on-brand">
            {t('{left} lessons left in this level. At {n} per day, that is about {weeks} weeks.', { left: current.lessons - current.done, n: perDay, weeks })}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {resume && (
              <Link to={`/curriculum/${resume.courseId}`} className="inline-flex h-12 items-center justify-center rounded-2xl hero-cta px-6 text-[15px] font-bold no-underline shadow-lg shadow-black/20 transition-all hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                {t('Continue: {course}', { course: resume.title })}
              </Link>
            )}
            <span className="text-xs font-bold text-on-brand">{t('{pct}% of the whole path', { pct: overall })}</span>
          </div>
          {lessonsPerDay === null && (
            <p className="m-0 mt-1 text-xs text-on-brand">{t('Set your daily goal for a better estimate.')} <Link to="/onboarding" className="font-bold text-white">{t('Set plan')}</Link></p>
          )}
        </div>
      ) : (
        <div className="rounded-3xl bg-success-soft p-5 text-success-ink ring-1 ring-success-line"><p className="m-0 font-extrabold">{t('You have completed every level. Well done!')}</p></div>
      )}

      <p className="m-0 text-center text-sm text-ink-muted">
        {t('Not sure about your level?')} <Link to="/placement" className="font-bold text-brand-ink">{t('Take the placement test again')}</Link>
      </p>

      {bands.length === 0 ? (
        <EmptyState title={t('Your path is empty')} message={t('Courses with a level will appear here once they are available.')} />
      ) : (
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {bands.map((b, i) => {
            const list = courses.filter((c) => bandOf(c.levelCode) === b.band);
            return (
              <li key={b.band} aria-current={b.state === 'current' ? 'step' : undefined} className="relative">
                {i < bands.length - 1 && (
                  <span aria-hidden="true" className={`absolute start-10 top-[4.25rem] -bottom-3 w-0.5 -translate-x-1/2 rtl:translate-x-1/2 ${b.state === 'done' ? 'bg-success' : 'bg-line'}`} />
                )}
                <details open={b.state === 'current'} className={`group rounded-[20px] ring-1 shadow-card ${b.state === 'current' ? 'bg-brand-soft ring-brand' : 'bg-surface ring-line'} ${b.state === 'next' ? 'opacity-80' : ''}`}>
                  <summary className="flex cursor-pointer list-none items-center gap-4 rounded-[20px] p-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&::-webkit-details-marker]:hidden">
                    <span className={`relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-extrabold ${b.state === 'done' ? 'bg-success text-white' : b.state === 'current' ? 'bg-gradient-to-br from-brand to-secondary text-white' : 'bg-surface-muted text-ink-muted'}`}>
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
                    <svg className="size-5 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                  </summary>
                  <ul className="m-0 flex list-none flex-col gap-1 px-4 pb-4 ps-[5rem]">
                    {list.map((c) => (
                      <li key={c.courseId}>
                        <Link to={`/curriculum/${c.courseId}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 no-underline transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                          <span className="min-w-0 truncate text-sm font-bold text-ink [unicode-bidi:plaintext]">{c.title}</span>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-ink-muted">
                            {c.completedLessonCount >= c.lessonCount && c.lessonCount > 0 ? '✓' : `${c.completedLessonCount}/${c.lessonCount}`}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
