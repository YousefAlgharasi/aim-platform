import { Button } from './Button';
import { useI18n } from '../../i18n/I18nContext';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useI18n();
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-100 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/30 p-6 flex flex-col items-center text-center gap-2"
    >
      <h3 className="m-0 text-base font-bold text-red-600 dark:text-red-400">{t('Something went wrong')}</h3>
      <p className="m-0 text-sm text-red-600/80 dark:text-red-300/80 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-2">
          <Button variant="secondary" onClick={onRetry}>{t('Try again')}</Button>
        </div>
      )}
    </div>
  );
}
