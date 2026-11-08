import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { useI18n } from '../../i18n/I18nContext';
import { fetchAttemptResult, type AttemptResult } from './assessmentsApi';
import { Badge, CARD, H2, PageHeader } from '../placement/ui';

export function AssessmentResultPage() {
  const { t, formatDateTime, formatNumber } = useI18n();
  const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResult = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAttemptResult(attemptId ?? '')
      .then(setResult)
      .catch((err) => setError(getErrorMessage(err, t('Failed to load result'))))
      .finally(() => setLoading(false));
  }, [attemptId, t]);

  useEffect(() => { fetchResult(); }, [fetchResult]);

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchResult} />;
  if (!result) return null;

  const percent = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : null;

  return (
    <div className="w-full flex flex-col gap-5">
      <PageHeader title={t('Result')} fallback={`/assessments/${assessmentId}`} />

      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 text-center ring-1 ring-line sm:p-8">
        <div className="relative grid size-36 place-items-center" role="img" aria-label={`${formatNumber(result.score)}/${formatNumber(result.maxScore)}`}>
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-surface-strong" />
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
              className={result.passed ? 'stroke-success' : 'stroke-danger'}
              strokeDasharray={`${((percent ?? 0) / 100) * 326.7} 326.7`} />
          </svg>
          <span className="flex flex-col items-center">
            <span className="text-3xl font-semibold tabular-nums tracking-tight text-ink">{formatNumber(result.score)}/{formatNumber(result.maxScore)}</span>
            {percent !== null && <span className="text-xs font-bold text-ink-muted">{formatNumber(percent)}%</span>}
          </span>
        </div>
        <Badge tone={result.passed ? 'emerald' : 'red'}>{result.passed ? t('Passed') : t('Not passed')}</Badge>
        <p className="m-0 text-xs text-ink-muted">{t('Graded {date}', { date: formatDateTime(result.gradedAt) })}</p>
        {result.latePenaltyApplied && (
          <p className="m-0 text-sm font-medium text-warning-ink">{t('A late penalty was applied to this attempt.')}</p>
        )}
        {!result.passed && (
          <Link to="/improve" className="text-sm font-bold text-brand-ink">{t('See what to work on')} →</Link>
        )}
      </div>

      {result.feedbackAllowed && result.breakdown.length > 0 && (
        <section className={`${CARD} p-4 sm:p-5 flex flex-col gap-3`}>
          <h2 className={H2}>{t('Score Breakdown')}</h2>
          <div className="flex flex-col divide-y divide-line-subtle dark:divide-line">
            {result.breakdown.map((item, index) => (
              <div key={item.assessmentQuestionLinkId ?? index} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-ink-soft font-medium">
                  {t('Question {n}', { n: index + 1 })}
                  {item.isCorrect != null && (
                    <span className={`ms-2 text-xs font-bold ${item.isCorrect ? 'text-success-ink' : 'text-danger-ink'}`}>
                      {item.isCorrect ? t('Correct') : t('Incorrect')}
                    </span>
                  )}
                </span>
                <span className="font-bold text-ink shrink-0">{formatNumber(item.pointsAwarded)}/{formatNumber(item.pointsPossible)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to={`/assessments/${assessmentId}`} className="flex-1">
          <Button variant="secondary" size="lg" fullWidth>{t('Back to Assessment')}</Button>
        </Link>
        <Link to="/assessments" className="flex-1">
          <Button variant="primary" size="lg" fullWidth>{t('All Assessments')}</Button>
        </Link>
      </div>
    </div>
  );
}
