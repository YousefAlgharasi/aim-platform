import { NavLink } from 'react-router-dom';
import { mobileNavItems } from './navItems';

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]"
    >
      {mobileNavItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 min-h-14 py-2 text-[11px] font-semibold no-underline transition-colors ${
              isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`
          }
        >
          {icon}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
