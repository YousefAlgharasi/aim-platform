import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../shared/components/providers/theme-provider';
import { ThemeToggle } from '../../shared/components/Theme/theme-toggle';

function TestConsumer() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <span data-testid="resolved-val">{resolvedTheme}</span>
      <button data-testid="btn-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="btn-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="btn-toggle" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

describe('ThemeProvider & useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('provides default theme and mounts properly', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-val').textContent).toBe('system');
  });

  it('switches to dark theme and sets document attributes', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('btn-dark'));
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('dark');
    expect(screen.getByTestId('resolved-val').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('aim-admin-theme')).toBe('dark');
  });

  it('switches to light theme', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('btn-light'));
    });

    expect(screen.getByTestId('theme-val').textContent).toBe('light');
    expect(screen.getByTestId('resolved-val').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('aim-admin-theme')).toBe('light');
  });

  it('toggles between dark and light', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      fireEvent.click(screen.getByTestId('btn-light'));
    });
    expect(screen.getByTestId('theme-val').textContent).toBe('light');

    act(() => {
      fireEvent.click(screen.getByTestId('btn-toggle'));
    });
    expect(screen.getByTestId('theme-val').textContent).toBe('dark');
    expect(screen.getByTestId('resolved-val').textContent).toBe('dark');
  });
});

describe('ThemeToggle component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders compact variant', () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="compact" />
      </ThemeProvider>
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });

  it('renders segmented variant with options', () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="segmented" />
      </ThemeProvider>
    );

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders nav variant and toggles on click', () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="nav" />
      </ThemeProvider>
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    act(() => {
      fireEvent.click(btn);
    });
    expect(localStorage.getItem('aim-admin-theme')).toBeDefined();
  });
});
