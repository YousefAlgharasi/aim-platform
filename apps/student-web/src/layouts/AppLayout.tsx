import { OfflineBanner } from '../pwa/OfflineBanner';
import { isFocusPath } from './focusMode';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomTabBar } from './BottomTabBar';
import { BackButton } from '../components/common/BackButton';
import { PageChromeProvider, usePageChrome } from '../components/common/PageTitleBar';
import { MobileDrawer } from './MobileDrawer';
import { MaintenanceBanner } from '../features/operations/MaintenanceBanner';
import { navItems } from './navItems';
import { useRouteAccessibility } from '../hooks/useRouteAccessibility';
import { useI18n } from '../i18n/I18nContext';
import { StreakCelebrationHost } from '../interaction';
import { GuidedTour } from '../features/tour/GuidedTour';
import '../features/landing/landing.css';

// Full-screen flows (chat, voice, lessons, practice, test attempts) hide the bottom tab bar
// so it never covers their input/action bars — same as the prototype's sub-screens.
/**
 * The only page that needs the layout's back arrow: the AI chat, which has its own header but no way back.
 * Every other page either draws a PageTitleBar (which decides for itself) or has its own exit. The decision is made
 * from the URL alone, so the arrow never appears while a page is still loading and then vanishes.
 */
const AUTO_BACK = /^\/ai-teacher\/(?!history\/?$)[^/]+\/?$/;

const TAB_BAR_HIDDEN = /^\/(ai-teacher\/|voice-teacher|lessons\/|practice\/(?!speaking|writing)|improve\/retry\/|placement\/|assessments\/[^/]+\/attempt\/|billing\/checkout\/)/;

export function AppLayout() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Reading/exercise screens: collapse the sidebar to its icon rail so the lesson is the focus.
  const focusMode = isFocusPath(pathname);
  const mainRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const section = navItems.find((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)));
  useRouteAccessibility(mainRef, { fallbackTitle: section ? t(section.label) : undefined });
  const showTabBar = !TAB_BAR_HIDDEN.test(pathname);
  const { chrome } = usePageChrome();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="lp lp-auth flex min-h-screen bg-page text-ink">
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
        <TopBar />
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 outline-none md:pb-8 pb-24"
        >
          <PageChromeProvider value={chrome}>
            {AUTO_BACK.test(pathname) && <BackButton className="mb-4" fallback="/ai-teacher" />}
            <Outlet />
          </PageChromeProvider>
        </main>

        <StreakCelebrationHost />
        <GuidedTour />
        {showTabBar && <BottomTabBar onMenu={() => setMenuOpen(true)} />}
      </div>
    </div>
  );
}
