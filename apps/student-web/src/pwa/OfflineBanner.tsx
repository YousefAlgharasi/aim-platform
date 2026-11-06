import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

/** A slim bar when the connection drops, so a failed request is not a mystery. */
export function OfflineBanner() {
  const { t } = useI18n();
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-50 bg-warning-soft px-4 py-2 text-center text-sm font-bold text-warning-ink ring-1 ring-warning-line">
      {t('You are offline. Lessons you have already opened may still play; progress syncs when you reconnect.')}
    </div>
  );
}
