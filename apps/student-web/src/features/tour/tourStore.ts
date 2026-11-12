// Remembers which tours a user has finished or dismissed. There is no backend preference for this, so it is kept in
// localStorage, namespaced by user and tour. Storage can be blocked; every access is guarded.

const key = (userId: string, tourId: string) => `aim:tour:v1:${userId}:${tourId}`;

export const TOUR_START_EVENT = 'aim:tour:start';
export const TOUR_STATE_EVENT = 'aim:tour:state';

export function hasSeenTour(userId: string, tourId: string): boolean {
  try {
    if (window.localStorage.getItem(key(userId, tourId)) === '1') return true;
    // People who already dismissed the earlier welcome tips should not be interrupted by the new dashboard tour.
    if (tourId === 'dashboard' && window.localStorage.getItem(`aim_tips_seen:${userId}`) === '1') return true;
    return false;
  } catch {
    // Can't remember anything: never start a tour by itself.
    return true;
  }
}

export function markTourSeen(userId: string, tourId: string): void {
  try {
    window.localStorage.setItem(key(userId, tourId), '1');
  } catch {
    /* storage unavailable: the tour may be offered again next visit */
  }
  window.dispatchEvent(new Event(TOUR_STATE_EVENT));
}

/** Start a tour from anywhere. Without an id, the tour for the current page. */
export function requestTour(tourId?: string): void {
  window.dispatchEvent(new CustomEvent(TOUR_START_EVENT, { detail: { tourId } }));
}
