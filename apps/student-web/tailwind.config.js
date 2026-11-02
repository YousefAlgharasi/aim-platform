/**
 * Tailwind v3 setup. Colours come from the semantic tokens in src/styles/tokens.css, which switch
 * between light and dark by themselves (the `dark` class on <html>). Components should use these
 * semantic classes (bg-surface, text-ink, border-line, ring-focus ...) instead of palette colours
 * or hex values, so one class works in both themes.
 */
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

const status = (name) => ({
  DEFAULT: v(name), // solid fill (white text on top)
  soft: v(`${name}-soft`), // tinted background
  ink: v(`${name}-ink`), // text / icons
  line: v(`${name}-line`), // outline
});

module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: v('page'),
        surface: {
          DEFAULT: v('surface'),
          muted: v('surface-muted'),
          sunken: v('surface-sunken'),
          strong: v('surface-strong'),
        },
        elevated: v('elevated'),
        field: v('field'),
        control: v('control'),
        overlay: v('overlay'),
        ink: {
          DEFAULT: v('ink'),
          soft: v('ink-soft'),
          muted: v('ink-muted'),
          faint: v('ink-faint'),
          disabled: v('ink-disabled'),
          inverse: v('ink-inverse'),
        },
        'on-brand': v('on-brand'),
        line: {
          DEFAULT: v('line'),
          subtle: v('line-subtle'),
          strong: v('line-strong'),
        },
        brand: {
          DEFAULT: v('brand'),
          hover: v('brand-hover'),
          active: v('brand-active'),
          soft: v('brand-soft'),
          'soft-hover': v('brand-soft-hover'),
          ink: v('brand-ink'),
          line: v('brand-line'),
        },
        secondary: {
          DEFAULT: v('secondary'),
          soft: v('secondary-soft'),
          ink: v('secondary-ink'),
          line: v('secondary-line'),
        },
        accent: {
          DEFAULT: v('accent'),
          soft: v('accent-soft'),
          ink: v('accent-ink'),
          line: v('accent-line'),
        },
        gold: { DEFAULT: v('gold'), 'on-brand': v('gold-on-brand') },
        focus: v('focus'),
        disabled: v('disabled'),
        success: status('success'),
        warning: status('warning'),
        danger: status('danger'),
        info: status('info'),
      },
      fontFamily: {
        // Inter for English; IBM Plex Sans Arabic for Arabic glyphs (Inter has none, so it falls through).
        sans: ['Inter', '"IBM Plex Sans Arabic"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      // Prototype classes written for Tailwind v4's dynamic scale.
      spacing: { 4.5: '1.125rem', 22: '5.5rem' },
      borderWidth: { 1.5: '1.5px' },
      // Soft, ink-tinted shadows (no heavy black drop shadows).
      boxShadow: {
        '2xs': '0 1px rgb(20 26 44 / 0.04)',
        sm: '0 1px 2px rgb(20 26 44 / 0.05)',
        DEFAULT: '0 1px 3px rgb(20 26 44 / 0.08), 0 1px 2px rgb(20 26 44 / 0.04)',
        md: '0 4px 10px -2px rgb(20 26 44 / 0.08), 0 2px 4px -2px rgb(20 26 44 / 0.05)',
        lg: '0 10px 20px -4px rgb(20 26 44 / 0.10), 0 4px 8px -4px rgb(20 26 44 / 0.05)',
        xl: '0 16px 32px -8px rgb(20 26 44 / 0.12), 0 6px 12px -6px rgb(20 26 44 / 0.06)',
        '2xl': '0 24px 48px -12px rgb(20 26 44 / 0.18)',
      },
      blur: { xs: '4px' },
      backdropBlur: { xs: '4px' },
      transitionDuration: { 250: '250ms', 400: '400ms' },
    },
  },
  plugins: [],
};
