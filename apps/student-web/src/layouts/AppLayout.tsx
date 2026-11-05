import { useNeedsOnboarding } from '../features/learner/onboardingState';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { isFocusPath } from './focusMode';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlacementGate } from '../features/placement/placementApi';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomTabBar } from './BottomTabBar';
import { ThemeToggleButton } from '../components/common/ThemeToggleButton';
import { BackButton } from '../components/common/BackButton';
import { PageChromeProvider, usePageChrome } from '../components/common/PageTitleBar';
import { MobileDrawer } from './MobileDrawer';
import { MaintenanceBanner } from '../features/operations/MaintenanceBanner';
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
/**
 * Pages that get no automatic back arrow: Home, the course page (/curriculum/:id, which has its
 * floating course card instead), and pages that render their own BackButton (Courses list, lessons).
 */
const NO_AUTO_BACK = /^(\/|\/dashboard|\/curriculum|\/curriculum\/[^/]+|\/lessons\/[^/]+)\/?$/;

const TAB_BAR_HIDDEN = /^\/(ai-teacher\/|voice-teacher|lessons\/|practice\/(?!speaking|writing)|placement\/|assessments\/[^/]+\/attempt\/|billing\/checkout\/)/;

export function AppLayout() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Reading/exercise screens: collapse the sidebar to its icon rail and narrow the column so the lesson is the focus.
  const focusMode = isFocusPath(pathname);
  const mainRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const section = navItems.find((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)));
  useRouteAccessibility(mainRef, { fallbackTitle: section ? t(section.label) : undefined });
  const showTabBar = !TAB_BAR_HIDDEN.test(pathname);
  const { hasTitleBar, chrome } = usePageChrome();

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
    setGateDone(readFlag(gateDoneKey));
  }, [gateDoneKey]);

  useEffect(() => {
    if (!gateDoneKey || gateDone || gate.loading || gate.error || gate.shouldShowGate) return;
    writeFlag(gateDoneKey);
    setGateDone(true);
  }, [gateDoneKey, gateDone, gate.loading, gate.error, gate.shouldShowGate]);

  // After the placement gate is settled, a student with no study plan is offered the 3-question setup once.
  const needsOnboarding = useNeedsOnboarding(isStudent && gateDone && !gate.shouldShowGate, user?.id);
  useEffect(() => {
    if (needsOnboarding && pathname === '/') navigate('/onboarding', { replace: true });
  }, [needsOnboarding, pathname, navigate]);

  useEffect(() => {
    if (gate.shouldShowGate && !onPlacementPath) {
      navigate('/placement/gate', { replace: true });
    }
  }, [gate.shouldShowGate, onPlacementPath, navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-page text-ink">
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[60] focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:no-underline focus:shadow-lg"
      >
        {t('Skip to main content')}
      </a>
      <Sidebar forceCollapsed={focusMode} />
      <MobileDrawer open={menuOpen} onClose={closeMenu} />

      <div className="flex-1 flex flex-col min-w-0">
        <OfflineBanner />
        <MaintenanceBanner />
        {showTabBar && <TopBar />}
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 outline-none md:pb-8 pb-24 transition-[max-width] duration-300 ${focusMode ? 'max-w-3xl' : 'max-w-5xl'}`}
        >
          <PageChromeProvider value={chrome}>
            {!showTabBar && <div className="-mt-3 mb-2 flex justify-end"><ThemeToggleButton /></div>}
            {!hasTitleBar && !NO_AUTO_BACK.test(pathname) && <BackButton className="mb-4" />}
            <Outlet />
          </PageChromeProvider>
        </main>

        {showTabBar && <BottomTabBar onMenu={() => setMenuOpen(true)} />}
      </div>
    </div>
  );
}
