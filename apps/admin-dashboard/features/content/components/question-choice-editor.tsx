'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminQuestionChoice, QuestionType } from '../api/admin-question-bank-api';
import { AdminCard, AdminBadge, AdminButton, AdminInput } from '../../../shared/components/Misc';
import { AdminErrorBanner } from '../../../shared/layouts/DashboardLayout';

type NewChoiceInput = {
  readonly text: string;
  readonly isCorrect: boolean;
  readonly explanation?: string | null;
};

type EditChoiceInput = {
  readonly text?: string;
  readonly isCorrect?: boolean;
  readonly explanation?: string | null;
};

type Props = {
  readonly questionType: QuestionType;
  readonly questionId: string;
  readonly questionStatus: string;
  readonly choices: AdminQuestionChoice[];
  readonly onAddChoice: (input: NewChoiceInput) => Promise<{ error?: string }>;
  readonly onUpdateChoice: (choiceId: string, input: EditChoiceInput) => Promise<{ error?: string }>;
  readonly onRemoveChoice: (choiceId: string) => Promise<{ error?: string }>;
  readonly onReorderChoices: (orderedChoiceIds: string[]) => Promise<{ error?: string }>;
};

const CHOICE_GUIDANCE: Record<QuestionType, { label: string; description: string }> = {
  multiple_choice: {
    label: 'Multiple Choice',
    description: 'Exactly one choice must be marked correct.',
  },
  multiple_select: {
    label: 'Multiple Select',
    description: 'One or more choices must be marked correct.',
  },
  true_false: {
    label: 'True / False',
    description: 'Exactly two choices, one marked correct.',
  },
  fill_in_the_blank: {
    label: 'Fill in the Blank',
    description: 'This question type does not use answer choices — accepted answers are managed separately.',
  },
  short_answer: {
    label: 'Short Answer',
    description: 'This question type does not use answer choices — the model answer is managed separately.',
  },
  ordering: {
    label: 'Ordering',
    description: 'Choices define the items to order. Correct sequence is managed separately.',
  },
  matching: {
    label: 'Matching',
    description: 'Choices define the items to match. Correct pairings are managed separately.',
  },
};

const NON_CHOICE_TYPES: QuestionType[] = ['fill_in_the_blank', 'short_answer'];

export function QuestionChoiceEditor({
  questionType,
  questionId: _questionId,
  questionStatus,
  choices,
  onAddChoice,
  onUpdateChoice,
  onRemoveChoice,
  onReorderChoices,
}: Props) {
  const router = useRouter();
  const guidance = CHOICE_GUIDANCE[questionType];
  const isEditable = questionStatus === 'draft';
  const usesChoices = !NON_CHOICE_TYPES.includes(questionType);

  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [newText, setNewText] = useState('');
  const [newIsCorrect, setNewIsCorrect] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editIsCorrect, setEditIsCorrect] = useState(false);

  const sorted = [...choices].sort((a, b) => a.order - b.order);

  function refresh() {
    startTransition(() => router.refresh());
  }

  function handleAdd() {
    if (!newText.trim()) return;
    setActionError(null);
    startTransition(async () => {
      const result = await onAddChoice({ text: newText.trim(), isCorrect: newIsCorrect });
      if (result.error) {
        setActionError(result.error);
      } else {
        setNewText('');
        setNewIsCorrect(false);
        refresh();
      }
    });
  }

  function beginEdit(choice: AdminQuestionChoice) {
    setEditingId(choice.id);
    setEditText(choice.text);
    setEditIsCorrect(choice.isCorrect);
    setActionError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleSaveEdit(choiceId: string) {
    if (!editText.trim()) return;
    setActionError(null);
    startTransition(async () => {
      const result = await onUpdateChoice(choiceId, { text: editText.trim(), isCorrect: editIsCorrect });
      if (result.error) {
        setActionError(result.error);
      } else {
        setEditingId(null);
        refresh();
      }
    });
  }

  function handleRemove(choiceId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await onRemoveChoice(choiceId);
      if (result.error) {
        setActionError(result.error);
      } else {
        refresh();
      }
    });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;

    const reordered = [...sorted];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);

    setActionError(null);
    startTransition(async () => {
      const result = await onReorderChoices(reordered.map((c) => c.id));
      if (result.error) {
        setActionError(result.error);
      } else {
        refresh();
      }
    });
  }

  return (
    <AdminCard title="Answer Choices">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBlockEnd: 'var(--space-12)' }}>
        <AdminBadge variant="neutral">{guidance.label}</AdminBadge>
        {!isEditable && <AdminBadge variant="warning">Read-only — question is not in draft</AdminBadge>}
      </div>

      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 var(--space-12)' }}>
        {guidance.description}
      </p>

      {!usesChoices ? null : (
        <>
          {actionError && <AdminErrorBanner message={actionError} />}

          {sorted.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No choices yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {sorted.map((choice, index) => (
                <li
                  key={choice.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-8)',
                    padding: 'var(--space-8) var(--space-12)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-sunken)',
                  }}
                >
                  {editingId === choice.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                      <AdminInput
                        id={`choice-edit-${choice.id}`}
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        disabled={isPending}
                        aria-label="Choice text"
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={editIsCorrect}
                          onChange={(e) => setEditIsCorrect(e.target.checked)}
                          disabled={isPending}
                        />
                        Correct answer
                      </label>
                      <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                        <AdminButton variant="primary" size="sm" onClick={() => handleSaveEdit(choice.id)} disabled={isPending} loading={isPending}>
                          Save
                        </AdminButton>
                        <AdminButton variant="secondary" size="sm" onClick={cancelEdit} disabled={isPending}>
                          Cancel
                        </AdminButton>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-8)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                        <span style={{ fontSize: '14px' }}>{choice.text}</span>
                        {choice.isCorrect && <AdminBadge variant="success">Correct</AdminBadge>}
                      </div>

                      {isEditable && (
                        <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
                          <AdminButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleMove(index, -1)}
                            disabled={isPending || index === 0}
                            aria-label="Move choice up"
                          >
                            ↑
                          </AdminButton>
                          <AdminButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleMove(index, 1)}
                            disabled={isPending || index === sorted.length - 1}
                            aria-label="Move choice down"
                          >
                            ↓
                          </AdminButton>
                          <AdminButton variant="secondary" size="sm" onClick={() => beginEdit(choice)} disabled={isPending}>
                            Edit
                          </AdminButton>
                          <AdminButton
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemove(choice.id)}
                            disabled={isPending}
                            aria-label={`Remove choice ${choice.text}`}
                          >
                            Remove
                          </AdminButton>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isEditable && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-8)', marginBlockStart: 'var(--space-12)' }}>
              <div style={{ flex: 1 }}>
                <AdminInput
                  id="new-choice-text"
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="New choice text…"
                  disabled={isPending}
                  aria-label="New choice text"
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', fontSize: '13px', paddingBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={newIsCorrect}
                  onChange={(e) => setNewIsCorrect(e.target.checked)}
                  disabled={isPending}
                />
                Correct
              </label>
              <AdminButton variant="primary" onClick={handleAdd} disabled={isPending || !newText.trim()} loading={isPending}>
                Add Choice
              </AdminButton>
            </div>
          )}
        </>
      )}
    </AdminCard>
  );
}
