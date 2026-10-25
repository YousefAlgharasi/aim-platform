import { AuthAudioPlayer } from '../lessons/AuthAudioPlayer';
import { fetchQuestionAudio, type SessionQuestion } from './practiceApi';
import styles from './QuestionRenderer.module.css';

interface QuestionRendererProps {
  question: SessionQuestion;
  /** Selected option id (option-based questions) or the typed answer. */
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
  disabled: boolean;
}

/**
 * Renders a backend-delivered session question (GET /sessions/:id/questions).
 * Option-based questions submit the option id verbatim (as Flutter does);
 * the backend evaluates correctness — nothing is scored here.
 */
export function QuestionRenderer({ question, selectedAnswer, onAnswerChange, disabled }: QuestionRendererProps) {
  const options = [...question.options].sort((a, b) => a.order - b.order);
  const isOptionBased = options.length > 0;
  const isListening = question.type === 'listening_choice';
  const isLongText = !isOptionBased && question.type === 'free_text';

  return (
    <div className={styles.question}>
      <p className={styles.questionText}>{question.stem}</p>

      {isListening && (
        <AuthAudioPlayer load={() => fetchQuestionAudio(question.id)} label="Play recording" />
      )}

      {isOptionBased && (
        <fieldset className={styles.options}>
          <legend className={styles.srOnly}>Select your answer</legend>
          {options.map(option => (
            <label
              key={option.id}
              className={`${styles.option} ${selectedAnswer === option.id ? styles.optionSelected : ''} ${disabled ? styles.optionDisabled : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={selectedAnswer === option.id}
                onChange={() => onAnswerChange(option.id)}
                disabled={disabled}
                className={styles.srOnly}
              />
              <span className={styles.optionRadio} aria-hidden="true" />
              <span>{option.text}</span>
            </label>
          ))}
        </fieldset>
      )}

      {!isOptionBased && !isLongText && (
        <input
          type="text"
          className={styles.textInput}
          value={selectedAnswer}
          onChange={e => onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer…"
          aria-label="Your answer"
          autoComplete="off"
        />
      )}

      {isLongText && (
        <textarea
          className={styles.textInput}
          value={selectedAnswer}
          onChange={e => onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer…"
          rows={4}
          aria-label="Your answer"
        />
      )}
    </div>
  );
}
