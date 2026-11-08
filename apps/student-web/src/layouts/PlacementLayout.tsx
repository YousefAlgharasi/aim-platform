import { Outlet } from 'react-router-dom';
import { HideBackContext } from '../components/common/PageTitleBar';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';
import '../features/landing/landing.css';

/**
 * Full-screen shell for the placement test: no sidebar, drawer, tab bar, back arrow or exit. The only
 * ways out are finishing the test or the guard rules in SetupGuard. Same editorial look as the landing
 * and sign-in pages (plain AIM wordmark, hairline rule, one reading column).
 */
export function PlacementLayout() {
  return (
    <div className="lp lp-auth lp-full flex min-h-screen flex-col bg-page text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
          <span className="text-[22px] font-bold leading-none tracking-tight text-ink rtl:tracking-normal">AIM</span>
          <div className="flex items-center gap-1.5">
            <ThemeToggleButton />
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <HideBackContext.Provider value><Outlet /></HideBackContext.Provider>
      </main>
    </div>
  );
}
