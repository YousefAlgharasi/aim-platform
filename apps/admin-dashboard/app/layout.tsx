import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
