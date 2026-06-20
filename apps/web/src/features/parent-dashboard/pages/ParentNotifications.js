// P13-061: Parent Notification UI Shell page.
//
// Boundary-only integration point for the parent notification surface.
// Real inbox content, preferences, and deadline reminder data are wired
// in by P13-062, P13-063, and P13-064 respectively — this page only
// establishes the route/nav entry and the shared state-machine shell.

import { useState } from 'react';
import { ParentNotificationsShell } from '../notifications';
import './ParentPages.css';

function ParentNotifications() {
  const [status] = useState('empty');

  return (
    <div className="parent-notifications">
      <ParentNotificationsShell status={status} />
    </div>
  );
}

export default ParentNotifications;
