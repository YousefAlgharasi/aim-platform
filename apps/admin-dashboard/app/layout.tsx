import type { Metadata } from 'next';
import './globals.css';

import { QueryProvider } from '../components/providers/query-provider';

export const metadata: Metadata = {
  title: 'AIM Admin Dashboard',
  description: 'Internal Admin Dashboard shell for AIM Phase 1.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
