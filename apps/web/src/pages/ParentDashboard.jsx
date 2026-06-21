// P12-047: Create Parent Dashboard Feature Shell
import { useState } from 'react';
import ParentDashboardShell from '../features/parent-dashboard';

function ParentDashboard() {
  const [status] = useState('empty');

  return (
    <main className="pilot-main">
      <ParentDashboardShell status={status} />
    </main>
  );
}

export default ParentDashboard;
