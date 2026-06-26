'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { AdminConfirmDialog } from '../../../../components/common';
import { backendFetch } from '../../../../lib/api/client-api-helpers';
import type { AdminUserStatus } from '../../../../lib/api/admin-users-api';

type Props = {
  readonly userId: string;
  readonly currentStatus: AdminUserStatus;
};

export function UserStatusActions({ userId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<'active' | 'disabled' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canDisable = currentStatus === 'active' || currentStatus === 'pending';
  const canActivate = currentStatus === 'disabled';

  async function handleConfirm() {
    if (!confirmAction) return;
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await backendFetch(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: confirmAction }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error?.message ?? body?.message ?? `Status update failed (${res.status})`,
        );
      }

      const json = await res.json().catch(() => ({}));
      const newStatus = json?.data?.status ?? json?.status ?? confirmAction;

      setSuccessMessage(
        confirmAction === 'disabled'
          ? `Account disabled successfully. Status: ${newStatus}`
          : `Account activated successfully. Status: ${newStatus}`,
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
    <div className="aim-status-actions-card">
      <h3 className="aim-status-actions-title">Account Actions</h3>

      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 12 }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="aim-status-success" role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {successMessage}
        </div>
      )}

      <div className="aim-action-buttons">
        {canDisable && (
          <button
            type="button"
            className="aim-action-btn aim-action-btn--disable"
            disabled={isPending}
            onClick={() => setConfirmAction('disabled')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            Disable Account
          </button>
        )}

        {canActivate && (
          <button
            type="button"
            className="aim-action-btn aim-action-btn--activate"
            disabled={isPending}
            onClick={() => setConfirmAction('active')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Activate Account
          </button>
        )}

        {!canDisable && !canActivate && (
          <p className="aim-no-actions">
            No actions available for &ldquo;{currentStatus}&rdquo; accounts.
          </p>
        )}
      </div>

      <AdminConfirmDialog
        open={confirmAction === 'disabled'}
        title="Disable Account"
        description="This will immediately revoke the user's access to the platform. They won't be able to log in until an admin reactivates the account."
        confirmLabel="Disable Account"
        variant="destructive"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <AdminConfirmDialog
        open={confirmAction === 'active'}
        title="Activate Account"
        description="This will restore the user's access to the platform. They will be able to log in again."
        confirmLabel="Activate"
        variant="default"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <style>{`
        .aim-status-actions-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-20);
        }
        .aim-status-actions-title {
          margin: 0 0 var(--space-16) 0;
          font-size: 15px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-action-buttons {
          display: flex;
          gap: var(--space-12);
          flex-wrap: wrap;
        }
        .aim-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 16px;
          border: none;
          border-radius: var(--radius-md);
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .aim-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .aim-action-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .aim-action-btn--disable {
          background: var(--color-error-500);
          color: white;
        }
        .aim-action-btn--disable:hover:not(:disabled) { background: var(--color-error-600); }
        .aim-action-btn--activate {
          background: var(--color-success-500);
          color: white;
        }
        .aim-action-btn--activate:hover:not(:disabled) { background: var(--color-success-600); }
        .aim-no-actions {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }
        .aim-status-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          background: color-mix(in srgb, var(--color-success-500) 12%, transparent);
          color: var(--color-success-600);
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
