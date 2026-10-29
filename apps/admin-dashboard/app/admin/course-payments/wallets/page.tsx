// Payment wallets students can pay with. Each wallet has a name, the account
// holder and number to transfer to, optional instructions, a small logo and
// an optional image showing the account number or a QR code. Students only
// see active wallets, in the order set here.
'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { coursePaymentsApi, Wallet, WalletInput, walletImageUrl } from '../../../../features/course-payments/api';
import { OperationsLoadingSpinner, OperationsErrorCard } from '../../../../shared/components/operations';

type Draft = {
  name: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  isActive: boolean;
  sortOrder: string;
};

const EMPTY: Draft = { name: '', accountName: '', accountNumber: '', instructions: '', isActive: true, sortOrder: '0' };
const ACCEPT = 'image/png,image/jpeg,image/webp';
const MAX_BYTES = 5 * 1024 * 1024;

function toDraft(w: Wallet): Draft {
  return {
    name: w.name,
    accountName: w.accountName ?? '',
    accountNumber: w.accountNumber ?? '',
    instructions: w.instructions ?? '',
    isActive: w.isActive,
    sortOrder: String(w.sortOrder),
  };
}

function toInput(d: Draft): WalletInput {
  return {
    name: d.name.trim(),
    accountName: d.accountName.trim() || null,
    accountNumber: d.accountNumber.trim() || null,
    instructions: d.instructions.trim() || null,
    isActive: d.isActive,
    sortOrder: Number.parseInt(d.sortOrder, 10) || 0,
  };
}

function WalletFields({ id, draft, onChange, disabled }: {
  id: string; draft: Draft; onChange: (d: Draft) => void; disabled: boolean;
}) {
  return (
    <div className="cp-fields">
      <div className="cp-field">
        <label className="cp-label" htmlFor={`${id}-name`}>Wallet name</label>
        <input id={`${id}-name`} className="cp-input" value={draft.name} maxLength={80} placeholder="e.g. Jawali"
          onChange={(e) => onChange({ ...draft, name: e.target.value })} disabled={disabled} />
      </div>
      <div className="cp-field">
        <label className="cp-label" htmlFor={`${id}-acct-name`}>Account holder</label>
        <input id={`${id}-acct-name`} className="cp-input" value={draft.accountName} maxLength={120}
          onChange={(e) => onChange({ ...draft, accountName: e.target.value })} disabled={disabled} />
      </div>
      <div className="cp-field">
        <label className="cp-label" htmlFor={`${id}-acct-number`}>Number to transfer to</label>
        <input id={`${id}-acct-number`} className="cp-input cp-mono" value={draft.accountNumber} maxLength={120}
          onChange={(e) => onChange({ ...draft, accountNumber: e.target.value })} disabled={disabled} />
      </div>
      <div className="cp-field">
        <label className="cp-label" htmlFor={`${id}-order`}>Order</label>
        <input id={`${id}-order`} className="cp-input" type="number" min="0" step="1" value={draft.sortOrder}
          onChange={(e) => onChange({ ...draft, sortOrder: e.target.value })} disabled={disabled} />
      </div>
      <div className="cp-field" style={{ gridColumn: '1 / -1' }}>
        <label className="cp-label" htmlFor={`${id}-instructions`}>Instructions for students (optional)</label>
        <textarea id={`${id}-instructions`} className="cp-textarea" value={draft.instructions} maxLength={1000}
          placeholder="e.g. Transfer the exact course price and keep a screenshot of the confirmation."
          onChange={(e) => onChange({ ...draft, instructions: e.target.value })} disabled={disabled} />
      </div>
      <label className="cp-actions" htmlFor={`${id}-active`}>
        <input id={`${id}-active`} type="checkbox" checked={draft.isActive}
          onChange={(e) => onChange({ ...draft, isActive: e.target.checked })} disabled={disabled} />
        <span>Show to students</span>
      </label>
    </div>
  );
}

function ImageSlot({ wallet, kind, onChanged, onError }: {
  wallet: Wallet; kind: 'logo' | 'qr'; onChanged: (w: Wallet) => void; onError: (m: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const url = walletImageUrl(wallet, kind);
  const label = kind === 'logo' ? 'Logo' : 'Account number / QR code';

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!ACCEPT.split(',').includes(file.type)) return onError('Choose a PNG, JPEG or WebP image.');
    if (file.size > MAX_BYTES) return onError('Image must be 5 MB or smaller.');
    setBusy(true);
    try {
      onChanged(await coursePaymentsApi.uploadWalletImage(wallet.id, kind, file));
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      onChanged(await coursePaymentsApi.removeWalletImage(wallet.id, kind));
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to remove image.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-field">
      <span className="cp-label">{label}</span>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={kind === 'logo' ? 'cp-logo' : 'cp-qr'} src={url} alt={`${wallet.name} ${label}`} />
      ) : (
        <div className={`${kind === 'logo' ? 'cp-logo' : 'cp-qr'} cp-placeholder`}>None</div>
      )}
      <div className="cp-actions">
        <label className="cp-btn cp-btn--ghost" style={{ display: 'inline-flex', alignItems: 'center' }}>
          {busy ? 'Uploading...' : url ? 'Replace' : 'Upload'}
          <input type="file" accept={ACCEPT} hidden disabled={busy} aria-label={`Upload ${label}`}
            onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        {url && <button type="button" className="cp-btn cp-btn--ghost" disabled={busy} onClick={remove}>Remove</button>}
      </div>
    </div>
  );
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const items = await coursePaymentsApi.listWallets();
      setWallets(items);
      setDrafts(Object.fromEntries(items.map((w) => [w.id, toDraft(w)])));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load wallets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function replaceWallet(updated: Wallet) {
    setWallets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newDraft.name.trim()) {
      setErrors((prev) => ({ ...prev, new: 'Enter a wallet name.' }));
      return;
    }
    setBusy('new');
    setErrors((prev) => ({ ...prev, new: '' }));
    try {
      const created = await coursePaymentsApi.createWallet(toInput(newDraft));
      setWallets((prev) => [...prev, created]);
      setDrafts((prev) => ({ ...prev, [created.id]: toDraft(created) }));
      setNewDraft(EMPTY);
      setNotice(`Added ${created.name}. Upload its logo and account/QR image below.`);
    } catch (err) {
      setErrors((prev) => ({ ...prev, new: err instanceof Error ? err.message : 'Failed to add wallet.' }));
    } finally {
      setBusy(null);
    }
  }

  async function save(e: React.FormEvent, wallet: Wallet) {
    e.preventDefault();
    const draft = drafts[wallet.id];
    if (!draft.name.trim()) {
      setErrors((prev) => ({ ...prev, [wallet.id]: 'Enter a wallet name.' }));
      return;
    }
    setBusy(wallet.id);
    setErrors((prev) => ({ ...prev, [wallet.id]: '' }));
    try {
      const updated = await coursePaymentsApi.updateWallet(wallet.id, toInput(draft));
      replaceWallet(updated);
      setDrafts((prev) => ({ ...prev, [wallet.id]: toDraft(updated) }));
      setNotice(`Saved ${updated.name}.`);
    } catch (err) {
      setErrors((prev) => ({ ...prev, [wallet.id]: err instanceof Error ? err.message : 'Failed to save.' }));
    } finally {
      setBusy(null);
    }
  }

  async function remove(wallet: Wallet) {
    if (!window.confirm(`Delete ${wallet.name}?`)) return;
    setBusy(wallet.id);
    try {
      const result = await coursePaymentsApi.deleteWallet(wallet.id);
      if (result.deleted) {
        setWallets((prev) => prev.filter((w) => w.id !== wallet.id));
        setNotice(`Deleted ${wallet.name}.`);
      } else {
        await load();
        setNotice(`${wallet.name} already has payments, so it was hidden from students instead of deleted.`);
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, [wallet.id]: err instanceof Error ? err.message : 'Failed to delete.' }));
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <OperationsLoadingSpinner message="Loading wallets..." />;
  if (loadError) return <OperationsErrorCard message={loadError} onRetry={load} />;

  return (
    <div className="cp-page">
      <header className="cp-header">
        <p className="cp-eyebrow">Course payments</p>
        <h1 className="cp-title">Payment Wallets</h1>
        <p className="cp-meta">
          Students pick one of these wallets when they pay for a course, transfer to the number shown, then upload their
          receipt.
        </p>
      </header>

      {notice && <div className="cp-success" role="status">{notice}</div>}

      <form className="cp-card" onSubmit={add} aria-label="Add wallet">
        <h2 className="cp-card-title">Add a wallet</h2>
        <WalletFields id="new" draft={newDraft} onChange={setNewDraft} disabled={busy === 'new'} />
        {errors.new && <div className="cp-error" role="alert">{errors.new}</div>}
        <div className="cp-actions">
          <button type="submit" className="cp-btn" disabled={busy === 'new'}>{busy === 'new' ? 'Adding...' : 'Add wallet'}</button>
        </div>
      </form>

      {wallets.length === 0 ? (
        <div className="cp-empty">No wallets yet. Add one so students can pay for courses.</div>
      ) : (
        <div className="cp-list">
          {wallets.map((wallet) => (
            <form key={wallet.id} className="cp-card" onSubmit={(e) => save(e, wallet)} aria-label={`${wallet.name} wallet`}>
              <div className="cp-actions" style={{ justifyContent: 'space-between' }}>
                <h2 className="cp-card-title">{wallet.name}</h2>
                {!wallet.isActive && <span className="cp-badge cp-badge--expired">Hidden from students</span>}
              </div>
              <div className="cp-row">
                <ImageSlot wallet={wallet} kind="logo" onChanged={replaceWallet}
                  onError={(m) => setErrors((prev) => ({ ...prev, [wallet.id]: m }))} />
                <ImageSlot wallet={wallet} kind="qr" onChanged={replaceWallet}
                  onError={(m) => setErrors((prev) => ({ ...prev, [wallet.id]: m }))} />
              </div>
              <WalletFields id={wallet.id} draft={drafts[wallet.id] ?? toDraft(wallet)} disabled={busy === wallet.id}
                onChange={(d) => setDrafts((prev) => ({ ...prev, [wallet.id]: d }))} />
              {errors[wallet.id] && <div className="cp-error" role="alert">{errors[wallet.id]}</div>}
              <div className="cp-actions">
                <button type="submit" className="cp-btn" disabled={busy === wallet.id}>{busy === wallet.id ? 'Saving...' : 'Save'}</button>
                <button type="button" className="cp-btn cp-btn--ghost" disabled={busy === wallet.id} onClick={() => remove(wallet)}>Delete</button>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
