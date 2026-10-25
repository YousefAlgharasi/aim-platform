import { ThemeProvider } from './state/ThemeContext';
import { AuthProvider } from './features/auth/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
