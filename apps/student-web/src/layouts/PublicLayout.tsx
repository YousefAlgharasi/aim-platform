import { useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useRouteAccessibility } from '../hooks/useRouteAccessibility';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import '../features/landing/landing.css';

const wrap = 'mx-auto w-full max-w-7xl px-5 sm:px-8';

/**
 * Sign in, sign up and password recovery. Same language as the landing page: plain AIM wordmark,
 * hairline rules, one start-aligned form in a single centered column.
 */
export function PublicLayout() {
  const mainRef = useRef<HTMLElement>(null);
  // Auth forms manage their own focus (first invalid field), so only the tab title is kept in sync here.
  useRouteAccessibility(mainRef, { moveFocus: false });
  return (
    <div className="lp lp-auth lp-full flex min-h-[100dvh] flex-col bg-page text-ink">
      <header className="border-b border-line">
        <div className={`${wrap} flex h-16 items-center justify-between gap-3`}>
          <Link to="/welcome" className="text-[22px] font-bold leading-none tracking-tight text-ink no-underline rtl:tracking-normal">AIM</Link>
          <div className="flex items-center gap-1.5"><ThemeToggleButton /><LanguageSwitcher /></div>
        </div>
      </header>

      <main ref={mainRef} className="flex-1">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-10 sm:px-0 sm:py-16 lg:py-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
