'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { AdminUserType } from '../../../../lib/api/admin-users-api';
import { backendFetch } from '../../../../lib/api/client-api-helpers';

const ASSIGNABLE_ROLES = [
  { key: 'student', label: 'Student' },
  { key: 'reviewer', label: 'Reviewer' },
  { key: 'support', label: 'Support' },
  { key: 'admin', label: 'Admin' },
  { key: 'super_admin', label: 'Super Admin' },
] as const;

type Props = {
  readonly userId: string;
  readonly currentRoles: string[];
  readonly userType: AdminUserType;
};

type FormState =
  | { type: 'idle' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function RoleChangeForm({ userId, currentRoles, userType }: Props) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [reason, setReason] = useState('');
  const [formState, setFormState] = useState<FormState>({ type: 'idle' });
  const [isPending, startTransition] = useTransition();

  const primaryRole = currentRoles[0] ?? '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole) return;
    setFormState({ type: 'idle' });

    startTransition(async () => {
      try {
        const res = await backendFetch(`/admin/users/${userId}/roles`, {
          method: 'PUT',
          body: JSON.stringify({
            roleKey: selectedRole,
            ...(reason.trim() ? { reason: reason.trim() } : {}),
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error?.message ?? body?.message ?? `Role change failed (${res.status})`,
          );
        }

        const json = await res.json().catch(() => ({}));
        const newRole = json?.data?.role?.key ?? selectedRole;

        setFormState({
          type: 'success',
          message: `Role changed to "${newRole}" successfully.`,
        });
        setSelectedRole('');
        setReason('');
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Role change failed. Check backend connectivity.';
        setFormState({ type: 'error', message });
      }
    });
  }

  return (
    <div className="aim-role-form-card">
      <h3 className="aim-role-form-title">Change Role</h3>

      <div className="aim-role-current">
        <span className="aim-role-current-label">Current:</span>
        {primaryRole ? (
          <span className={`admin-badge admin-badge--type-${primaryRole}`}>{primaryRole}</span>
        ) : (
          <span className="aim-role-none">No role</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="aim-role-form">
        <div className="aim-role-field">
          <label htmlFor="role-select" className="aim-role-label">New role</label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isPending}
            required
            className="aim-role-select"
          >
            <option value="">Select role…</option>
            {ASSIGNABLE_ROLES.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}{key === primaryRole ? ' (current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="aim-role-field">
          <label htmlFor="reason-input" className="aim-role-label">
            Reason <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            id="reason-input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            maxLength={200}
            placeholder="Brief reason for change"
            className="aim-role-input"
          />
        </div>

        <button type="submit" disabled={!selectedRole || isPending} className="aim-role-submit">
          {isPending ? 'Changing…' : 'Change Role'}
        </button>
      </form>

      {formState.type === 'success' && (
        <div className="aim-status-success" role="status" style={{ marginTop: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {formState.message}
        </div>
      )}

      {formState.type === 'error' && (
        <div className="admin-error-banner" role="alert" style={{ marginTop: 12 }}>
          {formState.message}
        </div>
      )}

      <style>{`
        .aim-role-form-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-20);
        }
        .aim-role-form-title {
          margin: 0 0 var(--space-12) 0;
          font-size: 15px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-role-current {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: var(--space-16);
          font-size: 13px;
        }
        .aim-role-current-label {
          color: var(--text-secondary);
          font-weight: 500;
        }
        .aim-role-none {
          color: var(--text-muted);
          font-style: italic;
        }
        .aim-role-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .aim-role-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .aim-role-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .aim-role-select, .aim-role-input {
          height: 36px;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--text-primary);
          font-size: 13px;
          font-family: inherit;
        }
        .aim-role-select:focus, .aim-role-input:focus {
          outline: none;
          border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
        }
        .aim-role-submit {
          align-self: flex-start;
          height: 36px;
          padding: 0 16px;
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-primary-500);
          color: white;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .aim-role-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .aim-role-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .aim-role-submit:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
      `}</style>
    </div>
  );
}
