'use client';

import { useState } from 'react';
import { AddAdminModal } from './add-admin-modal';

export function UsersPageClient() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        type="button"
        className="aim-add-admin-btn"
        onClick={() => setShowModal(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M16 7a4 4 0 00-8 0M19 8v6M22 11h-6" /></svg>
        Add Admin
      </button>

      <AddAdminModal open={showModal} onClose={() => setShowModal(false)} />

      <style>{`
        .aim-add-admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 20px;
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-primary-500);
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .aim-add-admin-btn:hover { background: var(--color-primary-600); }
        .aim-add-admin-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
      `}</style>
    </>
  );
}
