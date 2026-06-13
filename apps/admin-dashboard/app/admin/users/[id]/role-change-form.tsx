'use client';

// Phase 2 — P2-063
// Role change form — client component.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - This component is UX only. Backend enforces admin/super_admin authorization.
// - The token is passed from the server component (read from HTTP-only cookie server-side).
// - No secrets, service-role keys, or database credentials appear here.
// - Role change decisions are enforced server-side — this form only initiates the request.

import { useState, useTransition } from 'react';

import type { AdminUserType } from '../../../../lib/api/admin-users-api';
import { changeAdminUserRole } from '../../../../lib/api/admin-users-api';

// Safe roles available for assignment in Phase 2.
// super_admin is excluded from self-assignment — backend enforces this too.
const ASSIGNABLE_ROLES = [
  { key: 'student', label: 'Student' },
  { key: 'reviewer', label: 'Reviewer' },
  { key: 'support', label: 'Support' },
  { key: 'admin', label: 'Admin' },
  { key: 'super_admin', label: 'Super Admin' },
] as const;

type Props = {
  readonly token: string;
  readonly userId: string;
  readonly currentRoles: string[];
  readonly userType: AdminUserType;
};

type FormState =
  | { type: 'idle' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function RoleChangeForm({ token, userId, currentRoles, userType }: Props) {
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
        const result = await changeAdminUserRole(token, userId, selectedRole, reason.trim() || undefined);

        setFormState({
          type: 'success',
          message: `Role changed to "${result.role.key}" successfully. Reload the page to see the updated role.`,
        });

        setSelectedRole('');
        setReason('');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Role change failed. Check backend connectivity.';
        setFormState({ type: 'error', message });
      }
    });
  }

  return (
    <section className="admin-detail-card">
      <h2 className="admin-detail-card-title">Change Role</h2>

      <div className="admin-boundary-note" style={{ marginBottom: '1rem' }}>
        <strong>Backend enforced.</strong> Only admins and super_admins may
        change roles. This form initiates the request — the backend validates
        authorization before applying any change.
      </div>

      {/* Current roles display */}
      <p className="admin-role-change-current">
        <span className="admin-role-change-label">Current role: </span>
        {primaryRole ? (
          <span className={`admin-badge admin-badge--type-${primaryRole}`}>
            {primaryRole}
          </span>
        ) : (
          <span className="admin-null">No role assigned</span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="admin-role-change-form">
        <div className="admin-role-change-field">
          <label htmlFor="role-select" className="admin-role-change-label">
            New role
          </label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isPending}
            required
            className="admin-role-change-select"
          >
            <option value="">— select a role —</option>
            {ASSIGNABLE_ROLES.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
                {key === primaryRole ? ' (current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-role-change-field">
          <label htmlFor="reason-input" className="admin-role-change-label">
            Reason <span className="admin-null">(optional)</span>
          </label>
          <input
            id="reason-input"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            maxLength={200}
            placeholder="Brief reason for role change"
            className="admin-role-change-input"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedRole || isPending}
          className="admin-role-change-submit"
        >
          {isPending ? 'Changing role…' : 'Change Role'}
        </button>
      </form>

      {formState.type === 'success' && (
        <div className="admin-role-change-success" role="status">
          {formState.message}
        </div>
      )}

      {formState.type === 'error' && (
        <div className="admin-error-banner" role="alert">
          {formState.message}
        </div>
      )}
    </section>
  );
}
