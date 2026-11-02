import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BackButton } from './BackButton';

/**
 * Lets a page's title bar tell the app layout that it already shows a back arrow, so the layout
 * doesn't add its own above the page.
 */
interface PageChrome {
  register: () => () => void;
}
const PageChromeContext = createContext<PageChrome | null>(null);

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
 * Page heading: back arrow at the start, the title centered on the same line, an optional action
 * at the end. The two side columns are equal, so the title stays centered with or without an action.
 */
export function PageTitleBar({ title, subtitle, meta, action, fallback, titleAs: Title = 'h1' }: PageTitleBarProps) {
  const chrome = useContext(PageChromeContext);
  useEffect(() => chrome?.register(), [chrome]);

  return (
    <header className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-3">
        <BackButton fallback={fallback} className="justify-self-start" />
        <Title className="m-0 text-center text-xl sm:text-2xl font-extrabold tracking-tight leading-tight text-ink">{title}</Title>
        <div className="justify-self-end">{action}</div>
      </div>
      {meta && <div className="flex justify-center">{meta}</div>}
      {subtitle && <p className="m-0 text-center text-sm leading-relaxed text-ink-muted">{subtitle}</p>}
    </header>
  );
}
