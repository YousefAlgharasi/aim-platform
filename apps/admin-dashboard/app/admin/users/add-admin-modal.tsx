'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { backendFetch } from '../../../lib/api/client-api-helpers';

const ROLES = [
  { key: 'admin', label: 'Admin' },
  { key: 'super_admin', label: 'Super Admin' },
  { key: 'reviewer', label: 'Reviewer' },
  { key: 'support', label: 'Support' },
] as const;

type UserOption = { id: string; email: string };

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export function AddAdminModal({ open, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setSelectedUser('');
    setSelectedRole('admin');
    setReason('');
    setSearchEmail('');
    loadUsers('');
  }, [open]);

  async function loadUsers(email: string) {
    setLoadingUsers(true);
    try {
      const qs = email ? `?email=${encodeURIComponent(email)}&limit=50` : '?limit=50';
      const res = await backendFetch(`/admin/users${qs}`);
      if (res.ok) {
        const json = await res.json();
        const list = json?.data?.users ?? json?.users ?? [];
        setUsers(
          list
            .filter((u: Record<string, unknown>) => u.email)
            .map((u: Record<string, unknown>) => ({ id: u.id as string, email: u.email as string })),
        );
      }
    } catch {
      // silent
    } finally {
      setLoadingUsers(false);
    }
  }

  function handleSearch() {
    loadUsers(searchEmail.trim());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !selectedRole) return;
    setResult(null);

    startTransition(async () => {
      try {
        const res = await backendFetch(`/admin/users/${selectedUser}/roles`, {
          method: 'PUT',
          body: JSON.stringify({
            roleKey: selectedRole,
            ...(reason.trim() ? { reason: reason.trim() } : {}),
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message ?? body?.message ?? `Failed (${res.status})`);
        }

        setResult({ type: 'success', message: `Role "${selectedRole}" assigned successfully.` });
        router.refresh();
      } catch (err) {
        setResult({
          type: 'error',
          message: err instanceof Error ? err.message : 'Failed to assign role.',
        });
      }
    });
  }

  if (!open) return null;

  return (
    <>
      <div className="aim-modal-backdrop" onClick={onClose} />
      <div className="aim-modal">
        <div className="aim-modal-header">
          <h2 className="aim-modal-title">Add Admin / Assign Role</h2>
          <button type="button" className="aim-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="aim-modal-body">
          <div className="aim-modal-field">
            <label className="aim-modal-label">Search user by email</label>
            <div className="aim-modal-search-row">
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                placeholder="Type email to search…"
                className="aim-modal-input"
              />
              <button type="button" onClick={handleSearch} className="aim-modal-search-btn" disabled={loadingUsers}>
                {loadingUsers ? '…' : 'Search'}
              </button>
            </div>
          </div>

          <div className="aim-modal-field">
            <label className="aim-modal-label">Select user</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="aim-modal-select"
              required
            >
              <option value="">— Choose a user —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
            {users.length === 0 && !loadingUsers && (
              <p className="aim-modal-hint">No users found. Try searching by email.</p>
            )}
          </div>

          <div className="aim-modal-field">
            <label className="aim-modal-label">Assign role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="aim-modal-select"
              required
            >
              {ROLES.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="aim-modal-field">
            <label className="aim-modal-label">
              Reason <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
              placeholder="Why is this role being assigned?"
              className="aim-modal-input"
            />
          </div>

          {result && (
            <div className={result.type === 'success' ? 'aim-status-success' : 'admin-error-banner'} role={result.type === 'error' ? 'alert' : 'status'}>
              {result.message}
            </div>
          )}

          <div className="aim-modal-actions">
            <button type="button" onClick={onClose} className="aim-modal-cancel">Cancel</button>
            <button type="submit" disabled={!selectedUser || !selectedRole || isPending} className="aim-modal-submit">
              {isPending ? 'Assigning…' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .aim-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(24, 28, 38, 0.5);
          z-index: 1000;
        }
        .aim-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1001;
          background: var(--surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-modal, 0 25px 50px -12px rgba(0,0,0,0.25));
          width: calc(100% - 32px);
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .aim-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 0;
        }
        .aim-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .aim-modal-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
        }
        .aim-modal-close:hover { color: var(--text-primary); }
        .aim-modal-body {
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .aim-modal-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .aim-modal-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .aim-modal-input, .aim-modal-select {
          height: 38px;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
        }
        .aim-modal-input:focus, .aim-modal-select:focus {
          outline: none;
          border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
        }
        .aim-modal-search-row {
          display: flex;
          gap: 8px;
        }
        .aim-modal-search-row .aim-modal-input { flex: 1; }
        .aim-modal-search-btn {
          height: 38px;
          padding: 0 14px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface-sunken);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
        }
        .aim-modal-search-btn:hover { background: var(--state-hover); }
        .aim-modal-hint {
          margin: 4px 0 0;
          font-size: 12px;
          color: var(--text-muted);
        }
        .aim-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 4px;
        }
        .aim-modal-cancel {
          height: 38px;
          padding: 0 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
        }
        .aim-modal-cancel:hover { background: var(--surface-sunken); }
        .aim-modal-submit {
          height: 38px;
          padding: 0 16px;
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-primary-500);
          color: white;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
        }
        .aim-modal-submit:hover:not(:disabled) { background: var(--color-primary-600); }
        .aim-modal-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </>
  );
}
