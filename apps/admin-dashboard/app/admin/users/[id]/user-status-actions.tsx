'use client';
// P11-017: Admin user status actions (suspend / activate)

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { AdminConfirmDialog } from '../../../../components/common';
import { updateAdminUserStatus } from '../../../../lib/api/admin-users-api';
import type { AdminUserStatus } from '../../../../lib/api/admin-users-api';

type Props = {
  readonly token: string;
  readonly userId: string;
  readonly currentStatus: AdminUserStatus;
};

export function UserStatusActions({ token, userId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<'active' | 'disabled' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSuspend = currentStatus === 'active';
  const canActivate = currentStatus === 'disabled';

  async function handleConfirm() {
    if (!confirmAction) return;
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await updateAdminUserStatus(token, userId, confirmAction);
      setSuccessMessage(
        confirmAction === 'disabled'
          ? `User suspended successfully. Status: ${result.status}`
          : `User activated successfully. Status: ${result.status}`,
      );
      setConfirmAction(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update user status.',
      );
      setConfirmAction(null);
    }
  }

  return (
    <section className="admin-detail-card">
      <h2 className="admin-detail-card-title">Status Actions</h2>

      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-12)' }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="aim-status-success" role="status">
          {successMessage}
        </div>
      )}

      <div className="aim-status-actions">
        {canSuspend && (
          <button
            type="button"
            className="aim-status-btn aim-status-btn--suspend"
            disabled={isPending}
            onClick={() => setConfirmAction('disabled')}
          >
            Suspend User
          </button>
        )}

        {canActivate && (
          <button
            type="button"
            className="aim-status-btn aim-status-btn--activate"
            disabled={isPending}
            onClick={() => setConfirmAction('active')}
          >
            Activate User
          </button>
        )}

        {!canSuspend && !canActivate && (
          <p className="admin-empty-state">
            No status actions available for users with status "{currentStatus}".
          </p>
        )}
      </div>

      <AdminConfirmDialog
        open={confirmAction === 'disabled'}
        title="Suspend User"
        description="Are you sure you want to suspend this user? They will lose access until reactivated by an admin."
        confirmLabel="Suspend"
        variant="destructive"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <AdminConfirmDialog
        open={confirmAction === 'active'}
        title="Activate User"
        description="Are you sure you want to activate this user? They will regain access to the platform."
        confirmLabel="Activate"
        variant="default"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <style>{`
        .aim-status-actions {
          display: flex;
          gap: var(--space-12);
          flex-wrap: wrap;
        }
        .aim-status-btn {
          display: inline-flex;
          align-items: center;
          height: var(--size-btn-md);
          padding: 0 var(--space-20);
          border: none;
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 14px;
          font-weight: var(--weight-semibold);
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .aim-status-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .aim-status-btn:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }
        .aim-status-btn--suspend {
          background: var(--color-error-500);
          color: var(--text-on-primary);
        }
        .aim-status-btn--suspend:hover:not(:disabled) {
          background: var(--color-error-600);
        }
        .aim-status-btn--activate {
          background: var(--color-success-500);
          color: var(--text-on-primary);
        }
        .aim-status-btn--activate:hover:not(:disabled) {
          background: var(--color-success-600);
        }
        .aim-status-success {
          padding: var(--space-12) var(--space-16);
          border-radius: var(--radius-sm);
          background: color-mix(in srgb, var(--color-success-500) 12%, transparent);
          color: var(--color-success-600);
          font-size: 14px;
          font-weight: var(--weight-medium);
          margin-block-end: var(--space-12);
        }
      `}</style>
    </section>
  );
}
