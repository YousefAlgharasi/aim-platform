import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 flex flex-col items-center text-center gap-2">
      <h3 className="m-0 text-base font-bold text-ink">{title}</h3>
      <p className="m-0 text-sm text-ink-muted leading-relaxed max-w-md">{message}</p>
      {actionLabel && onAction && (
        <div className="mt-2">
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
