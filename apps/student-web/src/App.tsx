import { Fragment } from 'react';
import { ThemeProvider } from './state/ThemeContext';
import { AuthProvider } from './features/auth/AuthContext';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { AppRoutes } from './routes/AppRoutes';

// Remount the routed tree when the language changes so every string, date and
// layout direction is re-evaluated from scratch.
function LocalizedRoutes() {
  const { locale } = useI18n();
  return (
    <Fragment key={locale}>
      <AppRoutes />
    </Fragment>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <I18nProvider>
          <LocalizedRoutes />
        </I18nProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
