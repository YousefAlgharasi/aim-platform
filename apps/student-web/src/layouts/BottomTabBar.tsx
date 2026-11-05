import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { tabItems } from './navItems';

/** Phone navigation: the four places students use most, plus "Menu" for everything else. */
export function BottomTabBar({ onMenu }: { onMenu: () => void }) {
  const { t } = useI18n();
  const base = 'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 border-0 bg-transparent px-1 text-[11px] font-bold no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';
  return (
    <nav aria-label={t('Main navigation')} className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden dark:bg-elevated/90">
      {tabItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `${base} ${isActive ? 'text-brand-ink' : 'text-ink-muted'}`}
        >
          <span aria-hidden="true">{item.icon}</span>
          <span className="max-w-full truncate">{t(item.label)}</span>
        </NavLink>
      ))}
      <button type="button" onClick={onMenu} aria-label={t('Open navigation menu')} className={`${base} cursor-pointer text-ink-muted`}>
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
        <span>{t('Menu')}</span>
      </button>
    </nav>
  );
}
