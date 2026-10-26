import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  completePlacementAttempt,
  errorCode,
  fetchActivePlacementTest,
  fetchLatestPlacementStatus,
  fetchPlacementSections,
  formatPlacementLevel,
  loadPlacementProgress,
  savePlacementProgress,
  startPlacementAttempt,
  type PlacementLatestStatus,
  type PlacementSection,
  type PlacementTest,
} from './placementApi';
import { ClockIcon, ClipboardIcon, LightbulbIcon, TrophyIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import { BODY, CARD, H2, HeroBadge, PageHeader } from './ui';

const SHELL = 'mx-auto w-full max-w-2xl flex flex-col gap-5';

function InfoRow({ icon, title, desc }: { icon: ReactNode; title: ReactNode; desc: ReactNode }) {
  return (
    <div className={`flex gap-4 items-center p-4 ${CARD}`}>
      <div className="size-11 bg-indigo-50/80 dark:bg-indigo-950/60 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="m-0 text-[15px] font-bold leading-snug text-slate-900 dark:text-white">{title}</p>
        <p className="m-0 mt-0.5 text-xs leading-relaxed text-slate-400 dark:text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function RestartModalBody({ text, confirmLabel, busy, onConfirm, onCancel }: { text: string; confirmLabel: string; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-3">
      <p className={BODY}>{text}</p>
      <Button onClick={onConfirm} disabled={busy} fullWidth>{confirmLabel}</Button>
      <Button variant="secondary" onClick={onCancel} fullWidth>{t('Cancel')}</Button>
    </div>
  );
}

/**
 * Placement menu + intro (Flutter PlacementMenuPage / PlacementIntroPage / PlacementStartPage).
 * GET /placement/attempts/latest decides between: not taken, in progress, scoring, completed.
 */
export function PlacementEntryPage() {
  const { t, plural } = useI18n();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PlacementLatestStatus | null>(null);
  const [test, setTest] = useState<PlacementTest | null>(null);
  const [sections, setSections] = useState<PlacementSection[]>([]);
  const [noActiveTest, setNoActiveTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setActionError('');
    try {
      const latest = await fetchLatestPlacementStatus();
      setStatus(latest);
      const [testRes, sectionsRes] = await Promise.allSettled([
        fetchActivePlacementTest(),
        fetchPlacementSections(),
      ]);
      if (testRes.status === 'fulfilled') {
        setTest(testRes.value);
        setNoActiveTest(false);
      } else if (errorCode(testRes.reason) === 'NO_ACTIVE_TEST' || (testRes.reason as { statusCode?: number })?.statusCode === 404) {
        setTest(null);
        setNoActiveTest(true);
      } else {
        throw testRes.reason;
      }
      setSections(sectionsRes.status === 'fulfilled' ? sectionsRes.value : []);
    } catch (err) {
      setError(getErrorMessage(err, t('Failed to load placement test')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  async function handleStart() {
    setConfirmRestart(false);
    setBusy(true);
    setActionError('');
    try {
      const attempt = await startPlacementAttempt();
      savePlacementProgress(attempt.id, {
        expiresAt: attempt.expires_at ?? null,
        sectionIndex: 0,
        questionIndex: 0,
        answered: 0,
        skipped: 0,
      });
      navigate(`/placement/${attempt.id}`, { state: { expiresAt: attempt.expires_at } });
    } catch (err) {
      setActionError(getErrorMessage(err, t('Failed to start the placement test')));
      setBusy(false);
    }
  }

  async function handleFinishSubmitted(attemptId: string) {
    setBusy(true);
    setActionError('');
    try {
      await completePlacementAttempt(attemptId);
    } catch (err) {
      const code = errorCode(err);
      if (code !== 'ATTEMPT_ALREADY_SUBMITTED' && code !== 'ATTEMPT_NOT_ACTIVE') {
        setActionError(getErrorMessage(err, t('Failed to finish the placement test')));
        setBusy(false);
        return;
      }
    }
    navigate(`/placement/${attemptId}/result`);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!status) return null;

  const questionsText = (n: number) =>
    plural(n, {
      one: t('1 question'),
      two: t('2 questions'),
      few: t('{n} questions#few', { n }),
      other: t('{n} questions', { n }),
    });
  const sectionsText = (n: number) =>
    plural(n, {
      one: t('1 section'),
      two: t('2 sections'),
      few: t('{n} sections#few', { n }),
      other: t('{n} sections', { n }),
    });
  const totalQuestions = sections.reduce((sum, s) => sum + (s.total_questions ?? 0), 0);

  // ---- Completed: compact result + retake -----------------------------------
  if (status.status === 'completed' && status.result && status.attemptId) {
    const level = formatPlacementLevel(status.result.estimated_level);
    return (
      <div className={SHELL}>
        <PageHeader eyebrow={t('Level assessment')} title={t('Placement Test')} />
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <Card>
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl opacity-25 blur-lg" />
              <div className="relative size-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/25">
                <span className="font-extrabold text-3xl tracking-tight leading-none">{level.code ?? level.label}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mt-1">{t('Level')}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{t('Your placement level')}</span>
              {level.code && <span className="text-sm text-slate-500 dark:text-slate-400">{level.label}</span>}
            </div>
            <Link to={`/placement/${status.attemptId}/result`} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth>{t('View full result')}</Button>
            </Link>
          </div>
        </Card>
        {test && (
          <Button variant="ghost" size="lg" onClick={() => setConfirmRestart(true)} disabled={busy} fullWidth>
            {busy ? t('Starting…') : t('Retake placement test')}
          </Button>
        )}
        <Modal open={confirmRestart} onClose={() => setConfirmRestart(false)} title={t('Retake placement test?')}>
          <RestartModalBody
            text={t('A new attempt will start now. Your new result will replace your current placement level.')}
            confirmLabel={t('Retake test')}
            busy={busy}
            onConfirm={handleStart}
            onCancel={() => setConfirmRestart(false)}
          />
        </Modal>
      </div>
    );
  }

  // ---- Submitted: scoring pending -------------------------------------------
  if (status.status === 'submitted' && status.attemptId) {
    const attemptId = status.attemptId;
    return (
      <div className={SHELL}>
        <PageHeader eyebrow={t('Level assessment')} title={t('Placement Test')} />
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <Card>
          <div className="flex flex-col gap-3">
            <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h2 className={H2}>{t('Your test has been submitted')}</h2>
            <p className={BODY}>{t('Your answers are in. Finish scoring to see your placement level.')}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button size="lg" onClick={() => handleFinishSubmitted(attemptId)} disabled={busy}>
                {busy ? t('Finishing…') : t('See my result')}
              </Button>
              <Button size="lg" variant="secondary" onClick={load} disabled={busy}>{t('Check again')}</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (noActiveTest) {
    return (
      <div className={SHELL}>
        <PageHeader eyebrow={t('Level assessment')} title={t('Placement Test')} />
        <EmptyState
          title={t('No placement test available')}
          message={t('There is no placement test published right now. Please check back later.')}
          actionLabel={t('Go to dashboard')}
          onAction={() => navigate('/dashboard')}
        />
      </div>
    );
  }

  // ---- Active: resume or start over -----------------------------------------
  if (status.status === 'active' && status.attemptId) {
    const attemptId = status.attemptId;
    const progress = loadPlacementProgress(attemptId);
    return (
      <div className={SHELL}>
        <PageHeader eyebrow={t('Level assessment')} title={t('Placement Test')} />
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <Card>
          <div className="flex flex-col gap-3">
            <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ClockIcon className="size-5" />
            </div>
            <h2 className={H2}>{t('You have a test in progress')}</h2>
            <p className={BODY}>
              {t('Continue where you left off, or start a new attempt. Starting over discards the current attempt.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                size="lg"
                onClick={() => navigate(`/placement/${attemptId}`, { state: { expiresAt: progress?.expiresAt ?? null } })}
                disabled={busy}
              >
                {t('Continue test')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setConfirmRestart(true)} disabled={busy}>
                {busy ? t('Starting…') : t('Start over')}
              </Button>
            </div>
          </div>
        </Card>
        <Modal open={confirmRestart} onClose={() => setConfirmRestart(false)} title={t('Start over?')}>
          <RestartModalBody
            text={t('Your current attempt will be discarded and a new timed attempt will begin.')}
            confirmLabel={t('Start new attempt')}
            busy={busy}
            onConfirm={handleStart}
            onCancel={() => setConfirmRestart(false)}
          />
        </Modal>
      </div>
    );
  }

  // ---- Not taken -------------------------------------------------------------
  return (
    <div className={SHELL}>
      <div className="flex flex-col gap-4">
        <HeroBadge>
          <ClipboardIcon className="size-8" />
        </HeroBadge>
        <PageHeader
          eyebrow={t('Placement Test')}
          title={test?.title ? t(test.title) : t('Placement Test')}
          subtitle={t('Calibrate your AI tutor to find your optimal starting point.')}
        />
      </div>
      {actionError && <Banner variant="error">{actionError}</Banner>}

      {test && (
        <div className="grid gap-3 md:grid-cols-2">
          <InfoRow
            icon={<ClockIcon className="size-5 text-[#4F46E5] dark:text-indigo-400" />}
            title={t('About {n} minutes', { n: test.estimated_minutes })}
            desc={t('The test is timed once you start.')}
          />
          <InfoRow
            icon={<ClipboardIcon className="size-5 text-[#4F46E5] dark:text-indigo-400" />}
            title={`${sectionsText(test.total_sections)}${totalQuestions > 0 ? ` · ${questionsText(totalQuestions)}` : ''}`}
            desc={t('Work through each section in order.')}
          />
          <div className="md:col-span-2">
            <InfoRow
              icon={<LightbulbIcon className="size-5 text-amber-500 dark:text-amber-400" />}
              title={t('Helpful tip')}
              desc={t("You can skip questions you don't know — your level is calculated by AIM after you finish.")}
            />
          </div>
        </div>
      )}

      {sections.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('Sections')}</h2>
          <ol className="m-0 p-0 list-none grid gap-2.5 md:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id} className={`flex items-center gap-3 px-4 py-3 ${CARD}`}>
                <span className="size-8 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 text-sm font-extrabold flex items-center justify-center">{i + 1}</span>
                <span className="flex-1 min-w-0 text-sm font-semibold text-slate-900 dark:text-white">{t(s.title)}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{questionsText(s.total_questions)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Button size="lg" onClick={handleStart} disabled={busy || !test} fullWidth>
        <TrophyIcon className="size-5" />
        {busy ? t('Starting…') : t('Start placement test')}
      </Button>
    </div>
  );
}
