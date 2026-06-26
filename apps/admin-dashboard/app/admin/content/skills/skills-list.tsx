'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import type {
  AdminSkillSummary,
  CreateSkillPayload,
  UpdateSkillPayload,
  SkillDomain,
} from '../../../../lib/api/admin-skills-api';

const SKILL_DOMAINS: SkillDomain[] = [
  'grammar', 'vocabulary', 'reading', 'listening',
  'speaking', 'writing', 'pronunciation', 'functional_language',
];

const STATUS_DOT: Record<string, string> = {
  draft: 'var(--text-muted)',
  published: 'var(--color-success-500)',
  archived: 'var(--text-muted)',
};

const DOMAIN_COLOR: Record<string, string> = {
  grammar: '#6366f1',
  vocabulary: '#8b5cf6',
  reading: '#22c55e',
  listening: '#f59e0b',
  speaking: '#64748b',
  writing: '#64748b',
  pronunciation: '#6366f1',
  functional_language: '#f59e0b',
};

type Props = {
  readonly skills: AdminSkillSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly statusFilter?: string;
  readonly domainFilter?: string;
  readonly searchQuery?: string;
  readonly onCreateSkill: (payload: CreateSkillPayload) => Promise<{ error?: string }>;
  readonly onUpdateSkill: (id: string, payload: UpdateSkillPayload) => Promise<{ error?: string }>;
};

type FormMode = { type: 'idle' } | { type: 'create' } | { type: 'edit'; skill: AdminSkillSummary };

export function SkillsList({
  skills, total, page, totalPages,
  statusFilter, domainFilter, searchQuery,
  onCreateSkill, onUpdateSkill,
}: Props) {
  const router = useRouter();
  const [formMode, setFormMode] = useState<FormMode>({ type: 'idle' });
  const [key, setKey] = useState('');
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState<SkillDomain>('grammar');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const editing = formMode.type === 'edit' ? formMode.skill : null;

  function openCreate() {
    setFormMode({ type: 'create' });
    setKey(''); setTitle(''); setDomain('grammar');
    setFormError(null); setFieldErrors({});
  }

  function openEdit(skill: AdminSkillSummary) {
    setFormMode({ type: 'edit', skill });
    setKey(skill.key); setTitle(skill.title); setDomain(skill.domain);
    setFormError(null); setFieldErrors({});
  }

  function closeForm() {
    setFormMode({ type: 'idle' });
    setFormError(null); setFieldErrors({});
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (formMode.type === 'create' && !key.trim()) errors.key = 'Skill key is required.';
    if (formMode.type === 'create' && key.trim() && !/^[a-z0-9]+(?:[._][a-z0-9]+)*$/.test(key.trim())) {
      errors.key = 'Key: lowercase with dots/underscores (e.g. grammar.past_simple.forms).';
    }
    if (!title.trim()) errors.title = 'Title is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setFormError(null);
    startTransition(async () => {
      let result: { error?: string };
      if (formMode.type === 'create') {
        result = await onCreateSkill({ key: key.trim(), title: title.trim(), domain });
      } else if (editing) {
        result = await onUpdateSkill(editing.id, { title: title.trim(), domain });
      } else return;
      if (result.error) setFormError(result.error);
      else { closeForm(); router.refresh(); }
    });
  }

  if (formMode.type !== 'idle') {
    return (
      <div className="cf-card">
        <div className="cf-header">
          <h2 className="cf-title">{formMode.type === 'create' ? 'New Skill' : `Edit: ${editing?.title}`}</h2>
          <button type="button" className="cf-close" onClick={closeForm} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {formError && <div className="admin-error-banner" role="alert">{formError}</div>}

        <form onSubmit={handleSubmit} className="cf-form">
          <div className="cf-field">
            <label htmlFor="skf-key" className="cf-label">
              Key {formMode.type === 'create' && <span className="cf-req">*</span>}
            </label>
            <input id="skf-key" type="text" value={key} onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. grammar.past_simple.forms"
              disabled={isPending || formMode.type === 'edit'} maxLength={255}
              className={`cf-input ${fieldErrors.key ? 'cf-input--error' : ''}`} />
            <span className="cf-hint">
              {formMode.type === 'create' ? 'Stable dot-delimited identifier. Cannot change after creation.' : 'Read-only after creation.'}
            </span>
            {fieldErrors.key && <span className="cf-error">{fieldErrors.key}</span>}
          </div>

          <div className="cf-field">
            <label htmlFor="skf-title" className="cf-label">Title <span className="cf-req">*</span></label>
            <input id="skf-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Past Simple — Forms" disabled={isPending} maxLength={255}
              className={`cf-input ${fieldErrors.title ? 'cf-input--error' : ''}`} />
            {fieldErrors.title && <span className="cf-error">{fieldErrors.title}</span>}
          </div>

          <div className="cf-field">
            <label htmlFor="skf-domain" className="cf-label">Domain <span className="cf-req">*</span></label>
            <select id="skf-domain" value={domain} onChange={(e) => setDomain(e.target.value as SkillDomain)}
              disabled={isPending} className="cf-input" style={{ height: 38 }}>
              {SKILL_DOMAINS.map((d) => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
            </select>
          </div>

          <div className="cf-actions">
            <button type="submit" disabled={isPending} className="cf-submit">
              {isPending ? 'Saving…' : formMode.type === 'create' ? 'Create Skill' : 'Save Changes'}
            </button>
            <button type="button" onClick={closeForm} disabled={isPending} className="cf-cancel">Cancel</button>
          </div>
        </form>

        <style>{`
          .cf-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; max-width: 560px; }
          .cf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .cf-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); }
          .cf-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); }
          .cf-close:hover { color: var(--text-primary); }
          .cf-form { display: flex; flex-direction: column; gap: 16px; }
          .cf-field { display: flex; flex-direction: column; gap: 4px; }
          .cf-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
          .cf-req { color: var(--color-error-500); }
          .cf-input {
            padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
            background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit;
          }
          .cf-input:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
          .cf-input--error { border-color: var(--color-error-500); }
          .cf-hint { font-size: 12px; color: var(--text-muted); }
          .cf-error { font-size: 12px; color: var(--color-error-500); font-weight: 500; }
          .cf-actions { display: flex; gap: 8px; margin-top: 4px; }
          .cf-submit {
            height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md);
            background: var(--color-primary-500); color: white;
            font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
          }
          .cf-submit:hover:not(:disabled) { background: var(--color-primary-600); }
          .cf-submit:disabled { opacity: 0.5; cursor: not-allowed; }
          .cf-cancel {
            height: 38px; padding: 0 18px; border: 1px solid var(--border);
            border-radius: var(--radius-md); background: var(--surface);
            color: var(--text-secondary); font-size: 13px; font-weight: 500;
            font-family: inherit; cursor: pointer;
          }
          .cf-cancel:hover { background: var(--surface-sunken); }
        `}</style>
      </div>
    );
  }

  function buildHref(p: number) {
    const params = new URLSearchParams();
    params.set('page', String(p));
    if (statusFilter) params.set('status', statusFilter);
    if (domainFilter) params.set('domain', domainFilter);
    if (searchQuery) params.set('q', searchQuery);
    return `/admin/content/skills?${params.toString()}`;
  }

  return (
    <div className="sl-root">
      <div className="sl-toolbar">
        <button type="button" className="sl-create-btn" onClick={openCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
          New Skill
        </button>
      </div>

      {skills.length === 0 && (
        <div className="sl-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.421 48.421 0 01-4.185-.408c-.009 1.607.02 3.217.085 4.828"/></svg>
          <p className="sl-empty-title">No skills found</p>
          <p className="sl-empty-desc">{statusFilter || domainFilter || searchQuery ? 'Try adjusting your filters.' : 'Create your first skill to get started.'}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="sl-table-wrap">
          <table className="sl-table">
            <thead>
              <tr>
                <th className="sl-th">Skill</th>
                <th className="sl-th sl-th--domain">Domain</th>
                <th className="sl-th sl-th--status">Status</th>
                <th className="sl-th sl-th--date">Updated</th>
                <th className="sl-th sl-th--actions" />
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="sl-row">
                  <td className="sl-td">
                    <div className="sl-info">
                      <span className="sl-name">{skill.title}</span>
                      <code className="sl-key">{skill.key}</code>
                    </div>
                  </td>
                  <td className="sl-td">
                    <span className="sl-domain" style={{ borderColor: DOMAIN_COLOR[skill.domain] ?? '#64748b' }}>
                      {skill.domain.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="sl-td">
                    <span className="sl-status">
                      <span className="sl-status-dot" style={{ background: STATUS_DOT[skill.status] ?? 'var(--text-muted)' }} />
                      {skill.status}
                    </span>
                  </td>
                  <td className="sl-td sl-td--date">{fmtDate(skill.updatedAt)}</td>
                  <td className="sl-td sl-td--actions">
                    <button type="button" className="sl-edit-btn" onClick={() => openEdit(skill)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="sl-pagination">
          {page > 1 && <Link href={buildHref(page - 1)} className="sl-page-btn">← Previous</Link>}
          <span className="sl-page-info">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={buildHref(page + 1)} className="sl-page-btn">Next →</Link>}
        </nav>
      )}

      <style>{`
        .sl-root { display: flex; flex-direction: column; gap: 14px; }
        .sl-toolbar { display: flex; justify-content: flex-end; }
        .sl-create-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px;
          padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .sl-create-btn:hover { background: var(--color-primary-600); }
        .sl-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .sl-table { width: 100%; border-collapse: collapse; min-width: 520px; }
        .sl-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .sl-th--domain { width: 130px; }
        .sl-th--status { width: 100px; }
        .sl-th--date { width: 110px; }
        .sl-th--actions { width: 70px; }
        .sl-row { transition: background 0.1s; }
        .sl-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .sl-row:not(:last-child) .sl-td { border-bottom: 1px solid var(--border); }
        .sl-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .sl-td--date { font-size: 12px; color: var(--text-secondary); }
        .sl-td--actions { text-align: right; }
        .sl-info { display: flex; flex-direction: column; gap: 2px; }
        .sl-name { font-weight: 600; color: var(--text-primary); }
        .sl-key { font-size: 12px; font-family: var(--font-mono, monospace); color: var(--text-muted); }
        .sl-domain {
          display: inline-block; font-size: 12px; font-weight: 500; color: var(--text-secondary);
          text-transform: capitalize; padding: 2px 8px; border-radius: 12px;
          border: 1px solid; background: var(--surface);
        }
        .sl-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .sl-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .sl-edit-btn {
          background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 4px 12px; font-size: 12px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
        }
        .sl-edit-btn:hover { background: var(--surface-sunken); color: var(--text-primary); }
        .sl-pagination { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0; }
        .sl-page-btn { font-size: 13px; font-weight: 600; color: var(--color-primary-500); text-decoration: none; padding: 6px 12px; border-radius: var(--radius-sm); }
        .sl-page-btn:hover { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .sl-page-info { font-size: 13px; color: var(--text-secondary); }
        .sl-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 60px 20px; text-align: center; }
        .sl-empty-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .sl-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .sl-th--domain, .sl-td:nth-child(2) { display: none; }
        }
      `}</style>
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '—'; }
}
