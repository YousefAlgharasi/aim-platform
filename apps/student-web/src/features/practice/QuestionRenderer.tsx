import { AuthAudioPlayer } from '../lessons/AuthAudioPlayer';
import { CheckIcon } from '../../components/common/Icons';
import { fetchQuestionAudio, type SessionQuestion } from './practiceApi';
import { useI18n } from '../../i18n/I18nContext';
import { questionCard } from './practiceStyles';

interface QuestionRendererProps {
  question: SessionQuestion;
  /** Selected option id (option-based questions) or the typed answer. */
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
  disabled: boolean;
  /** 1-based position, shown in the question card eyebrow. */
  questionNumber?: number;
  questionTotal?: number;
  /** Backend verdict for the selected answer once submitted (undefined while answering). */
  result?: boolean;
}

const INPUT_CLS =
  'w-full rounded-xl px-4 py-3 text-base bg-transparent text-ink ring-1 ring-line-strong border-0 outline-none focus:ring-2 focus:ring-brand disabled:opacity-70';

/**
 * Renders a backend-delivered session question (GET /sessions/:id/questions).
 * Option-based questions submit the option id verbatim (as Flutter does);
 * the backend evaluates correctness — nothing is scored here.
 */
export function QuestionRenderer({
  question,
  selectedAnswer,
  onAnswerChange,
  disabled,
  questionNumber,
  questionTotal,
  result,
}: QuestionRendererProps) {
  const { t } = useI18n();
  const options = [...question.options].sort((a, b) => a.order - b.order);
  const isOptionBased = options.length > 0;
  const isListening = question.type === 'listening_choice';
  const isLongText = !isOptionBased && question.type === 'free_text';

  return (
    <div className="flex flex-col gap-4">
      <div className={`${questionCard} flex flex-col gap-3`}>
        <div>
          {questionNumber != null && questionTotal != null && (
            <span className="mb-2 block text-sm text-ink-muted">
              {t('Question {n} of {total}', { n: questionNumber, total: questionTotal })}
            </span>
          )}
          <p className="m-0 text-2xl font-semibold leading-snug text-ink [unicode-bidi:plaintext]">{question.stem}</p>
        </div>
        {isListening && (
          <AuthAudioPlayer load={() => fetchQuestionAudio(question.id)} label={t('Play recording')} />
        )}
      </div>

      {isOptionBased && (
        <fieldset className="flex flex-col gap-2.5 border-0 p-0 m-0 min-w-0">
          <legend className="sr-only">{t('Select your answer')}</legend>
          {options.map((option, optIndex) => {
            const isSelected = selectedAnswer === option.id;
            let cardStyle =
              'bg-surface ring-1 ring-line hover:bg-surface-muted hover:ring-line-strong text-ink';
            if (isSelected && disabled && result === true) {
              cardStyle = 'bg-success-soft ring-2 ring-success text-success-ink';
            } else if (isSelected && disabled && result === false) {
              cardStyle = 'bg-danger-soft ring-2 ring-danger text-danger-ink';
            } else if (isSelected) {
              cardStyle = 'bg-surface ring-2 ring-brand text-ink';
            }
            return (
              <label
                key={option.id}
                className={`relative w-full p-4 rounded-2xl text-start font-medium text-base transition-colors duration-200 flex items-center justify-between gap-3 focus-within:outline focus-within:outline-2 focus-within:outline-brand ${cardStyle} ${
                  disabled ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onAnswerChange(option.id)}
                  disabled={disabled}
                  className="sr-only"
                />
                <span className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${isSelected ? (disabled ? 'bg-white/70 text-current dark:bg-black/30' : 'bg-brand text-white') : 'bg-surface-strong text-ink-soft'}`}>
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className="min-w-0 [unicode-bidi:plaintext]">{option.text}</span>
                </span>
                {isSelected && disabled && result === true && (
                  <CheckIcon className="ix-pop size-5 text-success-ink shrink-0" />
                )}
              </label>
            );
          })}
        </fieldset>
      )}

      {!isOptionBased && !isLongText && (
        <input
          type="text"
          className={`${INPUT_CLS} h-[54px]`}
          value={selectedAnswer}
          onChange={e => onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder={t('Type your answer…')}
          aria-label={t('Your answer')}
          autoComplete="off"
        />
      )}

      {isLongText && (
        <textarea
          className={INPUT_CLS}
          value={selectedAnswer}
          onChange={e => onAnswerChange(e.target.value)}
          disabled={disabled}
          placeholder={t('Type your answer…')}
          rows={4}
          aria-label={t('Your answer')}
        />
      )}
    </div>
  );
}
