import type { ReactNode } from 'react';
import { cva } from '../../../core/utils/cva';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'emerald'
  | 'amber'
  | 'orange'
  | 'rose';

type Props = {
  readonly children: ReactNode;
  readonly variant?: BadgeVariant;
  readonly label?: string;
  readonly className?: string;
};

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-[var(--surface-sunken)] text-[var(--text-secondary)]',
        primary: 'bg-[var(--primary-soft)] text-[var(--primary-soft-fg)]',
        success: 'bg-[var(--success-soft)] text-[var(--success-soft-fg)]',
        warning: 'bg-[var(--warning-soft)] text-[var(--warning-soft-fg)]',
        error:   'bg-[var(--error-soft)] text-[var(--error-soft-fg)]',
        info:    'bg-[var(--info-soft)] text-[var(--info-soft-fg)]',
        neutral: 'bg-[var(--surface-sunken)] text-[var(--text-secondary)]',
        purple:  'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        amber:   'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        orange:  'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
        rose:    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function AdminBadge({ children, variant = 'default', label, className }: Props) {
  return (
    <span className={badgeVariants({ variant, className })} aria-label={label}>
      {children}
    </span>
  );
}
