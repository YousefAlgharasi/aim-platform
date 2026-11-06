import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  deadlineStatusLabel,
  fetchAssessmentDetail,
  fetchAssessmentHistory,
  startAssessmentAttempt,
  type AssessmentDetail,
  type ResultHistory,
} from './assessmentsApi';
import { assessmentErrorMessage } from './assessmentErrors';
import { useI18n } from '../../i18n/I18nContext';
import { statusTone, assessmentTypeLabel } from './assessmentUi';
import { Badge, CARD, PageHeader } from '../placement/ui';
import { ClipboardIcon, ClockIcon, CalendarIcon, TrophyIcon } from '../../components/common/Icons';

const CLOSED_STATUSES = new Set(['closed', 'expired', 'missed']);

export function AssessmentDetailPage() {
  const { t, plural, formatDateTime, formatDate, formatNumber } = useI18n();
  const { assessmentId = '' } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [history, setHistory] = useState<ResultHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [startError, setStartError] = useState('');

  const fetchDetail = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchAssessmentDetail(assessmentId),
      // History failing must not hide the assessment itself.
      fetchAssessmentHistory(assessmentId).catch(() => null),
    ])
      .then(([d, h]) => {
        setDetail(d);
        setHistory(h);
      })
      .catch((err) => setError(getErrorMessage(err, t('Failed to load assessment'))))
      .finally(() => setLoading(false));
  }, [assessmentId, t]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  async function handleStart() {
    setStarting(true);
    setStartError('');
    try {
      // The backend returns the existing open attempt if there is one (resume).
      const attempt = await startAssessmentAttempt(assessmentId);
      navigate(`/assessments/${assessmentId}/attempt/${attempt.attemptId}`);
    } catch (err) {
      setStartError(assessmentErrorMessage(err, t('Failed to start attempt')));
      setStarting(false);
    }
  }

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />;
  if (!detail) return null;

  const totalQuestions = detail.sections.reduce((sum, s) => sum + s.questionCount, 0);
  const deadline = detail.deadline;
  const deadlineClosed = !!deadline && CLOSED_STATUSES.has(deadline.status);
  const notOpenYet = deadline?.status === 'upcoming';
  const closesAt = deadline ? deadline.extendedClosesAt ?? deadline.closesAt : null;

  const questionsLabel = (n: number) =>
    plural(n, {
      one: t('1 question'),
      two: t('2 questions'),
      few: t('{n} questions (3-10)', { n }),
      other: t('{n} questions', { n }),
    });

  const stat = (icon: ReactNode, label: string, value: ReactNode) => (
    <div className={`flex items-center gap-3 p-3.5 ${CARD}`}>
      <div className="size-10 shrink-0 rounded-full bg-brand-soft/80 text-brand-ink flex items-center justify-center">{icon}</div>
      <div className="min-w-0">
        <p className="m-0 text-xs font-semibold text-ink-muted">{label}</p>
        <p className="m-0 text-sm font-bold text-ink">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="stagger flex w-full flex-col gap-6">
      <PageHeader title={t('Assessment')} fallback="/assessments" />

      <div className="hero-panel">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black/20 px-2.5 py-1 text-xs font-semibold text-white">{assessmentTypeLabel(detail.type)}</span>
            {deadline && <span className="hero-cta rounded-full px-2.5 py-1 text-xs font-semibold">{deadlineStatusLabel(deadline.status)}</span>}
          </div>
          <h2 className="m-0 text-2xl font-semibold leading-tight tracking-tight [unicode-bidi:plaintext] sm:text-3xl">{detail.title}</h2>
          {detail.description && <p className="m-0 text-sm leading-relaxed text-on-brand [unicode-bidi:plaintext]">{detail.description}</p>}
          {deadline && (
            <p className="m-0 flex items-center gap-2 text-sm font-semibold text-on-brand">
              <CalendarIcon className="size-4" />
              <span>
                {notOpenYet
                  ? t('Opens {date}', { date: formatDateTime(deadline.opensAt) })
                  : t('Due {date}', { date: formatDateTime(closesAt as string) })}
                {deadline.extendedClosesAt ? ` ${t('(extended)')}` : ''}
              </span>
            </p>
          )}
          {startError && <p className="m-0 rounded-xl bg-black/25 px-3 py-2 text-sm text-white" role="alert">{startError}</p>}
          <div>
            <Button onClick={handleStart} disabled={starting || deadlineClosed} size="lg" className="hero-cta !ring-0">
              {starting ? t('Starting…') : (history?.totalAttempts ?? 0) > 0 ? t('Start or continue attempt') : t('Start attempt')}
            </Button>
          </div>
        </div>
      </div>

      {deadlineClosed && <Banner variant="info">{t('This assessment is closed.')}</Banner>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stat(<ClipboardIcon className="size-5" />, t('Questions'), questionsLabel(totalQuestions))}
        {stat(<ClockIcon className="size-5" />, t('Time'), detail.timeLimitSeconds ? t('{n} min', { n: formatNumber(Math.round(detail.timeLimitSeconds / 60)) }) : t('No time limit'))}
        {stat(<TrophyIcon className="size-5" />, t('Attempts'), t('{used}/{max} used', { used: formatNumber(history?.totalAttempts ?? 0), max: formatNumber(detail.maxAttempts) }))}
      </div>

      {detail.sections.length > 1 && (
        <section className="flex flex-col gap-3" aria-label={t('Sections')}>
          <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t('What is covered')}</h2>
          <div className={`${CARD} p-4 sm:p-5`}>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {[...detail.sections].sort((a, b) => a.order - b.order).map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 text-sm text-ink-soft">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-semibold text-brand-ink">{i + 1}</span>
                  <span className="min-w-0 flex-1 font-semibold [unicode-bidi:plaintext]">{s.title}</span>
                  <span className="shrink-0 text-xs text-ink-muted">{questionsLabel(s.questionCount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {history && history.results.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t('Past attempts')}</h2>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {history.results.map((attempt) => (
              <Link
                key={attempt.resultId}
                to={`/assessments/${assessmentId}/result/${attempt.attemptId}`}
                className={`${CARD} px-4 py-3.5 flex flex-col gap-2 no-underline hover:ring-line-strong transition-all duration-200`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{t('Attempt {n}', { n: attempt.attemptNumber })}</span>
                  <Badge tone={attempt.passed ? 'emerald' : 'slate'}>{attempt.passed ? t('Passed') : t('Not passed')}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                  <span className="font-semibold text-ink-soft">{formatNumber(attempt.score)}/{formatNumber(attempt.maxScore)}</span>
                  <span>{formatDate(attempt.gradedAt)}</span>
                  {attempt.latePenaltyApplied && <span className="text-warning-ink font-semibold">{t('Late penalty')}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
