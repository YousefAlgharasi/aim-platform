// Plain utility — no 'use client' directive. Importing a function from a
// 'use client' module (like student-progress-client.tsx) into a Server
// Component throws "Attempted to call X() from the server but X is on the
// client", because every export of a client-boundary file is treated as
// client-only, even a pure helper. Keeping this here lets both the server
// page.tsx and the client StudentProgressClient call it safely.
import type { AdminStudentProfile } from '../../core/api/admin-student-profile-api';

export function studentDisplayName(profile: AdminStudentProfile): string {
  if (profile.student.displayName) return profile.student.displayName;
  if (profile.student.email) return profile.student.email;
  return `Student ${profile.student.id.slice(0, 8)}`;
}
