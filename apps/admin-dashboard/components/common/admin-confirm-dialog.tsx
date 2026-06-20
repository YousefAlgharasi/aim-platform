'use client';
// P11-009: AIM design system confirmation dialog
// Client component — uses dialog element for native accessibility
import { useEffect, useRef } from 'react';

type Props = {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly variant?: 'default' | 'destructive';
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
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
      e.clientX < rect.left || e.clientX > rect.right ||
      e.clientY < rect.top  || e.clientY > rect.bottom;
    if (clickedOutside) onCancel();
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        className="aim-dialog"
        aria-labelledby="aim-dialog-title"
        aria-describedby="aim-dialog-desc"
        onCancel={onCancel}
        onClick={handleClick}
      >
        <div className="aim-dialog-content" onClick={(e) => e.stopPropagation()}>
          <h2 id="aim-dialog-title" className="aim-dialog-title">{title}</h2>
          <p id="aim-dialog-desc" className="aim-dialog-description">{description}</p>
          <div className="aim-dialog-actions">
            <button
              type="button"
              className="aim-dialog-btn aim-dialog-btn--cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`aim-dialog-btn ${variant === 'destructive' ? 'aim-dialog-btn--destructive' : 'aim-dialog-btn--confirm'}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
      <style>{`
        .aim-dialog {
          border: none;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-modal);
          padding: 0;
          max-width: 440px;
          width: calc(100% - var(--space-32));
          background: var(--surface);
        }
        .aim-dialog::backdrop {
          background: rgba(24, 28, 38, 0.50);
        }
        .aim-dialog-content {
          padding: var(--space-24);
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .aim-dialog-title {
          margin: 0;
          font-size: 19px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
          line-height: 26px;
        }
        .aim-dialog-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 20px;
        }
        .aim-dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-8);
          margin-block-start: var(--space-8);
        }
        .aim-dialog-btn {
          display: inline-flex;
          align-items: center;
          height: var(--size-btn-md);
          padding: 0 var(--space-20);
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 14px;
          font-weight: var(--weight-semibold);
          cursor: pointer;
          border: none;
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .aim-dialog-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .aim-dialog-btn--cancel {
          background: var(--surface-sunken);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .aim-dialog-btn--cancel:hover { background: var(--state-hover); }
        .aim-dialog-btn--confirm {
          background: var(--color-primary-500);
          color: var(--text-on-primary);
        }
        .aim-dialog-btn--confirm:hover { background: var(--color-primary-600); }
        .aim-dialog-btn--destructive {
          background: var(--color-error-500);
          color: var(--text-on-primary);
        }
        .aim-dialog-btn--destructive:hover { background: var(--color-error-600); }
      `}</style>
    </>
  );
}
