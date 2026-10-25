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
    // Storage unavailable — fall through to the system preference.
  }
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setDarkMode] = useState<boolean>(initialDarkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem(STORAGE_KEY, String(isDarkMode));
    } catch {
      // Theme still applies for this session.
    }
  }, [isDarkMode]);

  const toggle = useCallback(() => setDarkMode((v) => !v), []);

  return <ThemeContext.Provider value={{ isDarkMode, setDarkMode, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
