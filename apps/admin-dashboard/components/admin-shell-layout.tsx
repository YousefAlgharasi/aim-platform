// P11-008: aligned with AIM design system
import type { ReactNode } from 'react';

import type { AdminAuthContext } from '../lib/auth';
import { AdminNavigation } from './admin-navigation';

export function AdminShellLayout({
  authContext,
  children,
}: Readonly<{
  authContext: AdminAuthContext;
  children: ReactNode;
}>) {
  return (
    <div className="aim-admin-shell">
      <AdminNavigation authContext={authContext} />
      <div className="aim-admin-body">
        <main
          id="main-content"
          className="aim-admin-main"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <style>{`
        .aim-admin-shell {
          display: flex;
          min-height: 100vh;
          background: var(--background);
        }
        .aim-admin-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .aim-admin-main {
          flex: 1;
          padding: var(--space-32) var(--space-24);
          max-width: var(--content-max-web);
          width: 100%;
          margin-inline: auto;
          outline: none;
        }
        @media (max-width: 768px) {
          .aim-admin-shell { flex-direction: column; }
          .aim-admin-main { padding: var(--space-16); }
        }
      `}</style>
    </div>
  );
}