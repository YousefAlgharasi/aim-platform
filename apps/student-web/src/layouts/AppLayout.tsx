import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlacementGate } from '../features/placement/placementApi';
import { Sidebar, SidebarContent } from './Sidebar';
import { TopBar } from './TopBar';
import { useI18n } from '../i18n/I18nContext';

function readFlag(key: string | null): boolean {
  if (!key) return false;
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // Storage unavailable — the check simply runs again next visit.
  }
}

// Full-screen flows (chat, voice, lessons, practice, test attempts) hide the floating menu
// button so it never covers their input/action bars — same as the prototype's sub-screens.
const FAB_HIDDEN = /^\/(ai-teacher\/|voice-teacher|lessons\/|practice\/|placement\/|assessments\/[^/]+\/attempt\/|billing\/checkout\/)/;

export function AppLayout() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // First-login gate (Flutter parity): students who haven't chosen between the
  // placement test and starting from scratch are sent to the choice screen once.
  const isStudent = !!user?.roles.includes('student');
  // Once the backend says the gate no longer applies it never comes back, so remember that
  // per user in this browser and skip the (slow, cross-region) check on later visits.
  const gateDoneKey = user ? `aim_placement_gate_done:${user.id}` : null;
  const [gateDone, setGateDone] = useState(() => readFlag(gateDoneKey));
  const gate = usePlacementGate(isStudent && !gateDone);
  const onPlacementPath = pathname.startsWith('/placement');

  useEffect(() => {
    if (!gateDoneKey || gateDone || gate.loading || gate.error || gate.shouldShowGate) return;
    writeFlag(gateDoneKey);
    setGateDone(true);
  }, [gateDoneKey, gateDone, gate.loading, gate.error, gate.shouldShowGate]);

  useEffect(() => {
    if (gate.shouldShowGate && !onPlacementPath) {
      navigate('/placement/gate', { replace: true });
    }
  }, [gate.shouldShowGate, onPlacementPath, navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Sidebar />

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label={t('Close menu')}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 border-none bg-slate-900/40 backdrop-blur-sm cursor-default"
          />
          <div className="relative w-4/5 max-w-[300px] h-full shadow-2xl bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t('Close menu')}
              className="absolute top-5 end-5 z-10 size-8 rounded-full flex items-center justify-center border-none cursor-pointer bg-slate-100 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {!menuOpen && !FAB_HIDDEN.test(pathname) && (
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t('Open navigation menu')}
          title={t('Open navigation menu')}
          className="md:hidden fixed bottom-6 end-6 z-40 size-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/35 flex items-center justify-center border-none cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
