import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOutIcon, SparkleIcon } from '../components/common/Icons';
import { navItems } from './navItems';
import { useI18n } from '../i18n/I18nContext';

/** Navigation list + user card. Rendered in the desktop sidebar and inside the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  async function handleLogout() {
    onNavigate?.();
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex flex-col h-full justify-between p-5 gap-4 overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <SparkleIcon className="size-[18px] text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            AIM
          </span>
        </div>

        <div className="rounded-2xl p-3.5 mb-5 border flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100 dark:from-slate-800 dark:to-slate-800 dark:border-slate-700">
          <div className="size-11 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm m-0 truncate text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-[11px] m-0 truncate text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5" aria-label={t('Main navigation')}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm no-underline transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800'
                }`
              }
            >
              <span className="shrink-0">{icon}</span>
              <span>{t(label)}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-xs font-bold text-red-500 bg-transparent border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
      >
        <LogOutIcon className="size-4" />
        {t('Log out')}
      </button>
    </div>
  );
}

export function Sidebar() {
  const { t } = useI18n();
  return (
    <aside
      aria-label={t('Sidebar')}
      className="hidden md:block w-64 shrink-0 sticky top-0 h-screen bg-white dark:bg-slate-900 border-e border-slate-100 dark:border-slate-800"
    >
      <SidebarContent />
    </aside>
  );
}
