import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOutIcon } from '../components/common/Icons';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import { navSections } from './navItems';
import { useI18n } from '../i18n/I18nContext';

const COLLAPSE_KEY = 'aim_sidebar_collapsed';

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(v: boolean) {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, v ? '1' : '0');
  } catch {
    /* storage unavailable: the toggle still works for this session */
  }
}

/** Panel-toggle icon; flips with text direction so it always points at the sidebar edge. */
function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={`size-5 transition-transform duration-300 rtl:rotate-180 ${collapsed ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M9 4v16" />
      <path d="m16 9-3 3 3 3" />
    </svg>
  );
}

/**
 * Navigation list + user card. Rendered in the desktop sidebar and inside the mobile drawer.
 * `collapsed` (desktop only) shrinks it to an icon rail; `onToggle` shows the collapse button.
 */
export function SidebarContent({
  onNavigate,
  collapsed = false,
  onToggle,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  async function handleLogout() {
    onNavigate?.();
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className={`flex flex-col h-full min-h-0 pb-4 gap-4 ${collapsed ? 'p-3' : 'p-5'}`}>
      <div className="shrink-0">
        <div className={`flex mb-6 ${collapsed ? 'flex-col items-center gap-3' : 'items-center gap-2'}`}>
          {!collapsed && (
            <Link to="/" onClick={onNavigate} aria-label="AIM" className="font-bold text-[22px] leading-none tracking-tight text-ink no-underline rtl:tracking-normal">
              AIM
            </Link>
          )}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? t('Expand sidebar') : t('Collapse sidebar')}
              aria-expanded={!collapsed}
              title={collapsed ? t('Expand sidebar') : t('Collapse sidebar')}
              className={`${collapsed ? '' : 'ms-auto'} size-10 shrink-0 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent text-ink-muted hover:text-ink hover:bg-surface-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`}
            >
              <CollapseIcon collapsed={collapsed} />
            </button>
          )}
        </div>

        {collapsed ? (
          <div
            className="mx-auto mb-3 size-11 rounded-full bg-ink flex items-center justify-center text-ink-inverse font-semibold text-base"
            title={user?.name ?? undefined}
            aria-hidden="true"
          >
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
        ) : (
          <Link to="/profile" onClick={onNavigate} aria-label={t('Profile')} className="mb-5 flex items-center gap-3 border-y border-line py-3.5 no-underline transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            <div className="size-11 shrink-0 rounded-full bg-ink flex items-center justify-center text-ink-inverse font-semibold text-base">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm m-0 truncate text-ink">{user?.name}</p>
              <p className="text-xs m-0 truncate text-ink-muted">{user?.email}</p>
            </div>
          </Link>
        )}
      </div>

      <nav
        className={`flex-1 min-h-0 overflow-y-auto -mx-2 px-2 flex flex-col [scrollbar-width:thin] ${collapsed ? 'gap-2' : 'gap-5'}`}
        aria-label={t('Main navigation')}
      >
        {navSections.map((section, idx) => (
          <div
            key={section.title}
            role="group"
            aria-labelledby={`nav-section-${idx}`}
            className={idx > 0 ? (collapsed ? 'pt-2 border-t border-line-subtle' : 'pt-4 border-t border-line-subtle') : ''}
          >
            <h2
              id={`nav-section-${idx}`}
              className={collapsed ? 'sr-only' : 'm-0 mb-1.5 px-3.5 text-xs font-medium text-ink-muted'}
            >
              {t(section.title)}
            </h2>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {section.items.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={onNavigate}
                    title={collapsed ? t(label) : undefined}
                    aria-label={collapsed ? t(label) : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center rounded-lg ${collapsed ? 'justify-center h-11' : 'gap-3.5 px-3.5 py-2.5'} font-medium text-[15px] no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                        isActive
                          ? 'bg-brand-soft font-semibold text-brand-ink before:absolute before:start-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-brand'
                          : 'text-ink-muted hover:bg-brand-soft hover:text-brand-ink'
                      }`
                    }
                  >
                    <span className="shrink-0" aria-hidden="true">{icon}</span>
                    {!collapsed && <span className="truncate">{t(label)}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={`shrink-0 mb-2 grid gap-2 ${collapsed ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <ThemeToggleButton variant="pill" showLabel={!collapsed} />
        <LanguageSwitcher variant="pill" showLabel={!collapsed} />
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        title={collapsed ? t('Log out') : undefined}
        aria-label={t('Log out')}
        className="shrink-0 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-transparent h-11 text-sm font-semibold text-ink-soft ring-1 ring-line-strong transition-colors hover:bg-danger-soft hover:text-danger-ink hover:ring-danger-line"
      >
        <LogOutIcon className={collapsed ? 'size-5' : 'size-4'} aria-hidden="true" />
        {!collapsed && t('Log out')}
      </button>
    </div>
  );
}

export function Sidebar({ forceCollapsed = false }: { forceCollapsed?: boolean }) {
  const { t } = useI18n();
  const [collapsedPref, setCollapsed] = useState(readCollapsed);
  // Focus screens (lessons, practice) start collapsed without changing the saved preference, but can still be opened.
  const [focusExpanded, setFocusExpanded] = useState(false);
  useEffect(() => {
    if (!forceCollapsed) setFocusExpanded(false);
  }, [forceCollapsed]);
  const collapsed = forceCollapsed ? !focusExpanded : collapsedPref;

  function toggle() {
    if (forceCollapsed) {
      setFocusExpanded((v) => !v);
      return;
    }
    setCollapsed((c) => {
      writeCollapsed(!c);
      return !c;
    });
  }

  return (
    <aside
      data-tour="nav"
      aria-label={t('Sidebar')}
      className={`hidden md:block shrink-0 sticky top-0 z-10 h-screen overflow-hidden bg-page border-e border-line shadow-[1px_0_4px_rgba(0,0,0,0.06)] rtl:shadow-[-1px_0_4px_rgba(0,0,0,0.06)] transition-[width] duration-300 ease-in-out motion-reduce:transition-none ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <SidebarContent collapsed={collapsed} onToggle={toggle} />
    </aside>
  );
}
