import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlacementGate } from '../features/placement/placementApi';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';
import { MobileTabBar } from './MobileTabBar';
import { navItems } from './navItems';
import { useRouteAccessibility } from '../hooks/useRouteAccessibility';
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

// Full-screen flows (chat, voice, lessons, practice, test attempts) hide the bottom tab bar
// so it never covers their input/action bars — same as the prototype's sub-screens.
const TAB_BAR_HIDDEN = /^\/(ai-teacher\/|voice-teacher|lessons\/|practice\/|placement\/|assessments\/[^/]+\/attempt\/|billing\/checkout\/)/;

export function AppLayout() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const section = navItems.find((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)));
  useRouteAccessibility(mainRef, { fallbackTitle: section ? t(section.label) : undefined });
  const showTabBar = !TAB_BAR_HIDDEN.test(pathname);

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
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[60] focus:rounded-xl focus:bg-indigo-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:no-underline focus:shadow-lg"
      >
        {t('Skip to main content')}
      </a>
      <Sidebar />
      <MobileDrawer open={menuOpen} onClose={closeMenu} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className={`flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 outline-none md:pb-8 ${showTabBar ? 'pb-24' : 'pb-8'}`}
        >
          <Outlet />
        </main>
      </div>

      {showTabBar && <MobileTabBar onOpenMenu={() => setMenuOpen(true)} />}
    </div>
  );
}
