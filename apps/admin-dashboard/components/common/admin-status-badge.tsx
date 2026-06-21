// P11-009: Status-specific badge built on AdminBadge
import { AdminBadge } from './admin-badge';

type Props = {
  readonly status: string;
};

function variantFor(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' {
  switch (status.toLowerCase()) {
    case 'published': case 'active': case 'completed': case 'passed': return 'success';
    case 'draft':     case 'pending': case 'needs_review': return 'warning';
    case 'archived':  case 'failed':  case 'inactive': return 'error';
    case 'in_progress': case 'attempting': return 'info';
    case 'locked':    case 'not_started': return 'neutral';
    default: return 'primary';
  }
}

export function AdminStatusBadge({ status }: Props) {
  return (
    <AdminBadge variant={variantFor(status)}>
      {status.replace(/_/g, ' ')}
    </AdminBadge>
  );
}
