import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Extra content under the message (e.g. a link), centred like the rest. */
  children?: ReactNode;
  /** Stretch to fill the height of the page column, for pages whose only content is this box. */
  fill?: boolean;
}

export function EmptyState({ title, message, actionLabel, onAction, children, fill = false }: EmptyStateProps) {
  return (
    <div className={`w-full rounded-2xl bg-surface ring-1 ring-line p-8 flex flex-col items-center text-center gap-2 ${fill ? 'flex-1 justify-center' : ''}`}>
      <h3 className="m-0 text-xl font-semibold text-ink">{title}</h3>
      <p className="m-0 text-base text-ink-muted leading-relaxed max-w-md">{message}</p>
      {actionLabel && onAction && (
        <div className="mt-2">
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
