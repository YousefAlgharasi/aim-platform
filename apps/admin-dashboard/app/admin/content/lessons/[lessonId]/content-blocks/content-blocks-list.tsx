'use client';
// P11-026: Admin lesson content blocks list using AIM design system.
// Backend is final authority for content block data.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminContentBlock, ContentBlockType } from '../../../../../../lib/api/admin-lesson-content-api';
import {
  AdminButton,
  AdminCard,
  AdminBadge,
  AdminConfirmDialog,
} from '../../../../../../components/common';
import { AdminEmptyState } from '../../../../../../components/layout';
import { ContentBlockForm } from './content-block-form';

const BLOCK_TYPE_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'> = {
  text: 'neutral',
  image: 'info',
  video: 'primary',
  audio: 'warning',
  exercise: 'success',
  vocabulary: 'error',
};

type ContentBlocksListProps = {
  readonly blocks: AdminContentBlock[];
  readonly total: number;
  readonly lessonId: string;
  readonly onCreateBlock: (data: {
    type: ContentBlockType;
    title: string;
    content: string;
    sortOrder?: number;
  }) => Promise<{ error?: string }>;
  readonly onUpdateBlock: (
    blockId: string,
    data: { title?: string; content?: string; sortOrder?: number },
  ) => Promise<{ error?: string }>;
  readonly onDeleteBlock: (blockId: string) => Promise<{ error?: string }>;
};

export function ContentBlocksList({
  blocks,
  total,
  lessonId,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
}: ContentBlocksListProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminContentBlock | null>(null);
  const [deleting, setDeleting] = useState<AdminContentBlock | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCreate(data: {
    type: ContentBlockType;
    title: string;
    content: string;
    sortOrder?: number;
  }) {
    const result = await onCreateBlock(data);
    if (!result.error) {
      setShowCreate(false);
      refresh();
    }
    return result;
  }

  async function handleUpdate(data: {
    type: ContentBlockType;
    title: string;
    content: string;
    sortOrder?: number;
  }) {
    if (!editing) return { error: 'No block selected.' };
    const result = await onUpdateBlock(editing.id, {
      title: data.title,
      content: data.content,
      sortOrder: data.sortOrder,
    });
    if (!result.error) {
      setEditing(null);
      refresh();
    }
    return result;
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteError(null);
    const result = await onDeleteBlock(deleting.id);
    if (result.error) {
      setDeleteError(result.error);
    } else {
      setDeleting(null);
      refresh();
    }
  }

  if (showCreate) {
    return (
      <ContentBlockForm
        mode="create"
        onSubmit={handleCreate}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  if (editing) {
    return (
      <ContentBlockForm
        mode="edit"
        initial={editing}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="aim-content-blocks-container">
      <div className="aim-content-blocks-toolbar">
        <AdminButton variant="primary" onClick={() => setShowCreate(true)}>
          + New Block
        </AdminButton>
        <span className="aim-content-blocks-count">
          {total} block{total !== 1 ? 's' : ''}
        </span>
      </div>

      {sorted.length === 0 ? (
        <AdminEmptyState
          title="No content blocks"
          description="This lesson has no content blocks yet. Add the first one."
        />
      ) : (
        <div className="aim-content-blocks-grid">
          {sorted.map((block) => (
            <AdminCard key={block.id} title="">
              <div className="aim-block-card-header">
                <div className="aim-block-card-title-row">
                  <AdminBadge variant={BLOCK_TYPE_VARIANT[block.type] ?? 'neutral'}>
                    {block.type}
                  </AdminBadge>
                  <strong className="aim-block-card-title">{block.title}</strong>
                  <span className="aim-block-card-order">#{block.sortOrder}</span>
                </div>
                <div className="aim-block-card-actions">
                  <AdminButton variant="secondary" onClick={() => setEditing(block)}>
                    Edit
                  </AdminButton>
                  <AdminButton variant="secondary" onClick={() => setDeleting(block)}>
                    Delete
                  </AdminButton>
                </div>
              </div>
              <div className="aim-block-card-content">
                <pre className="aim-block-card-preview">{block.content}</pre>
              </div>
              <div className="aim-block-card-meta">
                Updated: {new Date(block.updatedAt).toLocaleDateString()}
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {deleting && (
        <AdminConfirmDialog
          title="Delete Content Block"
          message={`Are you sure you want to delete "${deleting.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => { setDeleting(null); setDeleteError(null); }}
          error={deleteError ?? undefined}
        />
      )}

      <style>{`
        .aim-content-blocks-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .aim-content-blocks-toolbar {
          display: flex;
          align-items: center;
          gap: var(--space-12);
        }
        .aim-content-blocks-count {
          color: var(--text-muted);
          font-size: 13px;
        }
        .aim-content-blocks-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
        }
        .aim-block-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-12);
          margin-block-end: var(--space-12);
        }
        .aim-block-card-title-row {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          flex-wrap: wrap;
        }
        .aim-block-card-title {
          font-size: 15px;
        }
        .aim-block-card-order {
          color: var(--text-muted);
          font-size: 12px;
        }
        .aim-block-card-actions {
          display: flex;
          gap: var(--space-8);
          flex-shrink: 0;
        }
        .aim-block-card-content {
          margin-block-end: var(--space-8);
        }
        .aim-block-card-preview {
          margin: 0;
          padding: var(--space-12);
          background: var(--surface-secondary);
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 120px;
          overflow: auto;
        }
        .aim-block-card-meta {
          color: var(--text-muted);
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
