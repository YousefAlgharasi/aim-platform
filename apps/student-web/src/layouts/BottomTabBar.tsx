import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { tabItems } from './navItems';

/** Phone navigation: the four places students use most, plus "Menu" for everything else. */
export function BottomTabBar({ onMenu }: { onMenu: () => void }) {
  const { t } = useI18n();
  // Light tap feedback on phones that support it; silently ignored elsewhere.
  const tap = () => { try { navigator.vibrate?.(8); } catch { /* not supported */ } };
  const tab = 'group flex min-h-16 flex-1 select-none flex-col items-center justify-center gap-1 border-0 bg-transparent px-1 pb-1 pt-2 text-[11px] font-semibold no-underline [-webkit-tap-highlight-color:transparent] focus-visible:outline-none';
  // The icon sits in a pill: it fills with the brand color when active and squishes when pressed.
  const pill = (active: boolean) => `flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 ease-out group-active:scale-90 group-focus-visible:ring-2 group-focus-visible:ring-focus ${active ? 'bg-brand text-white shadow-sm' : 'bg-transparent text-ink-muted group-hover:bg-surface-strong'}`;
  return (
    <nav data-tour="nav" aria-label={t('Main navigation')} className="fixed inset-x-0 bottom-0 z-40 flex rounded-t-3xl shadow-[0_-2px_10px_rgba(0,0,0,0.12)] bg-surface pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      {tabItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={tap} className={tab}>
          {({ isActive }) => (
            <>
              <span aria-hidden="true" className={pill(isActive)}>{item.icon}</span>
              <span className={`max-w-full truncate transition-colors ${isActive ? 'text-brand-ink' : 'text-ink-muted'}`}>{t(item.label)}</span>
            </>
          )}
        </NavLink>
      ))}
      <button type="button" onClick={() => { tap(); onMenu(); }} aria-label={t('Open navigation menu')} className={`${tab} cursor-pointer`}>
        <span aria-hidden="true" className={pill(false)}>
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
        </span>
        <span className="text-ink-muted">{t('Menu')}</span>
      </button>
    </nav>
  );
}
