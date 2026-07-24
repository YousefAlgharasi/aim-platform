// P11-009: Status-specific badge built on AdminBadge
import { AdminBadge, type BadgeVariant } from './admin-badge';

type Props = {
  readonly status: string;
  readonly className?: string;
};

function variantFor(status: string): BadgeVariant {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'published':
    case 'active':
    case 'completed':
    case 'passed':
    case 'paid':
      return 'success';

    case 'draft':
    case 'pending':
    case 'needs_review':
    case 'trialing':
      return 'warning';

    case 'archived':
    case 'failed':
    case 'inactive':
    case 'canceled':
    case 'overdue':
      return 'error';

    case 'in_progress':
    case 'attempting':
    case 'support':
      return 'info';

    case 'locked':
    case 'not_started':
    case 'system':
      return 'neutral';

    case 'admin':
      return 'purple';

    case 'super_admin':
      return 'rose';

    case 'reviewer':
      return 'emerald';

    default:
      return 'primary';
  }
}

export function AdminStatusBadge({ status, className }: Props) {
  return (
    <AdminBadge variant={variantFor(status)} className={className}>
      {status.replace(/_/g, ' ')}
    </AdminBadge>
  );
}
