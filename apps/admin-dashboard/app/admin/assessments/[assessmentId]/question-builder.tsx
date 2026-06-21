'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
type SearchResultQuestion = {
  readonly id: string;
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
  readonly tags: string[];
  readonly status: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};
import {
  AdminButton,
  AdminCard,
  AdminBadge,
  AdminInput,
  AdminSelect,
} from '../../../../components/common';

type AttachedQuestion = {
  readonly id: string;
  readonly stem: string;
  readonly type: string;
  readonly difficulty: string;
};

type Props = {
  readonly assessmentId: string;
  readonly questionIds: readonly string[];
  readonly attachedQuestions: readonly AttachedQuestion[];
  readonly disabled?: boolean;
  readonly onSearchQuestions: (query: {
    page: number;
    search?: string;
    type?: string;
    difficulty?: string;
  }) => Promise<{
    questions: SearchResultQuestion[];
    total: number;
    page: number;
    limit: number;
    error?: string;
  }>;
  readonly onUpdateQuestions: (questionIds: string[]) => Promise<{ error?: string }>;
};

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: 'MCQ',
  multiple_select: 'Multi-select',
  true_false: 'T/F',
  fill_in_the_blank: 'Fill-in',
  short_answer: 'Short',
  ordering: 'Order',
  matching: 'Match',
};

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function AssessmentQuestionBuilder({
  assessmentId,
  questionIds,
  attachedQuestions,
  disabled,
  onSearchQuestions,
  onUpdateQuestions,
}: Props) {
  const router = useRouter();
  const [currentIds, setCurrentIds] = useState<string[]>([...questionIds]);
  const [currentQuestions, setCurrentQuestions] = useState<AttachedQuestion[]>([...attachedQuestions]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultQuestion[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  function handleSearch(page = 1) {
    startTransition(async () => {
      setError(null);
      const result = await onSearchQuestions({
        page,
        search: searchTerm || undefined,
        type: filterType || undefined,
        difficulty: filterDifficulty || undefined,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSearchResults(result.questions);
        setSearchTotal(result.total);
        setSearchPage(result.page);
      }
    });
  }

  function handleAdd(q: SearchResultQuestion) {
    if (currentIds.includes(q.id)) return;
    setCurrentIds((prev) => [...prev, q.id]);
    setCurrentQuestions((prev) => [
      ...prev,
      { id: q.id, stem: q.stem, type: q.type, difficulty: q.difficulty },
    ]);
    setHasChanges(true);
  }

  function handleRemove(id: string) {
    setCurrentIds((prev) => prev.filter((qid) => qid !== id));
    setCurrentQuestions((prev) => prev.filter((q) => q.id !== id));
    setHasChanges(true);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const ids = [...currentIds];
    const qs = [...currentQuestions];
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    [qs[index - 1], qs[index]] = [qs[index], qs[index - 1]];
    setCurrentIds(ids);
    setCurrentQuestions(qs);
    setHasChanges(true);
  }

  function handleMoveDown(index: number) {
    if (index >= currentIds.length - 1) return;
    const ids = [...currentIds];
    const qs = [...currentQuestions];
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    [qs[index], qs[index + 1]] = [qs[index + 1], qs[index]];
    setCurrentIds(ids);
    setCurrentQuestions(qs);
    setHasChanges(true);
  }

  function handleSave() {
    startSaveTransition(async () => {
      setError(null);
      const result = await onUpdateQuestions(currentIds);
      if (result.error) {
        setError(result.error);
      } else {
        setHasChanges(false);
        router.refresh();
      }
    });
  }

  function handleReset() {
    setCurrentIds([...questionIds]);
    setCurrentQuestions([...attachedQuestions]);
    setHasChanges(false);
    setError(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <AdminCard title={`Questions (${currentIds.length})`}>
        {error && (
          <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
            {error}
          </div>
        )}

        {currentQuestions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            No questions attached. Use the search below to add questions.
          </p>
        ) : (
          <ol className="qb-question-list">
            {currentQuestions.map((q, i) => (
              <li key={q.id} className="qb-question-item">
                <span className="qb-question-number">{i + 1}</span>
                <span className="qb-question-stem">{truncate(q.stem, 80)}</span>
                <AdminBadge variant="info">{TYPE_LABELS[q.type] ?? q.type}</AdminBadge>
                <AdminBadge variant="default">{q.difficulty}</AdminBadge>
                <span className="qb-question-actions">
                  <button
                    type="button"
                    className="qb-icon-btn"
                    onClick={() => handleMoveUp(i)}
                    disabled={i === 0 || disabled || isSaving}
                    aria-label={`Move question ${i + 1} up`}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="qb-icon-btn"
                    onClick={() => handleMoveDown(i)}
                    disabled={i === currentQuestions.length - 1 || disabled || isSaving}
                    aria-label={`Move question ${i + 1} down`}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="qb-icon-btn qb-icon-btn--danger"
                    onClick={() => handleRemove(q.id)}
                    disabled={disabled || isSaving}
                    aria-label={`Remove question ${i + 1}`}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-12)', marginBlockStart: 'var(--space-16)' }}>
          {hasChanges && (
            <>
              <AdminButton variant="primary" onClick={handleSave} disabled={isSaving} loading={isSaving}>
                Save Order
              </AdminButton>
              <AdminButton variant="secondary" onClick={handleReset} disabled={isSaving}>
                Reset
              </AdminButton>
            </>
          )}
          {!disabled && (
            <AdminButton
              variant={showSearch ? 'secondary' : 'primary'}
              onClick={() => {
                setShowSearch(!showSearch);
                if (!showSearch) handleSearch(1);
              }}
              disabled={isSaving}
            >
              {showSearch ? 'Hide Search' : '+ Add Questions'}
            </AdminButton>
          )}
        </div>
      </AdminCard>

      {showSearch && (
        <AdminCard title="Search Question Bank">
          <div style={{ display: 'flex', gap: 'var(--space-8)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-12)' }}>
            <AdminInput
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by stem..."
              disabled={isPending}
              style={{ flex: '1 1 200px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(1); }}
            />
            <AdminSelect
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              disabled={isPending}
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              <option value="multiple_choice">MCQ</option>
              <option value="multiple_select">Multi-select</option>
              <option value="true_false">True/False</option>
              <option value="fill_in_the_blank">Fill-in</option>
              <option value="short_answer">Short Answer</option>
              <option value="ordering">Ordering</option>
              <option value="matching">Matching</option>
            </AdminSelect>
            <AdminSelect
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              disabled={isPending}
              aria-label="Filter by difficulty"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="elementary">Elementary</option>
              <option value="intermediate">Intermediate</option>
              <option value="upper_intermediate">Upper Intermediate</option>
              <option value="advanced">Advanced</option>
            </AdminSelect>
            <AdminButton variant="primary" onClick={() => handleSearch(1)} disabled={isPending} loading={isPending}>
              Search
            </AdminButton>
          </div>

          {searchResults.length === 0 && !isPending ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              No questions found. Try adjusting your filters.
            </p>
          ) : (
            <ul className="qb-search-results">
              {searchResults.map((q) => {
                const alreadyAdded = currentIds.includes(q.id);
                return (
                  <li key={q.id} className="qb-search-item">
                    <span className="qb-question-stem">{truncate(q.stem, 70)}</span>
                    <AdminBadge variant="info">{TYPE_LABELS[q.type] ?? q.type}</AdminBadge>
                    <AdminBadge variant="default">{q.difficulty}</AdminBadge>
                    <AdminButton
                      variant={alreadyAdded ? 'secondary' : 'primary'}
                      onClick={() => handleAdd(q)}
                      disabled={alreadyAdded || isPending}
                    >
                      {alreadyAdded ? 'Added' : 'Add'}
                    </AdminButton>
                  </li>
                );
              })}
            </ul>
          )}

          {searchTotal > 20 && (
            <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'center', marginBlockStart: 'var(--space-12)' }}>
              <AdminButton
                variant="secondary"
                onClick={() => handleSearch(searchPage - 1)}
                disabled={searchPage <= 1 || isPending}
              >
                Previous
              </AdminButton>
              <span style={{ alignSelf: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Page {searchPage} of {Math.ceil(searchTotal / 20)}
              </span>
              <AdminButton
                variant="secondary"
                onClick={() => handleSearch(searchPage + 1)}
                disabled={searchPage >= Math.ceil(searchTotal / 20) || isPending}
              >
                Next
              </AdminButton>
            </div>
          )}
        </AdminCard>
      )}

      <style>{`
        .qb-question-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .qb-question-item {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-8) var(--space-12);
          background: var(--surface-secondary, #f9fafb);
          border-radius: var(--radius-md, 6px);
          font-size: 14px;
        }
        .qb-question-number {
          font-weight: var(--weight-semibold);
          color: var(--text-secondary);
          min-width: 24px;
          text-align: center;
        }
        .qb-question-stem {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .qb-question-actions {
          display: flex;
          gap: var(--space-4);
        }
        .qb-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: 1px solid var(--border-primary, #d1d5db);
          border-radius: var(--radius-sm, 4px);
          background: var(--surface-primary, #fff);
          cursor: pointer;
          font-size: 14px;
          color: var(--text-primary);
        }
        .qb-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .qb-icon-btn--danger {
          color: var(--color-danger-600, #dc2626);
          border-color: var(--color-danger-200, #fecaca);
        }
        .qb-search-results {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .qb-search-item {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          padding: var(--space-8) var(--space-12);
          border-bottom: 1px solid var(--border-secondary, #e5e7eb);
          font-size: 14px;
        }
        .qb-search-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
