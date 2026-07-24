// P17-065: Admin operations dashboard UI
// Summary cards: open tickets, active incidents, upcoming maintenance, recent feedback.
// Backend is the final authority for all counts and data.
'use client';

import React from 'react';
import { OperationsDashboardClient } from '../../../../features/operations';

export default function OperationsDashboardPage() {
  return <OperationsDashboardClient />;
}
