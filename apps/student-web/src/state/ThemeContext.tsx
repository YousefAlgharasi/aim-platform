import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

// Same storage key and behaviour as design-prototype/src/App.tsx.
const STORAGE_KEY = 'aim-dark-mode';

interface ThemeState {
  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggle: () => void;
  /** false when an admin has switched the `dark_mode` feature flag off for this user. */
  darkModeAllowed: boolean;
  setDarkModeAllowed: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

function initialDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // Storage unavailable — fall through to the system preference.
  }
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferDark, setDarkMode] = useState<boolean>(initialDarkMode);
  const [darkModeAllowed, setDarkModeAllowed] = useState(true);
  // The stored preference is kept as-is; the flag only overrides what is shown.
  const isDarkMode = preferDark && darkModeAllowed;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDarkMode ? '#0F172A' : '#4762EE');
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(preferDark));
    } catch {
      // Theme still applies for this session.
    }
  }, [preferDark]);

  const toggle = useCallback(() => setDarkMode((v) => !v), []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setDarkMode, toggle, darkModeAllowed, setDarkModeAllowed }}>{children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
