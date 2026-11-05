import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { buttonClasses } from '../../components/common/buttonStyles';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { SparkleIcon } from '../../components/common/Icons';
import { Skeleton } from '../../components/common/Skeleton';
import { publicApi, type PublicCourse } from '../learner/learnerApi';

const STEPS = [
  { title: 'Take a short placement test', body: 'Find your level in about 15 minutes, so you start where it makes sense.' },
  { title: 'Follow lessons built for your level', body: 'Short lessons with listening, practice and quizzes, one step after another.' },
  { title: 'Practice speaking and writing', body: 'Talk to the AI Teacher any time and get feedback on what you write.' },
];
const BANDS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Public front door: what the platform is, what it teaches, and how to start. No account needed to read it. */
export function LandingPage() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<PublicCourse[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    publicApi.catalog(locale).then((r) => alive && setCourses(r.courses)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [locale]);

  const perBand = useMemo(() => BANDS.map((b) => {
    const list = (courses ?? []).filter((c) => c.cefrCode?.toUpperCase().startsWith(b));
    return { band: b, courses: list.length, lessons: list.reduce((n, c) => n + c.lessonCount, 0) };
  }).filter((b) => b.courses > 0), [courses]);
  const totalLessons = (courses ?? []).reduce((n, c) => n + c.lessonCount, 0);

  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <span className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-secondary text-white shadow-md shadow-brand/20"><SparkleIcon className="size-[18px] text-white" /></span>
          <span className="bg-gradient-to-r from-brand to-secondary bg-clip-text text-2xl font-black tracking-tight text-transparent">AIM</span>
        </span>
        <nav className="flex items-center gap-2" aria-label={t('Account')}>
          <LanguageSwitcher />
          <Link to="/login" className={buttonClasses('ghost', 'sm')}>{t('Log in')}</Link>
          <Link to="/register" className={`${buttonClasses('primary', 'sm')} hidden sm:inline-flex`}>{t('Create account')}</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pt-14">
          <div className="hero-surface relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand to-secondary p-7 text-white shadow-2xl shadow-brand/30 sm:p-12">
            <h1 className="m-0 max-w-2xl text-[32px] font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
              {t('Learn English one small step a day.')}
            </h1>
            <p className="m-0 mt-4 max-w-xl text-base leading-relaxed text-on-brand sm:text-lg">
              {t('Lessons for every level from beginner to advanced, an AI teacher you can talk to any time, and practice that fits into your day.')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-base font-bold text-brand no-underline shadow-lg shadow-black/20 transition-all hover:-translate-y-px hover:shadow-xl active:scale-[0.98]">
                {t('Start learning free')}
              </Link>
              <Link to="/login" className="inline-flex h-14 items-center justify-center rounded-2xl bg-black/20 px-8 text-base font-bold text-white no-underline ring-1 ring-white/30 transition-colors hover:bg-white/20">
                {t('I already have an account')}
              </Link>
            </div>
            {courses && courses.length > 0 && (
              <p className="m-0 mt-6 text-sm font-semibold text-on-brand tabular-nums">
                {t('{courses} courses · {lessons} lessons', { courses: courses.length, lessons: totalLessons })}
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6" aria-labelledby="how-h">
          <h2 id="how-h" className="m-0 text-2xl font-extrabold tracking-tight">{t('How it works')}</h2>
          <ol className="mt-5 grid list-none gap-3 p-0 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-[20px] bg-surface p-5 shadow-card ring-1 ring-line">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-sm font-extrabold text-brand-ink">{i + 1}</span>
                <h3 className="m-0 mt-3 text-base font-extrabold">{t(s.title)}</h3>
                <p className="m-0 mt-1 text-sm leading-relaxed text-ink-muted">{t(s.body)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6" aria-labelledby="levels-h">
          <h2 id="levels-h" className="m-0 text-2xl font-extrabold tracking-tight">{t('What you can learn')}</h2>
          <p className="m-0 mt-1 text-sm text-ink-muted">{t('Levels follow the international A1 to C2 scale.')}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses === null && !failed && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[20px]" />)}
            {perBand.map((b) => (
              <div key={b.band} className="flex items-center gap-4 rounded-[20px] bg-surface p-4 shadow-card ring-1 ring-line">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-secondary text-sm font-extrabold text-white">{b.band}</span>
                <div>
                  <p className="m-0 font-extrabold">{t('{n} courses', { n: b.courses })}</p>
                  <p className="m-0 text-sm text-ink-muted tabular-nums">{t('{n} lessons', { n: b.lessons })}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 rounded-[2rem] bg-surface p-6 shadow-card ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="m-0 text-xl font-extrabold tracking-tight">{t('Ready to find your level?')}</h2>
              <p className="m-0 mt-1 text-sm text-ink-muted">{t('Create an account and take the placement test. It is free to start.')}</p>
            </div>
            <Link to="/register" className={buttonClasses('primary', 'lg')}>{t('Create account')}</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
