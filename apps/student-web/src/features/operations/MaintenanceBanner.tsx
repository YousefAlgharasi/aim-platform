import { useEffect, useState } from 'react';
import { Banner } from '../../components/common/Banner';
import { useI18n } from '../../i18n/I18nContext';
import { fetchMaintenanceWindows, pickRelevantWindow, type MaintenanceWindow } from './maintenanceApi';

/** Shows the admin-scheduled maintenance notice (Admin → Operations → Maintenance) to students. Fails silently. */
export function MaintenanceBanner() {
  const { t, formatDateTime } = useI18n();
  const [win, setWin] = useState<MaintenanceWindow | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchMaintenanceWindows()
        .then((w) => alive && setWin(pickRelevantWindow(w)))
        .catch(() => undefined);
    };
    load();
    const id = window.setInterval(load, 5 * 60 * 1000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  if (!win || dismissed === win.id) return null;
  const active = win.status === 'in_progress' && new Date(win.scheduledStart).getTime() <= Date.now();
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-3">
      <Banner variant="warning">
        <div className="flex items-start justify-between gap-3">
          <span className="[unicode-bidi:plaintext]">
            <strong className="font-bold">{win.userMessage || win.title}</strong>{' '}
            {active
              ? t('Maintenance is in progress.')
              : t('Scheduled maintenance: {start}', { start: formatDateTime(win.scheduledStart) })}
          </span>
          <button
            type="button"
            onClick={() => setDismissed(win.id)}
            aria-label={t('Dismiss')}
            className="shrink-0 border-none bg-transparent text-inherit cursor-pointer font-bold px-2 -my-1 h-8 rounded-lg hover:bg-black/5"
          >
            ✕
          </button>
        </div>
      </Banner>
    </div>
  );
}
