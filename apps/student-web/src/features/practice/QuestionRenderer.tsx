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
  'w-full rounded-[14px] px-4 py-3 text-base bg-surface text-ink ring-1 ring-line border-0 outline-none focus:ring-2 focus:ring-focus disabled:opacity-70';

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
            <span className="text-brand-ink font-bold text-xs uppercase tracking-wider block mb-2">
              {t('Question {n} of {total}', { n: questionNumber, total: questionTotal })}
            </span>
          )}
          <p className="text-ink font-bold text-lg leading-snug m-0">{question.stem}</p>
        </div>
        {isListening && (
          <AuthAudioPlayer load={() => fetchQuestionAudio(question.id)} label={t('Play recording')} />
        )}
      </div>

      {isOptionBased && (
        <fieldset className="flex flex-col gap-2.5 border-0 p-0 m-0 min-w-0">
          <legend className="sr-only">{t('Select your answer')}</legend>
          {options.map(option => {
            const isSelected = selectedAnswer === option.id;
            let cardStyle =
              'bg-surface ring-1 ring-line/80 hover:ring-brand-line text-ink';
            if (isSelected && disabled && result === true) {
              cardStyle = 'bg-success-soft ring-2 ring-success text-success-ink';
            } else if (isSelected && disabled && result === false) {
              cardStyle = 'bg-danger-soft ring-2 ring-danger text-danger-ink';
            } else if (isSelected) {
              cardStyle = 'bg-brand-soft/50 ring-2 ring-brand-ink text-brand-ink';
            }
            return (
              <label
                key={option.id}
                className={`relative w-full p-4 rounded-2xl text-start font-bold text-sm transition-all duration-200 flex items-center justify-between gap-3 focus-within:outline focus-within:outline-2 focus-within:outline-brand-ink ${cardStyle} ${
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
                <span>{option.text}</span>
                {isSelected && disabled && result === true && (
                  <CheckIcon className="size-5 text-success-ink shrink-0" />
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
