// Phase 3 — P3-056
// Admin objectives list client component.
//
// Scope: Curriculum & Content System — objectives only.
//
// Security rules:
// - No token, credentials, or secrets are handled here.
// - Status transitions are read-only display; backend controls publish/archive.
// - Backend authority note is rendered on every state.

'use client';

import { useState, useTransition } from 'react';

import type {
  AdminObjectiveSummary,
  CreateObjectivePayload,
  UpdateObjectivePayload,
} from '../../../../lib/api/admin-objectives-api';

type Props = {
  readonly objectives: AdminObjectiveSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly onCreateObjective: (
    payload: CreateObjectivePayload,
  ) => Promise<{ error?: string }>;
  readonly onUpdateObjective: (
    id: string,
    payload: UpdateObjectivePayload,
  ) => Promise<{ error?: string }>;
};

type FormMode = { type: 'idle' } | { type: 'create' } | { type: 'edit'; objective: AdminObjectiveSummary };

export function ObjectivesList({
  objectives,
  total,
  page,
  totalPages,
  onCreateObjective,
  onUpdateObjective,
}: Props) {
  const [formMode, setFormMode] = useState<FormMode>({ type: 'idle' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = formMode.type === 'edit' ? formMode.objective : null;

  function openCreate() {
    setFormMode({ type: 'create' });
    setFormError(null);
  }

  function openEdit(objective: AdminObjectiveSummary) {
    setFormMode({ type: 'edit', objective });
    setFormError(null);
  }

  function closeForm() {
    setFormMode({ type: 'idle' });
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const key = (form.elements.namedItem('key') as HTMLInputElement).value.trim() || null;
    const description =
      (form.elements.namedItem('description') as HTMLTextAreaElement).value.trim() || null;

    if (!title) {
      setFormError('Title is required.');
      return;
    }

    startTransition(async () => {
      setFormError(null);
      let result: { error?: string };

      if (formMode.type === 'create') {
        result = await onCreateObjective({ title, key, description });
      } else if (formMode.type === 'edit' && editing) {
        result = await onUpdateObjective(editing.id, { title, key, description });
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
          {total} objective{total !== 1 ? 's' : ''} total
        </p>
        <button
          className="admin-action-btn"
          onClick={openCreate}
          disabled={isPending}
          type="button"
        >
          + New Objective
        </button>
      </div>

      {formMode.type !== 'idle' && (
        <div className="admin-inline-form-wrapper">
          <h2 className="admin-inline-form-title">
            {formMode.type === 'create' ? 'New Objective' : `Edit: ${editing?.title}`}
          </h2>

          <form onSubmit={handleSubmit} className="admin-inline-form">
            <label className="admin-form-field">
              <span>Title *</span>
              <input
                name="title"
                type="text"
                defaultValue={editing?.title ?? ''}
                required
                disabled={isPending}
                placeholder="e.g. Understand past simple sentence structure"
              />
            </label>

            <label className="admin-form-field">
              <span>Key (optional)</span>
              <input
                name="key"
                type="text"
                defaultValue={editing?.key ?? ''}
                disabled={isPending}
                placeholder="e.g. grammar.past_simple.understand_structure"
              />
              <small>Stable dot-delimited identifier. Leave blank to let backend assign.</small>
            </label>

            <label className="admin-form-field">
              <span>Description (optional)</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={editing?.description ?? ''}
                disabled={isPending}
                placeholder="What the learner will be able to do after meeting this objective."
              />
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

      {objectives.length === 0 && formMode.type === 'idle' ? (
        <p className="admin-empty-state">No objectives found. Create the first one above.</p>
      ) : (
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Key</th>
              <th>Status</th>
              <th>Description</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {objectives.map((obj) => (
              <tr key={obj.id}>
                <td className="admin-cell-primary">{obj.title}</td>
                <td>
                  {obj.key ? (
                    <code className="admin-code-tag">{obj.key}</code>
                  ) : (
                    <span className="admin-muted">—</span>
                  )}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      obj.status === 'published'
                        ? 'status-published'
                        : obj.status === 'archived'
                        ? 'status-archived'
                        : 'status-draft'
                    }`}
                  >
                    {obj.status}
                  </span>
                </td>
                <td className="admin-cell-truncate">
                  {obj.description ?? <span className="admin-muted">—</span>}
                </td>
                <td>
                  <button
                    className="admin-row-edit-btn"
                    onClick={() => openEdit(obj)}
                    disabled={isPending || obj.status === 'archived'}
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
