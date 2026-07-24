'use client';
// P11-009: AIM design system confirmation dialog
// Client component — uses dialog element for native accessibility
import { useEffect, useRef } from 'react';

type Props = {
  readonly open?: boolean;
  readonly title: string;
  readonly description?: string;
  readonly message?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly variant?: 'default' | 'destructive';
  readonly error?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

export function AdminConfirmDialog({
  open = true,
  title,
  description,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  error,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  // Close on backdrop click
  function handleClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickedOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (clickedOutside) onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      className="p-0 border-0 rounded-3xl shadow-2xl max-w-md w-[calc(100%-2rem)] bg-[var(--surface)] backdrop:bg-slate-900/50"
      aria-labelledby="aim-dialog-title"
      aria-describedby="aim-dialog-desc"
      onCancel={onCancel}
      onClick={handleClick}
    >
      <div className="p-6 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <h2 id="aim-dialog-title" className="text-lg font-semibold text-[var(--text-primary)] leading-6">
          {title}
        </h2>
        <p id="aim-dialog-desc" className="text-sm text-[var(--text-secondary)] leading-5">
          {description ?? message}
        </p>
        {error && (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        )}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            className="h-11 px-5 rounded-xl bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--border)] text-sm font-semibold hover:bg-[var(--state-hover)] transition-colors cursor-pointer"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`h-11 px-5 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)]'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
