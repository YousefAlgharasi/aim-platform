import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { AuthLogo } from '../../components/auth/AuthParts';
import { useI18n } from '../../i18n/I18nContext';

export function SessionExpiredPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <AuthLogo />
      <div className="my-auto text-center flex flex-col items-center gap-2">
        <h1 className="text-ink font-extrabold text-2xl tracking-tight m-0">{t('Session expired')}</h1>
        <p className="text-ink-muted text-sm leading-relaxed max-w-[280px]">
          {t('Your session has expired. Please sign in again to continue.')}
        </p>
      </div>
      <Button size="lg" fullWidth onClick={() => navigate('/login')}>{t('Sign in')}</Button>
    </>
  );
}
