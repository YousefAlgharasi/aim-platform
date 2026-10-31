import { NavLink } from 'react-router-dom';
import { BookIcon, ChartIcon, ChatIcon, HomeIcon, HamburgerMenuIcon } from '../components/common/Icons';
import { useI18n } from '../i18n/I18nContext';

interface MobileTabBarProps {
  onOpenMenu: () => void;
}

const TABS = [
  { to: '/', label: 'Home', end: true, icon: <HomeIcon className="size-5" /> },
  { to: '/curriculum', label: 'Courses', end: false, icon: <BookIcon className="size-5" /> },
  { to: '/ai-teacher', label: 'AI Teacher', end: false, icon: <ChatIcon className="size-5" /> },
  { to: '/progress', label: 'Progress', end: false, icon: <ChartIcon className="size-5" /> },
];

const TAB =
  'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 pt-2 pb-1.5 min-h-14 text-[11px] font-semibold leading-tight no-underline bg-transparent border-none cursor-pointer transition-colors';

/** Phone-only primary navigation: the four most-used destinations plus a "More" entry that opens the full menu. */
export function MobileTabBar({ onOpenMenu }: MobileTabBarProps) {
  const { t } = useI18n();
  return (
    <nav
      aria-label={t('Quick navigation')}
      className="md:hidden fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900/95"
    >
      {TABS.map(({ to, label, end, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `${TAB} ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300'}`
          }
        >
          {icon}
          <span className="max-w-full truncate">{t(label)}</span>
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onOpenMenu}
        className={`${TAB} text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300`}
      >
        <HamburgerMenuIcon className="size-5" />
        <span className="max-w-full truncate">{t('More')}</span>
      </button>
    </nav>
  );
}
