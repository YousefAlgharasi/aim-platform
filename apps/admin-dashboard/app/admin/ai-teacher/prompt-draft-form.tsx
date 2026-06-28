'use client';

import { useState, useTransition } from 'react';
import { AdminCard, AdminFormField, AdminInput, AdminTextarea, AdminButton } from '../../../components/common';
import type { CreatePromptTemplateDraftPayload } from '../../../lib/api/admin-ai-teacher-api';

type Props = {
  readonly onSubmit: (payload: CreatePromptTemplateDraftPayload) => Promise<{ error?: string }>;
  readonly onDone: () => void;
};

export function PromptDraftForm({ onSubmit, onDone }: Props) {
  const [name, setName] = useState('');
  const [locale, setLocale] = useState('en');
  const [audience, setAudience] = useState('student');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!locale.trim()) errors.locale = 'Locale is required.';
    if (!audience.trim()) errors.audience = 'Audience is required.';
    if (!body.trim()) errors.body = 'Body is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setError(null);
    startTransition(async () => {
      const result = await onSubmit({
        name: name.trim(),
        locale: locale.trim(),
        audience: audience.trim(),
        body: body.trim(),
      });
      if (result.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <AdminCard title="New Prompt Template Draft" description="Drafts start in 'draft' status. Publish a draft to make it active.">
      {error && <p className="admin-error-banner" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <AdminFormField id="pdf-name" label="Name" required error={fieldErrors.name}>
          <AdminInput id="pdf-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} maxLength={255} placeholder="e.g. lesson-intro" />
        </AdminFormField>
        <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
          <div style={{ flex: 1 }}>
            <AdminFormField id="pdf-locale" label="Locale" required error={fieldErrors.locale}>
              <AdminInput id="pdf-locale" value={locale} onChange={(e) => setLocale(e.target.value)} disabled={isPending} maxLength={20} placeholder="e.g. en" />
            </AdminFormField>
          </div>
          <div style={{ flex: 1 }}>
            <AdminFormField id="pdf-audience" label="Audience" required error={fieldErrors.audience}>
              <AdminInput id="pdf-audience" value={audience} onChange={(e) => setAudience(e.target.value)} disabled={isPending} maxLength={50} placeholder="e.g. student" />
            </AdminFormField>
          </div>
        </div>
        <AdminFormField id="pdf-body" label="Prompt Body" required error={fieldErrors.body}>
          <AdminTextarea id="pdf-body" value={body} onChange={(e) => setBody(e.target.value)} disabled={isPending} rows={8} placeholder="Prompt template body…" />
        </AdminFormField>
        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
          <AdminButton type="submit" variant="primary" disabled={isPending}>
            {isPending ? 'Saving…' : 'Create Draft'}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onDone} disabled={isPending}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </AdminCard>
  );
}
