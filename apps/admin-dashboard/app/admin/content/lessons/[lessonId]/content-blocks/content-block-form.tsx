'use client';
// P11-026: Admin content block create/edit form using AIM design system.
// Backend is final authority for content block data.

import { useState, useTransition } from 'react';
import type { AdminContentBlock, ContentBlockType } from '../../../../../../lib/api/admin-lesson-content-api';
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminButton,
  AdminFormField,
  AdminCard,
} from '../../../../../../components/common';

const BLOCK_TYPES: ContentBlockType[] = ['text', 'image', 'video', 'audio', 'exercise', 'vocabulary'];

type ContentBlockFormProps = {
  readonly mode: 'create' | 'edit';
  readonly initial?: AdminContentBlock;
  readonly onSubmit: (data: {
    type: ContentBlockType;
    title: string;
    content: string;
    sortOrder?: number;
  }) => Promise<{ error?: string }>;
  readonly onCancel: () => void;
};

export function ContentBlockForm({ mode, initial, onSubmit, onCancel }: ContentBlockFormProps) {
  const [type, setType] = useState<ContentBlockType>(initial?.type ?? 'text');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? '0'));
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!content.trim()) {
      errors.content = 'Content is required.';
    }
    const orderNum = parseInt(sortOrder, 10);
    if (sortOrder.trim() && isNaN(orderNum)) {
      errors.sortOrder = 'Sort order must be a number.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setError(null);
    startTransition(async () => {
      const orderNum = parseInt(sortOrder, 10);
      const result = await onSubmit({
        type,
        title: title.trim(),
        content: content.trim(),
        ...(sortOrder.trim() && !isNaN(orderNum) ? { sortOrder: orderNum } : {}),
      });
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <AdminCard title={mode === 'create' ? 'New Content Block' : 'Edit Content Block'}>
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div className="aim-block-form-fields">
        <AdminFormField id="block-type" label="Block Type" required>
          <AdminSelect
            id="block-type"
            value={type}
            onChange={(e) => setType(e.target.value as ContentBlockType)}
            disabled={isPending || mode === 'edit'}
            aria-required="true"
          >
            {BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </AdminSelect>
        </AdminFormField>

        <AdminFormField
          id="block-title"
          label="Title"
          required
          error={fieldErrors.title}
        >
          <AdminInput
            id="block-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction paragraph"
            disabled={isPending}
            maxLength={255}
            hasError={!!fieldErrors.title}
            aria-required="true"
          />
        </AdminFormField>

        <AdminFormField
          id="block-content"
          label="Content"
          required
          hint={type === 'image' || type === 'video' || type === 'audio'
            ? 'Enter the URL or reference for this media block.'
            : 'Enter the content for this block.'}
          error={fieldErrors.content}
        >
          <AdminTextarea
            id="block-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'image' ? 'https://example.com/image.png'
                : type === 'video' ? 'https://example.com/video.mp4'
                : type === 'audio' ? 'https://example.com/audio.mp3'
                : 'Block content…'
            }
            disabled={isPending}
            rows={6}
            maxLength={10000}
            hasError={!!fieldErrors.content}
            aria-required="true"
          />
        </AdminFormField>

        <AdminFormField
          id="block-sort-order"
          label="Sort Order"
          hint="Numeric position within the lesson. Lower numbers appear first."
          error={fieldErrors.sortOrder}
        >
          <AdminInput
            id="block-sort-order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="0"
            disabled={isPending}
            hasError={!!fieldErrors.sortOrder}
          />
        </AdminFormField>
      </div>

      <div className="admin-boundary-note" style={{ marginBlock: 'var(--space-16)' }}>
        <strong>Backend authority:</strong> Content validation and storage are
        controlled by backend APIs.
      </div>

      <div className="aim-block-form-actions">
        <AdminButton
          variant="primary"
          onClick={handleSubmit}
          disabled={isPending}
          loading={isPending}
        >
          {mode === 'create' ? 'Create Block' : 'Save Changes'}
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </AdminButton>
      </div>

      <style>{`
        .aim-block-form-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .aim-block-form-actions {
          display: flex;
          gap: var(--space-12);
        }
      `}</style>
    </AdminCard>
  );
}
