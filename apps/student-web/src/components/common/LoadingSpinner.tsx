import { SpinnerIcon } from './Icons';
import { useI18n } from '../../i18n/I18nContext';

export function LoadingSpinner() {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-center p-10" role="status" aria-label={t('Loading')}>
      <SpinnerIcon className="size-9 text-brand-ink" />
    </div>
  );
}
