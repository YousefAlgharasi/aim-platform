'use client';

import { useState, useEffect, useCallback } from 'react';
import { backendFetch } from '../../../lib/api/client-api-helpers';

type Tab = 'links' | 'invitations' | 'consents';

type Stats = {
  totalLinks: number;
  activeLinks: number;
  pendingLinks: number;
  revokedLinks: number;
  totalInvitations: number;
  pendingInvitations: number;
  acceptedInvitations: number;
  expiredInvitations: number;
  totalConsents: number;
  grantedConsents: number;
  revokedConsents: number;
};

type Link = {
  id: string;
  parentId: string;
  parentEmail: string | null;
  childId: string;
  childEmail: string | null;
  relationshipType: string;
  status: string;
  linkedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

type Invitation = {
  id: string;
  parentId: string;
  parentEmail: string | null;
  childEmail: string | null;
  childId: string | null;
  relationshipType: string;
  status: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

type Consent = {
  id: string;
  parentChildLinkId: string;
  parentEmail: string | null;
  childEmail: string | null;
  consentType: string;
  status: string;
  grantedAt: string;
  revokedAt: string | null;
};

const LINK_STATUSES = ['pending', 'active', 'revoked'];
const INV_STATUSES = ['pending', 'accepted', 'rejected', 'expired', 'cancelled'];
const CONSENT_STATUSES = ['granted', 'revoked'];
const CONSENT_TYPES = ['progress_view', 'assessment_view', 'activity_view', 'report_view', 'full_access'];

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  active: { bg: 'color-mix(in srgb, var(--color-success-500) 14%, transparent)', fg: 'var(--color-success-600)' },
  granted: { bg: 'color-mix(in srgb, var(--color-success-500) 14%, transparent)', fg: 'var(--color-success-600)' },
  accepted: { bg: 'color-mix(in srgb, var(--color-success-500) 14%, transparent)', fg: 'var(--color-success-600)' },
  pending: { bg: 'color-mix(in srgb, var(--color-warning-500, #f59e0b) 14%, transparent)', fg: 'var(--color-warning-600, #d97706)' },
  revoked: { bg: 'color-mix(in srgb, var(--color-error-500) 14%, transparent)', fg: 'var(--color-error-600)' },
  cancelled: { bg: 'color-mix(in srgb, var(--color-error-500) 14%, transparent)', fg: 'var(--color-error-600)' },
  rejected: { bg: 'color-mix(in srgb, var(--color-error-500) 14%, transparent)', fg: 'var(--color-error-600)' },
  expired: { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)' },
};

const REL_STYLE: Record<string, { bg: string; fg: string }> = {
  parent: { bg: '#ede9fe', fg: '#6d28d9' },
  guardian: { bg: '#e0f2fe', fg: '#0369a1' },
  other: { bg: '#f1f5f9', fg: '#475569' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)' };
  return <span className="ap-badge" style={{ background: s.bg, color: s.fg }}>{status}</span>;
}

function RelBadge({ type }: { type: string }) {
  const s = REL_STYLE[type] ?? REL_STYLE.other;
  return <span className="ap-badge" style={{ background: s.bg, color: s.fg }}>{type}</span>;
}

function ConsentTypeBadge({ type }: { type: string }) {
  return <code className="ap-consent-code">{type.replace(/_/g, ' ')}</code>;
}

export default function AdminParentsPage() {
  const [tab, setTab] = useState<Tab>('links');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  // Links
  const [links, setLinks] = useState<Link[]>([]);
  const [linksTotal, setLinksTotal] = useState(0);
  const [linksPage, setLinksPage] = useState(1);
  const [linksStatus, setLinksStatus] = useState('');
  const [linksSearch, setLinksSearch] = useState('');

  // Invitations
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invTotal, setInvTotal] = useState(0);
  const [invPage, setInvPage] = useState(1);
  const [invStatus, setInvStatus] = useState('');
  const [invSearch, setInvSearch] = useState('');

  // Consents
  const [consents, setConsents] = useState<Consent[]>([]);
  const [conTotal, setConTotal] = useState(0);
  const [conPage, setConPage] = useState(1);
  const [conStatus, setConStatus] = useState('');
  const [conType, setConType] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await backendFetch('/admin/parents/stats');
      if (res.ok) {
        const json = await res.json();
        setStats(json?.data ?? json);
      }
    } catch { /* silent */ }
  }, []);

  const fetchLinks = useCallback(async (pg: number, status: string, search: string) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(pg), limit: '20' });
      if (status) qs.set('status', status);
      if (search) qs.set('search', search);
      const res = await backendFetch(`/admin/parents/links?${qs}`);
      if (res.ok) {
        const json = await res.json();
        const d = json?.data ?? json;
        setLinks(d.links ?? []);
        setLinksTotal(d.total ?? 0);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const fetchInvitations = useCallback(async (pg: number, status: string, search: string) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(pg), limit: '20' });
      if (status) qs.set('status', status);
      if (search) qs.set('search', search);
      const res = await backendFetch(`/admin/parents/invitations?${qs}`);
      if (res.ok) {
        const json = await res.json();
        const d = json?.data ?? json;
        setInvitations(d.invitations ?? []);
        setInvTotal(d.total ?? 0);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const fetchConsents = useCallback(async (pg: number, status: string, consentType: string) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(pg), limit: '20' });
      if (status) qs.set('status', status);
      if (consentType) qs.set('consentType', consentType);
      const res = await backendFetch(`/admin/parents/consents?${qs}`);
      if (res.ok) {
        const json = await res.json();
        const d = json?.data ?? json;
        setConsents(d.consents ?? []);
        setConTotal(d.total ?? 0);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    if (tab === 'links') fetchLinks(linksPage, linksStatus, linksSearch);
    else if (tab === 'invitations') fetchInvitations(invPage, invStatus, invSearch);
    else fetchConsents(conPage, conStatus, conType);
  }, [tab, linksPage, linksStatus, linksSearch, invPage, invStatus, invSearch, conPage, conStatus, conType, fetchLinks, fetchInvitations, fetchConsents]);

  const TABS: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'links', label: 'Links', icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757', count: stats?.totalLinks },
    { key: 'invitations', label: 'Invitations', icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75', count: stats?.totalInvitations },
    { key: 'consents', label: 'Consents', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', count: stats?.totalConsents },
  ];

  const linksTotalPages = Math.ceil(linksTotal / 20);
  const invTotalPages = Math.ceil(invTotal / 20);
  const conTotalPages = Math.ceil(conTotal / 20);

  return (
    <section className="ap-page">
      {/* Header */}
      <div className="ap-header">
        <p className="ap-eyebrow">Family Management</p>
        <h1 className="ap-title">Parents & Guardians</h1>
        <p className="ap-subtitle">Manage parent-child links, invitations, consent, and progress visibility.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="ap-stats-grid">
          <div className="ap-stat-card">
            <div className="ap-stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757"/></svg>
            </div>
            <div className="ap-stat-info">
              <span className="ap-stat-num">{stats.totalLinks}</span>
              <span className="ap-stat-label">Total Links</span>
            </div>
            <div className="ap-stat-breakdown">
              <span className="ap-stat-mini ap-stat-mini--green">{stats.activeLinks} active</span>
              <span className="ap-stat-mini ap-stat-mini--yellow">{stats.pendingLinks} pending</span>
              <span className="ap-stat-mini ap-stat-mini--red">{stats.revokedLinks} revoked</span>
            </div>
          </div>

          <div className="ap-stat-card">
            <div className="ap-stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
            </div>
            <div className="ap-stat-info">
              <span className="ap-stat-num">{stats.totalInvitations}</span>
              <span className="ap-stat-label">Invitations</span>
            </div>
            <div className="ap-stat-breakdown">
              <span className="ap-stat-mini ap-stat-mini--yellow">{stats.pendingInvitations} pending</span>
              <span className="ap-stat-mini ap-stat-mini--green">{stats.acceptedInvitations} accepted</span>
              <span className="ap-stat-mini ap-stat-mini--gray">{stats.expiredInvitations} expired</span>
            </div>
          </div>

          <div className="ap-stat-card">
            <div className="ap-stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
            </div>
            <div className="ap-stat-info">
              <span className="ap-stat-num">{stats.totalConsents}</span>
              <span className="ap-stat-label">Consents</span>
            </div>
            <div className="ap-stat-breakdown">
              <span className="ap-stat-mini ap-stat-mini--green">{stats.grantedConsents} granted</span>
              <span className="ap-stat-mini ap-stat-mini--red">{stats.revokedConsents} revoked</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="ap-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`ap-tab ${tab === t.key ? 'ap-tab--active' : ''}`}
            onClick={() => { setTab(t.key); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
            {t.label}
            {t.count !== undefined && <span className="ap-tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Links Tab */}
      {tab === 'links' && (
        <div className="ap-section">
          <div className="ap-filters">
            <input
              type="text"
              value={linksSearch}
              onChange={(e) => { setLinksSearch(e.target.value); setLinksPage(1); }}
              placeholder="Search by parent or child email…"
              className="ap-search"
            />
            <select value={linksStatus} onChange={(e) => { setLinksStatus(e.target.value); setLinksPage(1); }} className="ap-select">
              <option value="">All statuses</option>
              {LINK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="ap-loading">Loading…</div>
          ) : links.length === 0 ? (
            <div className="ap-empty">No parent-child links found.</div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Parent</th>
                    <th>Child</th>
                    <th className="ap-th-narrow">Type</th>
                    <th className="ap-th-narrow">Status</th>
                    <th className="ap-th-date">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((l) => (
                    <tr key={l.id}>
                      <td className="ap-td-email">{l.parentEmail ?? <span className="ap-null">{l.parentId.slice(0, 8)}…</span>}</td>
                      <td className="ap-td-email">{l.childEmail ?? <span className="ap-null">{l.childId.slice(0, 8)}…</span>}</td>
                      <td><RelBadge type={l.relationshipType} /></td>
                      <td><StatusBadge status={l.status} /></td>
                      <td className="ap-td-date">{fmtDate(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={linksPage} total={linksTotalPages} onChange={setLinksPage} />
        </div>
      )}

      {/* Invitations Tab */}
      {tab === 'invitations' && (
        <div className="ap-section">
          <div className="ap-filters">
            <input
              type="text"
              value={invSearch}
              onChange={(e) => { setInvSearch(e.target.value); setInvPage(1); }}
              placeholder="Search by email…"
              className="ap-search"
            />
            <select value={invStatus} onChange={(e) => { setInvStatus(e.target.value); setInvPage(1); }} className="ap-select">
              <option value="">All statuses</option>
              {INV_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="ap-loading">Loading…</div>
          ) : invitations.length === 0 ? (
            <div className="ap-empty">No invitations found.</div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>From (Parent)</th>
                    <th>To (Child Email)</th>
                    <th className="ap-th-narrow">Type</th>
                    <th className="ap-th-narrow">Status</th>
                    <th className="ap-th-date">Expires</th>
                    <th className="ap-th-date">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td className="ap-td-email">{inv.parentEmail ?? <span className="ap-null">{inv.parentId.slice(0, 8)}…</span>}</td>
                      <td className="ap-td-email">{inv.childEmail ?? <span className="ap-null">—</span>}</td>
                      <td><RelBadge type={inv.relationshipType} /></td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td className="ap-td-date">{fmtDate(inv.expiresAt)}</td>
                      <td className="ap-td-date">{fmtDate(inv.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={invPage} total={invTotalPages} onChange={setInvPage} />
        </div>
      )}

      {/* Consents Tab */}
      {tab === 'consents' && (
        <div className="ap-section">
          <div className="ap-filters">
            <select value={conStatus} onChange={(e) => { setConStatus(e.target.value); setConPage(1); }} className="ap-select">
              <option value="">All statuses</option>
              {CONSENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={conType} onChange={(e) => { setConType(e.target.value); setConPage(1); }} className="ap-select">
              <option value="">All types</option>
              {CONSENT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="ap-loading">Loading…</div>
          ) : consents.length === 0 ? (
            <div className="ap-empty">No consent records found.</div>
          ) : (
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Parent</th>
                    <th>Child</th>
                    <th>Consent Type</th>
                    <th className="ap-th-narrow">Status</th>
                    <th className="ap-th-date">Granted</th>
                    <th className="ap-th-date">Revoked</th>
                  </tr>
                </thead>
                <tbody>
                  {consents.map((c) => (
                    <tr key={c.id}>
                      <td className="ap-td-email">{c.parentEmail ?? <span className="ap-null">—</span>}</td>
                      <td className="ap-td-email">{c.childEmail ?? <span className="ap-null">—</span>}</td>
                      <td><ConsentTypeBadge type={c.consentType} /></td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="ap-td-date">{fmtDate(c.grantedAt)}</td>
                      <td className="ap-td-date">{c.revokedAt ? fmtDate(c.revokedAt) : <span className="ap-null">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={conPage} total={conTotalPages} onChange={setConPage} />
        </div>
      )}

      <style>{`
        .ap-page { display: flex; flex-direction: column; gap: 24px; }
        .ap-header { display: flex; flex-direction: column; gap: 2px; }
        .ap-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ap-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ap-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }

        .ap-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
        .ap-stat-card {
          display: flex; flex-direction: column; gap: 12px;
          padding: 18px 20px; background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .ap-stat-card > div:first-child { display: flex; align-items: flex-start; gap: 14px; }
        .ap-stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ap-stat-info { display: flex; flex-direction: column; }
        .ap-stat-num { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1; }
        .ap-stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
        .ap-stat-breakdown { display: flex; gap: 8px; flex-wrap: wrap; }
        .ap-stat-mini { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
        .ap-stat-mini--green { background: color-mix(in srgb, var(--color-success-500) 12%, transparent); color: var(--color-success-600); }
        .ap-stat-mini--yellow { background: color-mix(in srgb, var(--color-warning-500, #f59e0b) 12%, transparent); color: var(--color-warning-600, #d97706); }
        .ap-stat-mini--red { background: color-mix(in srgb, var(--color-error-500) 12%, transparent); color: var(--color-error-600); }
        .ap-stat-mini--gray { background: var(--surface-sunken); color: var(--text-muted); }

        .ap-tabs {
          display: flex; gap: 4px; border-bottom: 1px solid var(--border); padding-bottom: 0;
        }
        .ap-tab {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 16px; border: none; background: none;
          font-size: 14px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: all 0.15s;
        }
        .ap-tab:hover { color: var(--text-primary); }
        .ap-tab--active {
          color: var(--color-primary-500); border-bottom-color: var(--color-primary-500);
          font-weight: 600;
        }
        .ap-tab-count {
          font-size: 11px; font-weight: 700; padding: 1px 7px;
          border-radius: 10px; background: var(--surface-sunken); color: var(--text-muted);
        }
        .ap-tab--active .ap-tab-count {
          background: color-mix(in srgb, var(--color-primary-500) 12%, transparent);
          color: var(--color-primary-500);
        }

        .ap-section { display: flex; flex-direction: column; gap: 14px; }
        .ap-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .ap-search {
          flex: 1; min-width: 200px; max-width: 320px; height: 38px;
          padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-md);
          background: var(--surface); color: var(--text-primary); font-size: 13px; font-family: inherit;
        }
        .ap-search:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }
        .ap-search::placeholder { color: var(--text-muted); }
        .ap-select {
          height: 38px; padding: 0 10px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-primary); font-size: 13px; font-family: inherit; min-width: 130px;
        }
        .ap-select:focus {
          outline: none; border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
        }

        .ap-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .ap-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .ap-table th {
          text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .ap-table td {
          padding: 10px 14px; font-size: 13px; color: var(--text-primary);
          border-bottom: 1px solid var(--border);
        }
        .ap-table tbody tr:last-child td { border-bottom: none; }
        .ap-table tbody tr:hover { background: var(--state-hover, color-mix(in srgb, var(--color-primary-500) 3%, transparent)); }
        .ap-th-narrow { width: 100px; }
        .ap-th-date { width: 120px; }
        .ap-td-email {
          max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-weight: 500;
        }
        .ap-td-date { font-size: 12px; color: var(--text-secondary); }
        .ap-null { color: var(--text-muted); font-style: italic; }

        .ap-badge {
          display: inline-block; padding: 2px 9px; border-radius: 10px;
          font-size: 11px; font-weight: 600; text-transform: capitalize;
        }
        .ap-consent-code {
          font-size: 12px; font-family: var(--font-mono, monospace);
          background: var(--surface-sunken); padding: 2px 8px;
          border-radius: 4px; color: var(--text-primary); text-transform: capitalize;
        }

        .ap-loading, .ap-empty {
          padding: 48px 20px; text-align: center; font-size: 14px; color: var(--text-muted);
        }

        .ap-pagination {
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .ap-page-btn {
          font-size: 13px; font-weight: 600; color: var(--color-primary-500);
          background: none; border: none; cursor: pointer; padding: 6px 12px;
          border-radius: var(--radius-sm); font-family: inherit;
        }
        .ap-page-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .ap-page-btn:disabled { color: var(--text-muted); cursor: default; }
        .ap-page-info { font-size: 13px; color: var(--text-secondary); }

        @media (max-width: 640px) {
          .ap-stats-grid { grid-template-columns: 1fr; }
          .ap-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .ap-filters { flex-direction: column; }
          .ap-search { max-width: none; }
        }
      `}</style>
    </section>
  );
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <nav className="ap-pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="ap-page-btn">← Prev</button>
      <span className="ap-page-info">Page {page} of {total}</span>
      <button type="button" disabled={page >= total} onClick={() => onChange(page + 1)} className="ap-page-btn">Next →</button>
    </nav>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '—'; }
}
