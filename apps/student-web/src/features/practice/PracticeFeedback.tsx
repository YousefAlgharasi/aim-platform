import { Link } from 'react-router-dom';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import type { SessionQuestion, SessionSummary } from './practiceApi';
import { useI18n } from '../../i18n/I18nContext';
import { ResultIcon } from '../../interaction';
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
  const ringLength = (Math.max(0, Math.min(100, summary.accuracyPercent)) / 100) * 326.7;

  function answerText(itemId: string, answerValue: string) {
    const option = byId.get(itemId)?.options.find(o => o.id === answerValue);
    return option?.text ?? answerValue;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <div className="relative grid size-32 place-items-center" role="img" aria-label={t('{pct}% accuracy', { pct: summary.accuracyPercent })}>
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-line-strong" />
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
              className={'ix-ring ' + (summary.accuracyPercent >= 70 ? 'stroke-success' : summary.accuracyPercent >= 40 ? 'stroke-warning' : 'stroke-danger')}
              strokeDasharray={`${ringLength} 326.7`}
              style={{ ['--ix-ring-from' as string]: ringLength }} />
          </svg>
          <span className="lp-num text-4xl font-semibold tracking-tight text-ink rtl:tracking-normal">{summary.accuracyPercent}%</span>
        </div>
        <h1 className="ix-fade-up lp-display m-0 text-[2rem] font-semibold text-ink sm:text-[2.5rem]">
          {summary.accuracyPercent >= 70 ? t('Great job!') : t('Good effort!')}
        </h1>
        {lessonTitle && <span className="text-sm text-ink-muted [unicode-bidi:plaintext]">{lessonTitle}</span>}
      </div>

      <div className="flex items-center justify-around rounded-2xl bg-surface p-5 ring-1 ring-line">
        <div className="text-center">
          <span className="mb-1 block text-sm text-ink-muted">{t('Score')}</span>
          <span className="lp-num text-3xl font-semibold text-ink">{summary.correctCount}/{summary.totalAttempts}</span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="text-center">
          <span className="mb-1 block text-sm text-ink-muted">{t('To review')}</span>
          <span className={`lp-num text-3xl font-semibold ${summary.wrongCount > 0 ? 'text-danger-ink' : 'text-success-ink'}`}>{summary.wrongCount}</span>
        </div>
      </div>

      {completion === 'saving' && <Banner variant="info">{t('Saving your lesson progress…')}</Banner>}
      {completion === 'saved' && (
        <Banner variant="success">
          <span className="flex items-center gap-2.5">
            <ResultIcon correct className="size-6" />
            <span>{t('Lesson completed — the next lesson is unlocked.')}</span>
          </span>
        </Banner>
      )}
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
          <h2 className="m-0 text-xl font-semibold tracking-tight text-ink">{t('Your answers')}</h2>
          {summary.attempts.map((attempt, i) => (
            <div key={`${attempt.itemId}-${i}`} className={`${questionCard} flex flex-col gap-3`}>
              <p className="m-0 text-base font-semibold leading-snug text-ink">
                {i + 1}. {byId.get(attempt.itemId)?.stem ?? t('Question')}
              </p>
              <div
                className={`rounded-xl p-3 ring-1 ${
                  attempt.isCorrect
                    ? 'bg-success-soft ring-success-line text-success-ink'
                    : 'bg-danger-soft ring-danger-line text-danger-ink'
                }`}
              >
                <p className="m-0 text-sm font-semibold">{attempt.isCorrect ? t('✓ Correct') : t('✗ Incorrect')}</p>
                <p className="text-sm m-0 mt-0.5 opacity-90">
                  {t('Your answer: {answer}', { answer: answerText(attempt.itemId, attempt.answerValue) || '—' })}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {summary.wrongCount > 0 && <Link to="/mistakes" className={linkButton}>{t('Retry my mistakes')}</Link>}
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
