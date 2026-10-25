/** Tailwind v3 setup that mirrors the design-prototype (Tailwind v4) look. */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      // Prototype classes written for Tailwind v4's dynamic scale.
      spacing: { 4.5: '1.125rem', 22: '5.5rem' },
      borderWidth: { 1.5: '1.5px' },
      boxShadow: { '2xs': '0 1px rgb(0 0 0 / 0.05)' },
      blur: { xs: '4px' },
      backdropBlur: { xs: '4px' },
      transitionDuration: { 250: '250ms', 400: '400ms' },
    },
  },
  plugins: [],
};
