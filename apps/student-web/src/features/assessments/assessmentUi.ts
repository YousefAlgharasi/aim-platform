import type { BadgeTone } from '../placement/ui';
import { t } from '../../i18n';

/** Translated label for a backend assessment type (quiz, exam, ...). */
export function assessmentTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'quiz': return t('Quiz');
    case 'exam': return t('Exam');
    case 'test': return t('Test');
    case 'assignment': return t('Assignment');
    default: return type ?? '';
  }
}

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
