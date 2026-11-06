import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { PlacementIntroSkeleton } from '../../components/common/Skeleton';
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
  markPlacementLive,
  savePlacementProgress,
  setPlacementDecision,
  startPlacementAttempt,
  type PlacementLatestStatus,
  type PlacementSection,
  type PlacementTest,
} from './placementApi';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../hooks/useAuth';
import { cacheSetupDone } from '../start/setupStatus';
import { ED_BODY, ED_BTN, ED_SHELL, EdHeader, edRow } from './ed';

function RestartModalBody({ text, confirmLabel, busy, onConfirm, onCancel }: { text: string; confirmLabel: string; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-3">
      <p className={ED_BODY}>{text}</p>
      <Button onClick={onConfirm} disabled={busy} fullWidth className={ED_BTN}>{confirmLabel}</Button>
      <Button variant="secondary" onClick={onCancel} fullWidth className={ED_BTN}>{t('Cancel')}</Button>
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
  const { user } = useAuth();
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

  // An unfinished attempt (interrupted, e.g. app/tab closed) always starts again from question 1, once.
  const [autoTried, setAutoTried] = useState(false);
  const abandoned = status?.status === 'active' && !!status.attemptId && !autoTried;
  useEffect(() => {
    if (!abandoned) return;
    setAutoTried(true);
    void handleStart();
  }, [abandoned]);

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
      markPlacementLive(attempt.id);
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

  // No test is published: do not trap the student; treat it as "start from zero".
  async function skipUnavailableTest() {
    try { await setPlacementDecision('start_from_scratch'); } catch { /* the guard re-checks anyway */ }
    if (user) cacheSetupDone(user.id);
    navigate('/dashboard', { replace: true });
  }

  if (loading || abandoned) return <PlacementIntroSkeleton />;
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

  // ---- Completed: the level is the headline, retake sits quietly under it ---------
  if (status.status === 'completed' && status.result && status.attemptId) {
    const level = formatPlacementLevel(status.result.estimated_level);
    return (
      <div className={ED_SHELL}>
        <EdHeader title={t('Placement Test')} />
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <section className="border-t border-line pt-6">
          <p className="m-0 text-sm text-ink-muted">{t('Your placement level')}</p>
          <p className="lp-display lp-num m-0 mt-1 text-[clamp(4.5rem,18vw,8rem)] font-semibold leading-none text-ink">{level.code ?? level.label}</p>
          {level.code && <p className="m-0 mt-3 text-xl font-medium text-ink-soft">{level.label}</p>}
        </section>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to={`/placement/${status.attemptId}/result`} className="sm:flex-1">
            <Button size="lg" fullWidth className={ED_BTN}>{t('View full result')}</Button>
          </Link>
          {test && (
            <Button variant="secondary" size="lg" className={`${ED_BTN} sm:flex-1`} onClick={() => setConfirmRestart(true)} disabled={busy}>
              {busy ? t('Starting…') : t('Retake placement test')}
            </Button>
          )}
        </div>
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
      <div className={ED_SHELL}>
        <EdHeader title={t('Your test has been submitted')} subtitle={t('Your answers are in. Finish scoring to see your placement level.')} />
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className={`${ED_BTN} sm:flex-1`} onClick={() => handleFinishSubmitted(attemptId)} disabled={busy}>
            {busy ? t('Finishing…') : t('See my result')}
          </Button>
          <Button size="lg" variant="secondary" className={`${ED_BTN} sm:flex-1`} onClick={load} disabled={busy}>{t('Check again')}</Button>
        </div>
      </div>
    );
  }

  if (noActiveTest) {
    return (
      <div className={ED_SHELL}>
        <EdHeader title={t('Placement Test')} />
        <EmptyState
          title={t('No placement test available')}
          message={t('There is no placement test published right now. Please check back later.')}
          actionLabel={t('Continue without the test')}
          onAction={() => void skipUnavailableTest()}
        />
      </div>
    );
  }

  // ---- Active: only reached if the automatic restart failed -----------------
  if (status.status === 'active' && status.attemptId) {
    const attemptId = status.attemptId;
    const progress = loadPlacementProgress(attemptId);
    return (
      <div className={ED_SHELL}>
        <EdHeader title={t('You have a test in progress')} subtitle={t('Your last attempt was interrupted. Start again from the beginning.')} />
        {actionError && <Banner variant="error">{actionError}</Banner>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className={`${ED_BTN} sm:flex-1`}
            onClick={() => { markPlacementLive(attemptId); navigate(`/placement/${attemptId}`, { state: { expiresAt: progress?.expiresAt ?? null } }); }}
            disabled={busy}
          >
            {t('Continue test')}
          </Button>
          <Button size="lg" variant="secondary" className={`${ED_BTN} sm:flex-1`} onClick={() => setConfirmRestart(true)} disabled={busy}>
            {busy ? t('Starting…') : t('Start from the beginning')}
          </Button>
        </div>
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
    <div className={ED_SHELL}>
      <EdHeader
        title={test?.title ? t(test.title) : t('Placement Test')}
        subtitle={t('Calibrate your AI tutor to find your optimal starting point.')}
      />
      {actionError && <Banner variant="error">{actionError}</Banner>}

      {test && (
        <dl className="m-0 border-y border-line">
          {[
            [t('About {n} minutes', { n: test.estimated_minutes }), t('The test is timed once you start.')],
            [`${sectionsText(test.total_sections)}${totalQuestions > 0 ? `, ${questionsText(totalQuestions)}` : ''}`, t('Work through each section in order.')],
            [t('Helpful tip'), t("You can skip questions you don't know — your level is calculated by AIM after you finish.")],
          ].map(([title, desc], i) => (
            <div key={i} className={`py-4 ${edRow(i)}`}>
              <dt className="text-lg font-semibold text-ink">{title}</dt>
              <dd className="m-0 mt-0.5 text-[15px] leading-relaxed text-ink-muted">{desc}</dd>
            </div>
          ))}
        </dl>
      )}

      {sections.length > 0 && (
        <section aria-label={t('Sections')}>
          <ol className="m-0 list-none p-0">
            {sections.map((s, i) => (
              <li key={s.id} className={`flex items-baseline gap-4 py-3 ${edRow(i)}`}>
                <span className="lp-num w-6 shrink-0 text-lg font-semibold text-brand-ink">{i + 1}</span>
                <span className="min-w-0 flex-1 text-lg font-medium text-ink">{t(s.title)}</span>
                <span className="lp-num shrink-0 text-sm text-ink-muted">{questionsText(s.total_questions)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Button size="lg" className={ED_BTN} onClick={handleStart} disabled={busy || !test} fullWidth>
        {busy ? t('Starting…') : t('Start placement test')}
      </Button>
    </div>
  );
}
