import { Outlet } from 'react-router-dom';

// Auth screens sit in the same 393px rounded "device" shell as design-prototype's MobileShell
// on desktop, and go full-bleed on phones.
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#E8EAF0] dark:bg-slate-950 flex items-center justify-center p-0 sm:p-4">
      <main className="relative w-full sm:max-w-[420px] min-h-screen sm:min-h-[720px] sm:max-h-[900px] flex flex-col overflow-y-auto sm:rounded-[40px] sm:shadow-2xl bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 pt-10 gap-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
