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
          <div className="size-9 rounded-xl bg-gradient-to-br from-brand to-secondary flex items-center justify-center text-white shadow-md shadow-brand/20">
            <SparkleIcon className="size-[18px] text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
            AIM
          </span>
        </div>

        <div className="rounded-2xl p-3.5 mb-5 border flex items-center gap-3 bg-gradient-to-r from-brand-soft to-secondary-soft border-brand-line dark:from-surface dark:to-surface dark:border-line">
          <div className="size-11 shrink-0 rounded-2xl bg-gradient-to-br from-brand to-secondary flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm m-0 truncate text-ink">{user?.name}</p>
            <p className="text-xs m-0 truncate text-ink-muted">{user?.email}</p>
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
                    ? 'bg-brand-soft text-brand-ink'
                    : 'text-ink-soft hover:text-brand-ink hover:bg-brand-soft/70'
                }`
              }
            >
              <span className="shrink-0" aria-hidden="true">{icon}</span>
              <span>{t(label)}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-bold text-danger-ink bg-transparent border border-danger-line hover:bg-danger-soft cursor-pointer transition-colors"
      >
        <LogOutIcon className="size-4" aria-hidden="true" />
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
      className="hidden md:block w-64 shrink-0 sticky top-0 h-screen bg-surface dark:bg-elevated border-e border-line-subtle"
    >
      <SidebarContent />
    </aside>
  );
}
