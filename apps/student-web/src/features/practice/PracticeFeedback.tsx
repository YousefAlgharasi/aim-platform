import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import styles from './Practice.module.css';

interface Mistake {
  questionText: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface PracticeFeedbackData {
  score: number;
  total: number;
  summary: string;
  mistakes: Mistake[];
  nextActions: Array<{
    id: string;
    title: string;
    type: 'practice' | 'lesson' | 'review';
  }>;
}

interface PracticeFeedbackProps {
  feedback: PracticeFeedbackData;
}

export function PracticeFeedback({ feedback }: PracticeFeedbackProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Practice Complete</h1>

      <Card>
        <div className={styles.resultContent}>
          <span className={styles.resultScore}>{feedback.score}/{feedback.total}</span>
          <p className={styles.resultSummary}>{feedback.summary}</p>
        </div>
      </Card>

      {feedback.mistakes.length > 0 && (
        <section>
          <h2 className={styles.heading} style={{ fontSize: 'var(--type-h2-size, 22px)' }}>
            Review Mistakes
          </h2>
          {feedback.mistakes.map((mistake, i) => (
            <Card key={i}>
              <div className={styles.entryContent}>
                <p style={{ fontWeight: 'var(--weight-semibold, 600)', margin: 0 }}>
                  {mistake.questionText}
                </p>
                <div className={`${styles.feedbackCard} ${styles.feedbackIncorrect}`}>
                  <p className={styles.feedbackTitle}>Your answer: {mistake.yourAnswer}</p>
                  <p className={styles.feedbackExplanation}>
                    Correct: {mistake.correctAnswer}
                  </p>
                </div>
                <p className={styles.description}>{mistake.explanation}</p>
              </div>
            </Card>
          ))}
        </section>
      )}

      {feedback.nextActions.length > 0 && (
        <section>
          <h2 className={styles.heading} style={{ fontSize: 'var(--type-h2-size, 22px)' }}>
            Next Steps
          </h2>
          {feedback.nextActions.map(action => (
            <Card key={action.id}>
              <Link
                to={action.type === 'lesson' ? `/lessons/${action.id}` : `/practice/${action.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className={styles.entryContent}>
                  <span className={styles.sessionMeta}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary-500, #8455E4)', fontWeight: 600, fontSize: '12px' }}>
                      {action.type}
                    </span>
                  </span>
                  <span style={{ fontWeight: 'var(--weight-medium, 500)' }}>{action.title}</span>
                </div>
              </Link>
            </Card>
          ))}
        </section>
      )}

      <Link to="/dashboard">
        <Button variant="primary" fullWidth>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
