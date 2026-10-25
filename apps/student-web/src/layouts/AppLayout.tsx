import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlacementGate } from '../features/placement/placementApi';
import { Sidebar, SidebarContent } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';

export function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // First-login gate (Flutter parity): students who haven't chosen between the
  // placement test and starting from scratch are sent to the choice screen once.
  const isStudent = !!user?.roles.includes('student');
  const gate = usePlacementGate(isStudent);
  const onPlacementPath = pathname.startsWith('/placement');

  useEffect(() => {
    if (gate.shouldShowGate && !onPlacementPath) {
      navigate('/placement/gate', { replace: true });
    }
  }, [gate.shouldShowGate, onPlacementPath, navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Sidebar />

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 border-none bg-slate-900/40 backdrop-blur-sm cursor-default"
          />
          <div className="relative w-4/5 max-w-[300px] h-full shadow-2xl bg-white dark:bg-slate-900">
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
