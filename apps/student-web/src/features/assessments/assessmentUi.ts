import styles from './Assessment.module.css';

/** CSS class for a backend-supplied deadline status badge. */
export function statusClass(status: string | null | undefined): string {
  switch (status) {
    case 'open':
    case 'extended':
      return styles.statusAvailable;
    case 'upcoming':
    case 'late':
      return styles.statusUpcoming;
    case 'missed':
      return styles.statusMissed;
    default:
      return styles.statusCompleted;
  }
}
