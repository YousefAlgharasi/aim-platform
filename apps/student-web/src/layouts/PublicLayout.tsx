import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';

// Auth screens sit in the same 393px rounded "device" shell as design-prototype's MobileShell
// on desktop, and go full-bleed on phones. The page itself scrolls (no clipped inner scroller),
// and the footer link (Create account / Log in / Back to Sign In) sits right under the form, so it is
// never pushed below the fold on short screens.
export function PublicLayout() {
  return (
    <div className="min-h-[100dvh] bg-[#E8EAF0] dark:bg-slate-950 flex items-start sm:items-center justify-center p-0 sm:p-4">
      <main className="relative w-full sm:max-w-[420px] min-h-[100dvh] sm:min-h-[640px] flex flex-col sm:rounded-[40px] sm:shadow-2xl bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute top-4 end-4 z-10">
          <LanguageSwitcher />
        </div>
        <div className="flex-1 flex flex-col p-6 sm:p-7 pt-8 sm:pt-10 pb-8 gap-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
