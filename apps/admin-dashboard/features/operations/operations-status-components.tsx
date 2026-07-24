// P17-064: Operations status & state components
import React from 'react';
import { AdminEmptyState, AdminErrorBanner, AdminLoadingSkeleton } from '../../components/layout';

export function OperationsEmptyState({ message = 'No data available.' }: { readonly message?: string }) {
  return <AdminEmptyState title="No Data" description={message} />;
}

export function OperationsErrorCard({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <AdminErrorBanner variant="error" message={message} />
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold text-[var(--color-error-700)] underline cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function OperationsLoadingSpinner({ message = 'Loading...' }: { readonly message?: string }) {
  return <AdminLoadingSkeleton label={message} rows={3} />;
}
