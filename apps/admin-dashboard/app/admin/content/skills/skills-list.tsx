'use client';

import { useState, useTransition } from 'react';

import type {
  AdminSkillSummary,
  CreateSkillPayload,
  UpdateSkillPayload,
  SkillDomain,
} from '../../../../lib/api/admin-skills-api';

const SKILL_DOMAINS: SkillDomain[] = [
  'grammar',
  'vocabulary',
  'reading',
  'listening',
  'speaking',
  'writing',
  'pronunciation',
  'functional_language',
];

type Props = {
  readonly skills: AdminSkillSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly onCreateSkill: (
    payload: CreateSkillPayload,
  ) => Promise<{ error?: string }>;
  readonly onUpdateSkill: (
    id: string,
    payload: UpdateSkillPayload,
  ) => Promise<{ error?: string }>;
};

type FormMode = { type: 'idle' } | { type: 'create' } | { type: 'edit'; skill: AdminSkillSummary };

export function SkillsList({
  skills,
  total,
  page,
  totalPages,
  onCreateSkill,
  onUpdateSkill,
}: Props) {
  const [formMode, setFormMode] = useState<FormMode>({ type: 'idle' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = formMode.type === 'edit' ? formMode.skill : null;

  function openCreate() {
    setFormMode({ type: 'create' });
    setFormError(null);
  }

  function openEdit(skill: AdminSkillSummary) {
    setFormMode({ type: 'edit', skill });
    setFormError(null);
  }

  function closeForm() {
    setFormMode({ type: 'idle' });
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const key = (form.elements.namedItem('key') as HTMLInputElement).value.trim();
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const domain = (form.elements.namedItem('domain') as HTMLSelectElement).value as SkillDomain;

    if (formMode.type === 'create' && !key) {
      setFormError('Skill key is required.');
      return;
    }
    if (!title) {
      setFormError('Title is required.');
      return;
    }

    startTransition(async () => {
      setFormError(null);
      let result: { error?: string };

      if (formMode.type === 'create') {
        result = await onCreateSkill({ key, title, domain });
      } else if (formMode.type === 'edit' && editing) {
        result = await onUpdateSkill(editing.id, { title, domain });
      } else {
        return;
      }

      if (result.error) {
        setFormError(result.error);
      } else {
        closeForm();
      }
    });
  }

  return (
    <div className="admin-list-section">
      <div className="admin-list-toolbar">
        <p className="admin-list-count">
          {total} skill{total !== 1 ? 's' : ''} total
        </p>
        <button
          className="admin-action-btn"
          onClick={openCreate}
          disabled={isPending}
          type="button"
        >
          + New Skill
        </button>
      </div>

      {formMode.type !== 'idle' && (
        <div className="admin-inline-form-wrapper">
          <h2 className="admin-inline-form-title">
            {formMode.type === 'create' ? 'New Skill' : `Edit: ${editing?.title}`}
          </h2>

          <form onSubmit={handleSubmit} className="admin-inline-form">
            <label className="admin-form-field">
              <span>Key {formMode.type === 'create' ? '*' : '(read-only)'}</span>
              <input
                name="key"
                type="text"
                defaultValue={editing?.key ?? ''}
                required={formMode.type === 'create'}
                disabled={isPending || formMode.type === 'edit'}
                placeholder="e.g. grammar.past_simple.forms"
              />
              <small>Stable dot-delimited identifier. Cannot be changed after creation.</small>
            </label>

            <label className="admin-form-field">
              <span>Title *</span>
              <input
                name="title"
                type="text"
                defaultValue={editing?.title ?? ''}
                required
                disabled={isPending}
                placeholder="e.g. Past Simple — Forms"
              />
            </label>

            <label className="admin-form-field">
              <span>Domain *</span>
              <select
                name="domain"
                defaultValue={editing?.domain ?? 'grammar'}
                disabled={isPending}
              >
                {SKILL_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>

            {formError && (
              <p className="admin-form-error" role="alert">
                {formError}
              </p>
            )}

            <div className="admin-form-actions">
              <button type="submit" className="admin-action-btn" disabled={isPending}>
                {isPending ? 'Saving…' : formMode.type === 'create' ? 'Create' : 'Save'}
              </button>
              <button
                type="button"
                className="admin-action-btn admin-action-btn--secondary"
                onClick={closeForm}
                disabled={isPending}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {skills.length === 0 && formMode.type === 'idle' ? (
        <p className="admin-empty-state">No skills found. Create the first one above.</p>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Title</th>
              <th>Domain</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.id}>
                <td>
                  <code className="admin-code-tag">{skill.key}</code>
                </td>
                <td className="admin-cell-primary">{skill.title}</td>
                <td>{skill.domain.replace('_', ' ')}</td>
                <td>
                  <span
                    className={`status-badge ${
                      skill.status === 'published'
                        ? 'status-published'
                        : skill.status === 'archived'
                        ? 'status-archived'
                        : 'status-draft'
                    }`}
                  >
                    {skill.status}
                  </span>
                </td>
                <td>
                  <button
                    className="admin-row-edit-btn"
                    onClick={() => openEdit(skill)}
                    disabled={isPending || skill.status === 'archived'}
                    type="button"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="admin-pagination">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="admin-pagination-link">
              ← Previous
            </a>
          )}
          <span className="admin-pagination-info">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a href={`?page=${page + 1}`} className="admin-pagination-link">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
