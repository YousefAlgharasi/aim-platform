import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { useI18n } from '../../i18n/I18nContext';
import { fetchAttemptResult, type AttemptResult } from './assessmentsApi';
import { Badge, CARD, H2, PageHeader, ProgressBar } from '../placement/ui';

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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchResult} />;
  if (!result) return null;

  const percent = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : null;

  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-5">
      <PageHeader eyebrow={t('Assessment')} title={t('Result')} backTo={`/assessments/${assessmentId}`} backLabel={t('Back to assessment')} />

      <div className="bg-gradient-to-b from-indigo-50/60 via-white to-slate-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-2xl ring-1 ring-[#E2E8F0] dark:ring-slate-700 shadow-sm p-6 flex flex-col items-center text-center gap-3">
        <div className="relative mb-1">
          <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl opacity-25 blur-lg" />
          <div className="relative min-w-24 h-24 px-4 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <span className="font-extrabold text-3xl tracking-tight leading-none">{formatNumber(result.score)}/{formatNumber(result.maxScore)}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mt-1">{t('Score')}</span>
          </div>
        </div>
        <Badge tone={result.passed ? 'emerald' : 'red'}>{result.passed ? t('Passed') : t('Not passed')}</Badge>
        {percent !== null && (
          <div className="w-full max-w-xs flex flex-col gap-1.5">
            <ProgressBar value={percent} total={100} label={t('Score')} />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatNumber(percent)}%</span>
          </div>
        )}
        <p className="m-0 text-xs text-slate-400 dark:text-slate-500">{t('Graded {date}', { date: formatDateTime(result.gradedAt) })}</p>
        {result.latePenaltyApplied && (
          <p className="m-0 text-sm font-medium text-amber-600 dark:text-amber-400">{t('A late penalty was applied to this attempt.')}</p>
        )}
      </div>

      {result.feedbackAllowed && result.breakdown.length > 0 && (
        <section className={`${CARD} p-4 sm:p-5 flex flex-col gap-3`}>
          <h2 className={H2}>{t('Score Breakdown')}</h2>
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
            {result.breakdown.map((item, index) => (
              <div key={item.assessmentQuestionLinkId ?? index} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  {t('Question {n}', { n: index + 1 })}
                  {item.isCorrect != null && (
                    <span className={`ms-2 text-xs font-bold ${item.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {item.isCorrect ? t('Correct') : t('Incorrect')}
                    </span>
                  )}
                </span>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">{formatNumber(item.pointsAwarded)}/{formatNumber(item.pointsPossible)}</span>
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
