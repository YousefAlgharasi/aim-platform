import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Banner } from '../../components/common/Banner';
import { Button } from '../../components/common/Button';
import type { SessionQuestion, SessionSummary } from './practiceApi';
import styles from './Practice.module.css';

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
  const byId = new Map(questions.map(q => [q.id, q]));
  const lessonState = { courseId };

  function answerText(itemId: string, answerValue: string) {
    const option = byId.get(itemId)?.options.find(o => o.id === answerValue);
    return option?.text ?? answerValue;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sessionHeader}>
        <h1 className={styles.heading}>Practice complete</h1>
        {lessonTitle && <span className={styles.sessionMeta}>{lessonTitle}</span>}
      </div>

      <Card>
        <div className={styles.resultContent}>
          <span className={styles.resultScore}>{summary.correctCount}/{summary.totalAttempts}</span>
          <p className={styles.resultSummary}>
            {summary.accuracyPercent}% accuracy · {summary.correctCount} correct, {summary.wrongCount} to review
          </p>
        </div>
      </Card>

      {completion === 'saving' && <Banner variant="info">Saving your lesson progress…</Banner>}
      {completion === 'saved' && <Banner variant="success">Lesson completed — the next lesson is unlocked.</Banner>}
      {completion === 'failed' && (
        <Banner variant="warning">
          <div className={styles.bannerRow}>
            <span>{completionError || "We couldn't mark this lesson as complete."}</span>
            <Button size="sm" variant="secondary" onClick={onRetryCompletion}>Retry</Button>
          </div>
        </Banner>
      )}

      {summary.attempts.length > 0 && (
        <section className={styles.reviewSection}>
          <h2 className={styles.subheading}>Your answers</h2>
          {summary.attempts.map((attempt, i) => (
            <Card key={`${attempt.itemId}-${i}`}>
              <div className={styles.entryContent}>
                <p className={styles.reviewStem}>
                  {i + 1}. {byId.get(attempt.itemId)?.stem ?? 'Question'}
                </p>
                <div
                  className={`${styles.feedbackCard} ${attempt.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}
                >
                  <p className={styles.feedbackTitle}>{attempt.isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
                  <p className={styles.feedbackExplanation}>
                    Your answer: {answerText(attempt.itemId, attempt.answerValue) || '—'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onPracticeAgain}>Practice again</Button>
        <Link to={`/lessons/${lessonId}`} state={lessonState} className={styles.linkButton}>
          Back to lesson
        </Link>
        <Link to={courseId ? `/curriculum/${courseId}` : '/curriculum'} className={styles.linkButtonPrimary}>
          Continue course
        </Link>
      </div>
    </div>
  );
}
