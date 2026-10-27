import { Link } from 'react-router-dom';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import type { SessionQuestion, SessionSummary } from './practiceApi';
import { TrophyIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';
import { linkButton, linkButtonPrimary, questionCard } from './practiceStyles';

export type CompletionStatus = 'saving' | 'saved' | 'failed';

interface PracticeFeedbackProps {
  summary: SessionSummary;
  questions: SessionQuestion[];
  lessonId: string;
  lessonTitle?: string;
  courseId?: string;
  completion: CompletionStatus;
  completionError?: string;
  onRetryCompletion: () => void;
  onPracticeAgain: () => void;
}

/** Session summary from GET /sessions/:sessionId/summary — all counts are backend-evaluated. */
export function PracticeFeedback({
  summary,
  questions,
  lessonId,
  lessonTitle,
  courseId,
  completion,
  completionError,
  onRetryCompletion,
  onPracticeAgain,
}: PracticeFeedbackProps) {
  const { t } = useI18n();
  const byId = new Map(questions.map(q => [q.id, q]));
  const lessonState = { courseId };

  function answerText(itemId: string, answerValue: string) {
    const option = byId.get(itemId)?.options.find(o => o.id === answerValue);
    return option?.text ?? answerValue;
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      <div className="flex flex-col items-center text-center pt-2">
        <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/25 rotate-3 mb-5">
          <TrophyIcon className="size-11 text-white" />
        </div>
        <span className="text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full mb-2">
          {t('Practice complete')}
        </span>
        <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl sm:text-3xl tracking-tight m-0">{t('Great job!')}</h1>
        {lessonTitle && <span className="text-slate-500 dark:text-slate-400 text-sm mt-1">{lessonTitle}</span>}
      </div>

      <div className="bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 rounded-2xl p-4 flex items-center justify-around shadow-sm">
        <div className="text-center">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider block mb-1">{t('Score')}</span>
          <span className="text-[#4F46E5] dark:text-indigo-400 font-extrabold text-2xl">{summary.correctCount}/{summary.totalAttempts}</span>
        </div>
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
        <div className="text-center">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider block mb-1">{t('Accuracy')}</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl">{summary.accuracyPercent}%</span>
        </div>
      </div>
      <p className="text-center text-slate-500 dark:text-slate-400 text-sm m-0 -mt-2">
        {t('{pct}% accuracy · {correct} correct, {wrong} to review', { pct: summary.accuracyPercent, correct: summary.correctCount, wrong: summary.wrongCount })}
      </p>

      {completion === 'saving' && <Banner variant="info">{t('Saving your lesson progress…')}</Banner>}
      {completion === 'saved' && <Banner variant="success">{t('Lesson completed — the next lesson is unlocked.')}</Banner>}
      {completion === 'failed' && (
        <Banner variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{completionError || t("We couldn't mark this lesson as complete.")}</span>
            <Button size="sm" variant="secondary" onClick={onRetryCompletion}>{t('Retry')}</Button>
          </div>
        </Banner>
      )}

      {summary.attempts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-slate-900 dark:text-white font-extrabold text-base tracking-tight m-0 px-1">{t('Your answers')}</h2>
          {summary.attempts.map((attempt, i) => (
            <div key={`${attempt.itemId}-${i}`} className={`${questionCard} flex flex-col gap-3`}>
              <p className="text-slate-900 dark:text-white font-bold text-sm leading-snug m-0">
                {i + 1}. {byId.get(attempt.itemId)?.stem ?? t('Question')}
              </p>
              <div
                className={`rounded-xl p-3 ring-1 ${
                  attempt.isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-900 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 ring-rose-200 dark:ring-rose-900 text-rose-800 dark:text-rose-300'
                }`}
              >
                <p className="font-extrabold text-sm m-0">{attempt.isCorrect ? t('✓ Correct') : t('✗ Incorrect')}</p>
                <p className="text-sm m-0 mt-0.5 opacity-90">
                  {t('Your answer: {answer}', { answer: answerText(attempt.itemId, attempt.answerValue) || '—' })}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Button variant="secondary" onClick={onPracticeAgain}>{t('Practice again')}</Button>
        <Link to={`/lessons/${lessonId}`} state={lessonState} className={linkButton}>
          {t('Back to lesson')}
        </Link>
        <Link to={courseId ? `/curriculum/${courseId}` : '/curriculum'} className={linkButtonPrimary}>
          {t('Continue course')}
        </Link>
      </div>
    </div>
  );
}
