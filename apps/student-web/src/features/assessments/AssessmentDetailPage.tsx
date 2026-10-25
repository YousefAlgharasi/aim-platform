import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
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
import { statusTone } from './assessmentUi';
import { Badge, CARD, PageHeader } from '../placement/ui';
import { ClipboardIcon, ClockIcon, CalendarIcon, TrophyIcon } from '../../components/common/Icons';

const CLOSED_STATUSES = new Set(['closed', 'expired', 'missed']);

export function AssessmentDetailPage() {
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
      .catch((err) => setError(getErrorMessage(err, 'Failed to load assessment')))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  async function handleStart() {
    setStarting(true);
    setStartError('');
    try {
      // The backend returns the existing open attempt if there is one (resume).
      const attempt = await startAssessmentAttempt(assessmentId);
      navigate(`/assessments/${assessmentId}/attempt/${attempt.attemptId}`);
    } catch (err) {
      setStartError(assessmentErrorMessage(err, 'Failed to start attempt'));
      setStarting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />;
  if (!detail) return null;

  const totalQuestions = detail.sections.reduce((sum, s) => sum + s.questionCount, 0);
  const deadline = detail.deadline;
  const deadlineClosed = !!deadline && CLOSED_STATUSES.has(deadline.status);
  const notOpenYet = deadline?.status === 'upcoming';
  const closesAt = deadline ? deadline.extendedClosesAt ?? deadline.closesAt : null;

  const stat = (icon: ReactNode, label: string, value: ReactNode) => (
    <div className={`flex items-center gap-3 p-3.5 ${CARD}`}>
      <div className="size-10 shrink-0 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center">{icon}</div>
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className="m-0 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-3xl flex flex-col gap-5">
      <PageHeader
        backTo="/assessments"
        backLabel="All assessments"
        eyebrow={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge tone={detail.type === 'quiz' ? 'indigo' : 'violet'}>{detail.type}</Badge>
            {deadline && <Badge tone={statusTone(deadline.status)}>{deadlineStatusLabel(deadline.status)}</Badge>}
          </span>
        }
        title={detail.title}
        subtitle={detail.description || undefined}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {stat(<ClipboardIcon className="size-5" />, 'Questions', `${totalQuestions} question${totalQuestions === 1 ? '' : 's'}`)}
        {stat(<ClockIcon className="size-5" />, 'Time', detail.timeLimitSeconds ? `${Math.round(detail.timeLimitSeconds / 60)} min` : 'No time limit')}
        {stat(<TrophyIcon className="size-5" />, 'Attempts', `${history?.totalAttempts ?? 0}/${detail.maxAttempts} used`)}
      </div>

      {(detail.sections.length > 1 || deadline) && (
        <div className={`${CARD} p-4 sm:p-5 flex flex-col gap-3`}>
          {detail.sections.length > 1 && (
            <ul className="m-0 p-0 list-none flex flex-col gap-2">
              {[...detail.sections].sort((a, b) => a.order - b.order).map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                  <span className="size-7 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 text-xs font-extrabold flex items-center justify-center">{i + 1}</span>
                  <span className="flex-1 min-w-0 font-semibold">{s.title}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{s.questionCount} question{s.questionCount === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ul>
          )}
          {deadline && (
            <p className="m-0 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <CalendarIcon className="size-4 text-[#4F46E5] dark:text-indigo-400" />
              <span>
                {notOpenYet
                  ? `Opens ${new Date(deadline.opensAt).toLocaleString()}`
                  : `Due ${new Date(closesAt as string).toLocaleString()}`}
                {deadline.extendedClosesAt ? ' (extended)' : ''}
              </span>
            </p>
          )}
        </div>
      )}

      {startError && <Banner variant="error">{startError}</Banner>}
      {deadlineClosed && <Banner variant="info">This assessment is closed.</Banner>}

      <Button variant="primary" size="lg" fullWidth onClick={handleStart} disabled={starting}>
        {starting ? 'Starting…' : 'Start or continue attempt'}
      </Button>

      {history && history.results.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Past attempts</h2>
          <div className="grid gap-2.5 md:grid-cols-2">
            {history.results.map((attempt) => (
              <Link
                key={attempt.resultId}
                to={`/assessments/${assessmentId}/result/${attempt.attemptId}`}
                className={`${CARD} px-4 py-3.5 flex flex-col gap-2 no-underline hover:ring-[#C7D2FE] dark:hover:ring-indigo-700 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Attempt {attempt.attemptNumber}</span>
                  <Badge tone={attempt.passed ? 'emerald' : 'slate'}>{attempt.passed ? 'Passed' : 'Not passed'}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{attempt.score}/{attempt.maxScore}</span>
                  <span>{new Date(attempt.gradedAt).toLocaleDateString()}</span>
                  {attempt.latePenaltyApplied && <span className="text-amber-600 dark:text-amber-400 font-semibold">Late penalty</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
