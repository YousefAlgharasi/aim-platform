'use client';
// P11-027: Admin skills list client component using AIM design system.
// Backend is final authority for skill data and status transitions.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type {
  AdminSkillSummary,
  CreateSkillPayload,
  UpdateSkillPayload,
  SkillDomain,
} from '../../../../lib/api/admin-skills-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminFormField,
} from '../../../../components/common';

const SKILL_DOMAINS: SkillDomain[] = [
  'grammar', 'vocabulary', 'reading', 'listening',
  'speaking', 'writing', 'pronunciation', 'functional_language',
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
    setKey('');
    setTitle('');
    setDomain('grammar');
    setFormError(null);
    setFieldErrors({});
  }

  function openEdit(skill: AdminSkillSummary) {
    setFormMode({ type: 'edit', skill });
    setKey(skill.key);
    setTitle(skill.title);
    setDomain(skill.domain);
    setFormError(null);
    setFieldErrors({});
  }

  function closeForm() {
    setFormMode({ type: 'idle' });
    setFormError(null);
    setFieldErrors({});
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (formMode.type === 'create' && !key.trim()) {
      errors.key = 'Skill key is required.';
    }
    if (formMode.type === 'create' && key.trim() && !/^[a-z0-9]+(?:[._][a-z0-9]+)*$/.test(key.trim())) {
      errors.key = 'Key must be lowercase with dots or underscores (e.g. grammar.past_simple.forms).';
    }
    if (!title.trim()) {
      errors.title = 'Title is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setFormError(null);
    startTransition(async () => {
      let result: { error?: string };
      if (formMode.type === 'create') {
        result = await onCreateSkill({ key: key.trim(), title: title.trim(), domain });
      } else if (editing) {
        result = await onUpdateSkill(editing.id, { title: title.trim(), domain });
      } else {
        return;
      }
      if (result.error) {
        setFormError(result.error);
      } else {
        closeForm();
        router.refresh();
      }
    });
  }

  if (formMode.type !== 'idle') {
    return (
      <AdminCard title={formMode.type === 'create' ? 'New Skill' : `Edit: ${editing?.title}`}>
        {formError && (
          <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
            {formError}
          </div>
        )}

        <div className="aim-skill-form-fields">
          <AdminFormField
            id="skill-key"
            label="Key"
            required={formMode.type === 'create'}
            hint={formMode.type === 'create'
              ? 'Stable dot-delimited identifier. Cannot be changed after creation.'
              : 'Read-only after creation.'}
            error={fieldErrors.key}
          >
            <AdminInput
              id="skill-key"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. grammar.past_simple.forms"
              disabled={isPending || formMode.type === 'edit'}
              maxLength={255}
              hasError={!!fieldErrors.key}
              aria-required={formMode.type === 'create' ? 'true' : undefined}
            />
          </AdminFormField>

          <AdminFormField
            id="skill-title"
            label="Title"
            required
            error={fieldErrors.title}
          >
            <AdminInput
              id="skill-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Past Simple — Forms"
              disabled={isPending}
              maxLength={255}
              hasError={!!fieldErrors.title}
              aria-required="true"
            />
          </AdminFormField>

          <AdminFormField id="skill-domain" label="Domain" required>
            <AdminSelect
              id="skill-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value as SkillDomain)}
              disabled={isPending}
            >
              {SKILL_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d.replace('_', ' ')}
                </option>
              ))}
            </AdminSelect>
          </AdminFormField>
        </div>

        <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
          <strong>Backend authority:</strong> Status changes and lesson-skill linking
          are controlled by backend APIs.
        </div>

        <div className="aim-skill-form-actions">
          <AdminButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isPending}
            loading={isPending}
          >
            {formMode.type === 'create' ? 'Create Skill' : 'Save Changes'}
          </AdminButton>
          <AdminButton
            variant="secondary"
            onClick={closeForm}
            disabled={isPending}
          >
            Cancel
          </AdminButton>
        </div>

        <style>{`
          .aim-skill-form-fields {
            display: flex;
            flex-direction: column;
            gap: var(--space-16);
          }
          .aim-skill-form-actions {
            display: flex;
            gap: var(--space-12);
          }
        `}</style>
      </AdminCard>
    );
  }

  return (
    <div className="aim-skills-list-actions">
      <AdminButton variant="primary" onClick={openCreate}>
        + New Skill
      </AdminButton>
    </div>
  );
}
