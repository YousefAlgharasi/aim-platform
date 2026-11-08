import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { useI18n } from '../../i18n/I18nContext';

export function SessionExpiredPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <div className="flex flex-col items-start gap-2 text-start">
        <h1 className="lp-display m-0 text-[2.25rem] font-semibold text-ink rtl:text-3xl">{t('Session expired')}</h1>
        <p className="m-0 mt-3 max-w-sm text-base leading-relaxed text-ink-muted">
          {t('Your session has expired. Please sign in again to continue.')}
        </p>
      </div>
      <Button size="lg" fullWidth className="!rounded-full !tracking-normal" onClick={() => navigate('/login')}>{t('Sign in')}</Button>
    </>
  );
}
