// P17-068: Admin incidents UI
// Table: title, severity, status, started, resolved.
// Create incident form and update status action.
// Backend is the final authority for all incident data.
'use client';

import React from 'react';
import { IncidentsClient } from '../../../../features/operations';

export default function IncidentsPage() {
  return <IncidentsClient />;
}
