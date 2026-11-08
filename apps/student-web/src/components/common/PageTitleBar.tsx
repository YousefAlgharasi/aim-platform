import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BackButton } from './BackButton';
import { navItems } from '../../layouts/navItems';

/** Sidebar destinations other than Home: top-level pages, so no back arrow. */
const TOP_LEVEL = new Set(navItems.map((i) => i.to).filter((to) => to !== '/'));
const isTopLevel = () => typeof window !== 'undefined' && TOP_LEVEL.has(window.location.pathname.replace(/\/$/, ''));

/**
 * Lets a page's title bar tell the app layout that it already shows a back arrow, so the layout
 * doesn't add its own above the page.
 */
interface PageChrome {
  register: () => () => void;
}
const PageChromeContext = createContext<PageChrome | null>(null);

/** Pages inside a locked flow (the placement test) provide `true` so no back arrow is shown. */
export const HideBackContext = createContext(false);

/** Provider for the layout. A module-level component, so its identity is stable across renders. */
export function PageChromeProvider({ value, children }: { value: PageChrome; children: ReactNode }) {
  return <PageChromeContext.Provider value={value}>{children}</PageChromeContext.Provider>;
}

/** Used by AppLayout: tracks whether the current page renders a PageTitleBar. */
export function usePageChrome() {
  const [count, setCount] = useState(0);
  const register = useCallback(() => {
    setCount((c) => c + 1);
    return () => setCount((c) => c - 1);
  }, []);
  const chrome = useMemo(() => ({ register }), [register]);
  return { hasTitleBar: count > 0, chrome };
}

interface PageTitleBarProps {
  title: ReactNode;
  /** Smaller text under the title (centered). */
  subtitle?: ReactNode;
  /** Extra content under the title, e.g. badges (centered). */
  meta?: ReactNode;
  /** Shown at the end of the title line (e.g. a link or button). */
  action?: ReactNode;
  /** Where the back arrow goes when the tab has no earlier page. */
  fallback?: string;
  titleAs?: 'h1' | 'h2';
}

/**
 * Page heading: back arrow, then the title (start-aligned, large), with the subtitle beneath and an optional
 * action at the end.
 */
export function PageTitleBar({ title, subtitle, meta, action, fallback, titleAs: Title = 'h1' }: PageTitleBarProps) {
  const chrome = useContext(PageChromeContext);
  useEffect(() => chrome?.register(), [chrome]);
  const hideBack = useContext(HideBackContext);
  const topLevel = isTopLevel() || hideBack;

  return (
    <header className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        {!topLevel && <BackButton fallback={fallback} className="shrink-0" />}
        <Title className="lp-display m-0 min-w-0 flex-1 text-[2rem] font-semibold text-ink sm:text-[2.5rem]">{title}</Title>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {meta && <div className="flex">{meta}</div>}
      {subtitle && <p className={`m-0 max-w-2xl text-sm leading-relaxed text-ink-muted ${topLevel ? '' : 'ps-[3.25rem]'}`}>{subtitle}</p>}
    </header>
  );
}
