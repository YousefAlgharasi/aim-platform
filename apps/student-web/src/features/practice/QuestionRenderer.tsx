import styles from './QuestionRenderer.module.css';

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer';
  text: string;
  choices?: Choice[];
}

interface QuestionRendererProps {
  question: Question;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
  disabled: boolean;
}

export function QuestionRenderer({ question, selectedAnswer, onAnswerChange, disabled }: QuestionRendererProps) {
  return (
    <div>
      <p className={styles.questionText}>{question.text}</p>

      {(question.type === 'multiple_choice' || question.type === 'true_false') && question.choices && (
        <fieldset className={styles.options}>
          <legend className={styles.srOnly}>Select your answer</legend>
          {question.choices.map(choice => (
            <label
              key={choice.id}
              className={`${styles.option} ${selectedAnswer === choice.id ? styles.optionSelected : ''} ${disabled ? styles.optionDisabled : ''}`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={choice.id}
                checked={selectedAnswer === choice.id}
                onChange={() => onAnswerChange(choice.id)}
                disabled={disabled}
                className={styles.srOnly}
              />
              <span className={styles.optionRadio} aria-hidden="true" />
              <span>{choice.text}</span>
            </label>
          ))}
        </fieldset>
      )}

      {question.type === 'fill_blank' && (
        <input
          type="text"
          className={styles.textInput}
          value={selectedAnswer}
          onChange={e => onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder="Type your answer…"
          aria-label="Your answer"
        />
      )}

      {question.type === 'short_answer' && (
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
