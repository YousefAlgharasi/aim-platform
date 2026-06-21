import type { ReactNode } from 'react';

export default function AdminAnalyticsLayout({ children }: { children: ReactNode }) {
  return <div className="admin-analytics-shell">{children}</div>;
}
