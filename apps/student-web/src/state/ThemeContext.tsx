import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

// Same storage key and behaviour as design-prototype/src/App.tsx.
const STORAGE_KEY = 'aim-dark-mode';

interface ThemeState {
  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

function initialDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'true';
  } catch {
    // Storage unavailable — fall through to the default (dark).
  }
  // No saved choice yet: the product's look is dark. Light stays one tap away in Settings.
  return true;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferDark, setDarkMode] = useState<boolean>(initialDarkMode);
  // Dark mode is a core part of the look, so the (seeded-off) `dark_mode` feature flag no longer gates it.
  const isDarkMode = preferDark;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDarkMode ? '#080A12' : '#4762EE');
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
    <ThemeContext.Provider value={{ isDarkMode, setDarkMode, toggle }}>{children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
