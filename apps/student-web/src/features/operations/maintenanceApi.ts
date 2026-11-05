import { apiClient } from '../../api/client';

/** Maintenance window as scheduled in the admin dashboard (GET /maintenance-windows). */
export interface MaintenanceWindow {
  id: string;
  title: string;
  userMessage: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledStart: string;
  scheduledEnd: string;
}

export function fetchMaintenanceWindows(): Promise<MaintenanceWindow[]> {
  return apiClient.get<MaintenanceWindow[]>('/maintenance-windows');
}

const UPCOMING_MS = 24 * 60 * 60 * 1000;

/** The backend returns every scheduled/in-progress window, including stale ones; keep only current or imminent ones. */
export function pickRelevantWindow(windows: MaintenanceWindow[], now = Date.now()): MaintenanceWindow | null {
  const relevant = windows
    .filter((w) => (w.status === 'in_progress' || w.status === 'scheduled')
      && new Date(w.scheduledEnd).getTime() > now
      && new Date(w.scheduledStart).getTime() <= now + UPCOMING_MS)
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  return relevant[0] ?? null;
}
