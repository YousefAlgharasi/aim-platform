import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { ThemeToggleButton } from '../../components/common/ThemeToggleButton';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { SparkleIcon, MicIcon, PencilIcon, FlameIcon, TrophyIcon } from '../../components/common/Icons';
import { Skeleton } from '../../components/common/Skeleton';
import { publicApi, type PublicCourse } from '../learner/learnerApi';
import './landing.css';

const STEPS = [
  { title: 'Take a short placement test', body: 'Find your level in about 15 minutes, so you start where it makes sense.' },
  { title: 'Follow lessons built for your level', body: 'Short lessons with listening, practice and quizzes, one step after another.' },
  { title: 'Practice speaking and writing', body: 'Talk to the AI Teacher any time and get feedback on what you write.' },
];

const BANDS = [
  { code: 'A1', name: 'Beginner', body: 'First words, greetings and everyday phrases.' },
  { code: 'A2', name: 'Elementary', body: 'Simple conversations about daily life.' },
  { code: 'B1', name: 'Intermediate', body: 'Handle travel, work and opinions with confidence.' },
  { code: 'B2', name: 'Upper intermediate', body: 'Follow complex ideas and speak fluently.' },
  { code: 'C1', name: 'Advanced', body: 'Express yourself precisely in study and work.' },
  { code: 'C2', name: 'Proficient', body: 'Near-native understanding and control.' },
];

const FEATURES = [
  { icon: <MicIcon className="size-5" />, title: 'Talk to an AI Teacher', body: 'Speak or type any time. Get corrections and better ways to say it.' },
  { icon: <PencilIcon className="size-5" />, title: 'Writing feedback', body: 'Write a few lines and see exactly what to fix and why.' },
  { icon: <FlameIcon className="size-5" />, title: 'Daily streaks', body: 'A small daily goal keeps the habit going, even on busy days.' },
  { icon: <TrophyIcon className="size-5" />, title: 'Certificates', body: 'Finish a course and keep proof of your level.' },
];

/** Sample corrections for the hero. Made-up learner sentences, not real user data. Tokens flagged `true` are the fixed words. */
type Tok = [text: string, fixed?: boolean];
const EXAMPLES: Array<{ wrong: Tok[]; right: Tok[]; note: string }> = [
  { wrong: [['I'], ['go', true], ['to'], ['market', true]], right: [['I'], ['went', true], ['to'], ['the market', true]], note: 'Past simple, and the market needs “the”.' },
  { wrong: [['She'], ['don’t', true], ['like'], ['coffee']], right: [['She'], ['doesn’t', true], ['like'], ['coffee']], note: 'After he, she and it, use “doesn’t”.' },
  { wrong: [['I'], ['am', true], ['agree'], ['with you']], right: [['I'], ['agree'], ['with you']], note: 'Agree is already a verb, so drop “am”.' },
];

const NAV: Array<[id: string, label: string]> = [['how', 'How it works'], ['levels', 'Levels'], ['features', 'Features']];

const wrap = 'mx-auto w-full max-w-7xl px-5 sm:px-8';
const rule = 'border-t border-line';

function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-5 shrink-0 rtl:-scale-x-100 ${className}`}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Public front door: what AIM is, what it teaches, and how to start. No account needed to read it. */
export function LandingPage() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<PublicCourse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [band, setBand] = useState('A1');
  const [ex, setEx] = useState(0);
  const [section, setSection] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Menu: Escape closes it (focus returns to the button); it also closes if the window grows to the desktop layout.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); menuBtn.current?.focus(); } };
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => { if (mq.matches) setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => { document.removeEventListener('keydown', onKey); mq.removeEventListener('change', onMq); };
  }, [menuOpen]);

  // Which section is being read, for the nav underline.
  useEffect(() => {
    const els = NAV.map(([id]) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (els.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setSection(e.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    els.forEach((el) => io.observe(el));
    const onScroll = () => { if (window.scrollY < 300) setSection(''); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    let alive = true;
    publicApi.catalog(locale).then((r) => alive && setCourses(r.courses)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [locale]);

  const perBand = useMemo(() => BANDS.map((b) => {
    const list = (courses ?? []).filter((c) => c.cefrCode?.toUpperCase().startsWith(b.code));
    return { ...b, list, lessons: list.reduce((n, c) => n + c.lessonCount, 0) };
  }), [courses]);

  const available = perBand.filter((b) => b.list.length > 0);
  // Keep the open level on one that has courses once the catalog arrives.
  useEffect(() => {
    if (available.length > 0 && !available.some((b) => b.code === band)) setBand(available[0].code);
  }, [available, band]);

  const totalLessons = (courses ?? []).reduce((n, c) => n + c.lessonCount, 0);

  if (!loading && user) return <Navigate to="/" replace />;

  const example = EXAMPLES[ex];
  const renderTokens = (toks: Tok[], kind: 'wrong' | 'right') => {
    let i = -1;
    return toks.map(([text, fixed], k) => {
      if (fixed) i += 1;
      const style = { ['--i' as string]: i } as CSSProperties;
      const sep = k < toks.length - 1 ? ' ' : '';
      if (!fixed) return <span key={k}>{text}{sep}</span>;
      return kind === 'wrong'
        ? <span key={k}><del className="lp-strike" style={style}>{text}</del>{sep}</span>
        : <span key={k}><ins className="lp-fix" style={style}>{text}</ins>{sep}</span>;
    });
  };

  const sectionHead = (id: string, title: string, sub?: string) => (
    <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
      <h2 id={id} className="lp-h2 m-0 text-[1.9rem] font-semibold sm:text-[2.6rem] rtl:text-2xl rtl:sm:text-3xl">{title}</h2>
      {sub && <p className="m-0 mt-4 max-w-xs text-base leading-relaxed text-ink-muted">{sub}</p>}
    </div>
  );

  return (
    <div className="lp min-h-screen overflow-x-clip bg-page text-ink">
      {/* ── Header: wordmark, section links on the content column, account actions ─ */}
      <header className="sticky top-0 z-30 border-b border-line bg-page/90 backdrop-blur-md">
        <div className={`${wrap} grid h-16 grid-cols-[1fr_auto] items-center gap-x-6 lg:grid-cols-[1fr_auto_1fr]`}>
          <Link to="/welcome" className="text-[22px] font-bold leading-none tracking-tight text-ink no-underline rtl:tracking-normal">AIM</Link>
          <nav className="hidden h-full items-stretch gap-10 lg:flex" aria-label={t('Sections')}>
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} aria-current={section === id ? 'location' : undefined}
                className={`relative flex items-center whitespace-nowrap text-base font-medium no-underline transition-colors ${section === id ? 'text-ink' : 'text-ink-muted hover:text-ink'}`}>
                {t(label)}
                <span aria-hidden className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ink transition-transform duration-300 rtl:origin-right ${section === id ? 'scale-x-100' : 'scale-x-0'}`} />
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-1.5">
            <span className="hidden items-center gap-1.5 lg:flex"><ThemeToggleButton /><LanguageSwitcher /></span>
            <Link to="/login" className="hidden h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-semibold text-ink no-underline hover:bg-surface-strong lg:inline-flex">{t('Log in')}</Link>
            <Link to="/register" className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-ink px-5 text-sm font-semibold text-ink-inverse no-underline transition hover:opacity-90">{t('Sign up')}</Link>
            <button ref={menuBtn} type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-controls="lp-menu"
              aria-label={menuOpen ? t('Close menu') : t('Menu')}
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink hover:bg-surface-strong lg:hidden">
              <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-6">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Phones and tablets: the menu opens as a panel under the header. */}
        {menuOpen && (
          <>
            <div id="lp-menu" className="lp-menu relative z-20 border-t border-line bg-page lg:hidden">
              <nav className={`${wrap} flex flex-col pb-2`} aria-label={t('Sections')}>
                {NAV.map(([id, label]) => (
                  <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} aria-current={section === id ? 'location' : undefined}
                    className={`flex items-center justify-between border-b border-line py-4 text-2xl font-semibold no-underline ${section === id ? 'text-ink' : 'text-ink-soft'}`}>
                    {t(label)}
                    {section === id && <span aria-hidden className="size-2 rounded-full bg-brand" />}
                  </a>
                ))}
                <Link to="/login" className="flex items-center border-b border-line py-4 text-2xl font-semibold text-ink-soft no-underline">{t('Log in')}</Link>
              </nav>
              <div className={`${wrap} flex items-center justify-between gap-3 py-4`}>
                <span className="text-sm text-ink-muted">{t('Theme and language')}</span>
                <span className="flex items-center gap-2"><ThemeToggleButton /><LanguageSwitcher /></span>
              </div>
            </div>
          </>
        )}
      </header>
      {/* Outside the header on purpose: the header's blur would otherwise trap a fixed backdrop inside it. */}
      {menuOpen && <div aria-hidden className="fixed inset-0 z-20 bg-page/70 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />}

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className={`${wrap} pt-12 sm:pt-16 lg:pt-24`}>
          <div className="grid gap-10 grid-cols-1 lg:grid-cols-12 lg:items-end">
            <h1 className="lp-display m-0 text-[clamp(2.6rem,5.6vw,4.9rem)] font-semibold rtl:text-[clamp(2rem,4.6vw,4rem)] lg:col-span-7">
              {t('Learn English one')} {t('small step')} {t('a day.')}
            </h1>
            <div className="flex flex-col gap-6 lg:col-span-5 lg:pb-3 lg:ps-6">
              <p className="m-0 max-w-sm text-[1.0625rem] leading-relaxed text-ink-muted sm:text-[1.1875rem]">
                {t('Lessons for every level from beginner to advanced, an AI teacher you can talk to any time, and practice that fits into your day.')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 sm:justify-start lg:flex-nowrap">
                <Link to="/register" className="inline-flex h-14 w-full justify-center sm:w-auto shrink-0 items-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white no-underline transition hover:bg-brand-hover active:scale-[0.98]">
                  {t('Start learning free')}<Arrow />
                </Link>
                <Link to="/login" className="text-[15px] font-semibold text-ink underline decoration-line-strong decoration-2 underline-offset-[6px] hover:decoration-ink">{t('I already have an account')}</Link>
              </div>
            </div>
          </div>

          {/* The red-pen specimen: what the AI Teacher does to a sentence. */}
          <div className={`${rule} mt-14 pt-10 sm:mt-20 lg:pt-14`}>
            <div key={ex}>
              <p className="lp-display m-0 text-[clamp(1.9rem,5.4vw,4.75rem)] font-medium text-ink-muted">
                <span className="sr-only">{t('Your sentence')}: </span>
                <bdi lang="en" dir="ltr">{renderTokens(example.wrong, 'wrong')}.</bdi>
              </p>
              <p className="lp-display lp-after m-0 mt-1 text-[clamp(1.9rem,5.4vw,4.75rem)] font-semibold text-ink">
                <span className="sr-only">{t('Corrected by the AI Teacher')}: </span>
                <bdi lang="en" dir="ltr">{renderTokens(example.right, 'right')}.</bdi>
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-5">
              <p className="m-0 flex items-center gap-3 text-sm text-ink-muted">
                <span aria-hidden className="size-2 shrink-0 rounded-full bg-danger" />
                <span><span className="font-semibold text-ink">{t('Corrected by the AI Teacher')}.</span> {t(example.note)}</span>
              </p>

              {/* Example switcher: each bar is also the timer for its example. */}
              <div className="flex items-center gap-1" role="group" aria-label={t('Examples')}>
                {EXAMPLES.map((_, i) => (
                  <button key={i} type="button" onClick={() => setEx(i)} aria-label={t('Example {n}', { n: i + 1 })} aria-current={i === ex}
                    className="group grid h-9 w-11 cursor-pointer place-items-center border-0 bg-transparent p-0">
                    <span className="lp-bar block w-full" data-on={i === ex}>
                      <i onAnimationEnd={i === ex ? () => setEx((ex + 1) % EXAMPLES.length) : undefined} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real catalog numbers, set as a plain ruled row. */}
          <dl className="m-0 mt-14 grid grid-cols-2 gap-x-8 gap-y-8 pb-20 md:grid-cols-4 lg:pb-28" aria-label={t('AIM in numbers')}>
            {[
              { v: courses ? String(courses.length) : null, l: t('Courses') },
              { v: courses ? String(totalLessons) : null, l: t('Lessons') },
              { v: '6', l: t('Levels, A1 to C2') },
              { v: '24/7', l: t('AI Teacher') },
            ].map((s) => (
              <div key={s.l} className={`${rule} pt-4`}>
                <dd className="lp-num m-0 text-4xl font-semibold tracking-tight rtl:tracking-normal sm:text-5xl">
                  {s.v === null && !failed ? <Skeleton className="h-10 w-16" /> : (s.v ?? '—')}
                </dd>
                <dt className="mt-1 text-sm text-ink-muted">{s.l}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* ── How it works: a real sequence, so it is numbered ─── */}
        <section id="how" className={`${rule} scroll-mt-20 lg:scroll-mt-16`} aria-labelledby="how-h">
          <div className={`${wrap} grid gap-10 py-20 grid-cols-1 lg:grid-cols-12 lg:gap-x-10 lg:py-28`}>
            {sectionHead('how-h', t('How it works'), t('Three steps from your first visit to your first lesson.'))}
            <ol className="m-0 list-none p-0 lg:col-span-8">
              {STEPS.map((s, i) => (
                <li key={s.title} className={`grid grid-cols-[3.5rem_1fr] gap-x-4 py-8 sm:grid-cols-[6rem_1fr] ${i === 0 ? '' : rule} ${i === 0 ? 'pt-0' : ''}`}>
                  <span className="lp-num text-5xl font-semibold leading-none text-brand-ink sm:text-7xl" aria-hidden>{i + 1}</span>
                  <div>
                    <h3 className="m-0 text-xl font-semibold sm:text-2xl">{t(s.title)}</h3>
                    <p className="m-0 mt-2 max-w-lg text-base leading-relaxed text-ink-muted">{t(s.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Levels: an index of A1 to C2, one open at a time ─── */}
        <section id="levels" className={`${rule} scroll-mt-20 lg:scroll-mt-16`} aria-labelledby="levels-h">
          <div className={`${wrap} grid gap-10 py-20 grid-cols-1 lg:grid-cols-12 lg:gap-x-10 lg:py-28`}>
            {sectionHead('levels-h', t('Find the right level for you'), t('Levels follow the international A1 to C2 scale.'))}
            <div className="lg:col-span-8">
              {perBand.map((b, i) => {
                const open = band === b.code;
                const empty = !!courses && b.list.length === 0;
                return (
                  <div key={b.code} className={`${i === 0 ? '' : rule}`}>
                    <button type="button" aria-expanded={open} aria-controls={`lv-${b.code}`} onClick={() => setBand(b.code)}
                      className={`grid w-full cursor-pointer grid-cols-[4.5rem_1fr_auto] items-baseline gap-x-4 border-0 bg-transparent py-5 text-start transition-colors sm:grid-cols-[7rem_1fr_auto] ${open ? 'text-ink' : empty ? 'text-ink-faint hover:text-ink-muted' : 'text-ink-muted hover:text-ink'}`}>
                      <span className="lp-num text-4xl font-semibold tracking-tight sm:text-6xl">{b.code}</span>
                      <span className="text-lg font-semibold sm:text-xl">{t(b.name)}</span>
                      <span className="lp-num text-sm">{courses && b.lessons > 0 ? t('{n} lessons', { n: b.lessons }) : ''}</span>
                    </button>
                    {open && (
                      <div id={`lv-${b.code}`} className="pb-8 sm:ps-[calc(7rem+1rem)]">
                        <p className="m-0 max-w-md text-base leading-relaxed text-ink-muted">{t(b.body)}</p>
                        <div className="mt-5 overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
                          {courses === null && !failed && <div className="flex flex-col gap-3 p-5"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/2" /></div>}
                          {b.list.slice(0, 3).map((c, k) => (
                            <Link key={c.id} to="/register" className={`group flex items-center gap-4 px-5 py-4 text-ink no-underline transition-colors hover:bg-surface-strong ${k === 0 ? '' : rule}`}>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-base font-semibold">{c.title}</span>
                                {c.description && <span className="block truncate text-sm text-ink-muted">{c.description}</span>}
                              </span>
                              <span className="lp-num shrink-0 text-sm text-ink-muted">{t('{n} lessons', { n: c.lessonCount })}</span>
                              <Arrow className="text-ink-muted transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                            </Link>
                          ))}
                          {courses && b.list.length === 0 && <p className="m-0 p-5 text-sm text-ink-muted">{t('Courses for this level are coming soon.')}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className={rule} />
            </div>
          </div>
        </section>

        {/* ── Features, next to the product itself ─────────────── */}
        <section id="features" className={`${rule} scroll-mt-20 lg:scroll-mt-16`} aria-labelledby="features-h">
          <div className={`${wrap} grid gap-12 py-20 grid-cols-1 lg:grid-cols-12 lg:gap-x-10 lg:py-28`}>
            {sectionHead('features-h', t('Everything you need to keep going'))}
            <div className="grid gap-10 lg:col-span-8 grid-cols-1 lg:grid-cols-2 lg:gap-x-12">
              <ul className="m-0 flex list-none flex-col p-0">
                {FEATURES.map((f, i) => (
                  <li key={f.title} className={`flex gap-4 py-6 ${i === 0 ? 'pt-0' : rule}`}>
                    <span className="mt-0.5 text-brand-ink">{f.icon}</span>
                    <div>
                      <h3 className="m-0 text-lg font-semibold">{t(f.title)}</h3>
                      <p className="m-0 mt-1.5 text-base leading-relaxed text-ink-muted">{t(f.body)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Product panel: sample conversation, made up for this page. */}
              <div aria-hidden className="self-start rounded-2xl bg-surface p-5 ring-1 ring-line shadow-card sm:p-6">
                <div className="flex items-center gap-3 border-b border-line pb-4">
                  <span className="relative grid size-10 place-items-center rounded-full bg-brand text-white">
                    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                      <path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 3.5V17H5a2 2 0 01-2-2V7a2 2 0 012-2z" /><path d="M8.5 11l2.4 2.4L15.5 9" />
                    </svg>
                    <span className="absolute -bottom-0.5 -end-0.5 size-3 rounded-full bg-success ring-2 ring-surface" />
                  </span>
                  <div><p className="m-0 text-sm font-semibold">{t('AI Teacher')}</p><p className="m-0 text-xs text-ink-muted">{t('24/7')}</p></div>
                </div>
                <div className="flex flex-col gap-2.5 pt-5">
                  <p className="m-0 w-fit max-w-[88%] rounded-2xl rounded-es-md bg-surface-strong px-4 py-2.5 text-sm">{t('What did you do today?')}</p>
                  <p dir="ltr" lang="en" className="m-0 ms-auto w-fit max-w-[88%] rounded-2xl rounded-ee-md bg-brand px-4 py-2.5 text-sm text-white">{t('I go to market.')}</p>
                  <p className="m-0 w-fit max-w-[92%] rounded-2xl rounded-es-md bg-success-soft px-4 py-2.5 text-sm text-success-ink">{t('Nice! Say: “I went to the market.”')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final call to action: one inverted band ──────────── */}
        <section className="bg-ink text-ink-inverse">
          <div className={`${wrap} grid gap-8 py-20 grid-cols-1 lg:grid-cols-12 lg:items-end lg:py-28`}>
            <h2 className="lp-display m-0 text-[clamp(2.3rem,6.3vw,5.3rem)] font-semibold rtl:text-[clamp(1.9rem,4.4vw,3.6rem)] lg:col-span-8">{t('Ready to find your level?')}</h2>
            <div className="flex flex-col items-start gap-5 lg:col-span-4">
              <p className="m-0 max-w-sm text-base leading-relaxed opacity-75">{t('Create an account and take the placement test. It is free to start.')}</p>
              <Link to="/register" className="inline-flex h-14 w-full justify-center sm:w-auto items-center gap-2 rounded-full bg-page px-8 text-base font-semibold text-ink no-underline transition hover:opacity-90 active:scale-[0.98]">
                {t('Start learning free')}<Arrow />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer>
        <div className={`${wrap} flex flex-col items-start justify-between gap-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center`}>
          <span className="font-bold text-ink">AIM</span>
          <span className="flex items-center gap-6">
            <Link to="/login" className="text-ink-muted no-underline hover:text-ink">{t('Log in')}</Link>
            <Link to="/register" className="text-ink-muted no-underline hover:text-ink">{t('Sign up')}</Link>
          </span>
          <span>© {new Date().getFullYear()} AIM</span>
        </div>
      </footer>
    </div>
  );
}
