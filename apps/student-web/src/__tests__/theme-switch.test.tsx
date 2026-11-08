import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../state/ThemeContext';
import { ThemeSwitch } from '../features/settings/ThemeSwitch';

jest.mock('../i18n/I18nContext', () => ({ useI18n: () => ({ t: (s: string) => s }) }));

function setup() {
  return render(<ThemeProvider><ThemeSwitch /></ThemeProvider>);
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as never;
});

describe('ThemeSwitch', () => {
  it('starts dark by default, switches to light, remembers it, and switches back', () => {
    setup();
    const sw = screen.getByRole('switch', { name: 'Dark mode' });
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement).toHaveClass('dark');

    fireEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('aim-dark-mode')).toBe('false');

    fireEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('aim-dark-mode')).toBe('true');
  });

  it('respects a saved light choice', () => {
    localStorage.setItem('aim-dark-mode', 'false');
    setup();
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('starts dark when dark was saved earlier', () => {
    localStorage.setItem('aim-dark-mode', 'true');
    setup();
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement).toHaveClass('dark');
  });
});
