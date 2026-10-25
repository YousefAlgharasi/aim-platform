import type { BadgeTone } from '../placement/ui';

/** Badge tone for a backend-supplied deadline status. */
export function statusTone(status: string | null | undefined): BadgeTone {
  switch (status) {
    case 'open':
    case 'extended':
      return 'emerald';
    case 'upcoming':
    case 'late':
      return 'amber';
    case 'missed':
      return 'red';
    default:
      return 'slate';
  }
}
