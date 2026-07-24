'use client';

import type { ReactNode } from 'react';
import { useBackendSearch } from '../../lib/hooks/use-backend-search';
import {
  AdminButton,
  AdminInput,
  AdminTable,
  type AdminTableColumn,
} from '../common';
import { AdminErrorBanner } from '../layout';

export type FilterOption<F extends string = string> = {
  key: F;
  label: string;
};

type Props<T, F extends string = string> = {
  readonly title: string;
  readonly description: string;
  readonly searchPlaceholder: string;
  readonly endpointPrefix: string;
  readonly resourceLabel: string;
  readonly filters: readonly FilterOption<F>[];
  readonly columns: readonly AdminTableColumn<T>[];
  readonly getRowKey: (row: T) => string;
  readonly boundaryRules?: readonly string[];
};

export function BillingSearchTable<T, F extends string = string>({
  title,
  description,
  searchPlaceholder,
  endpointPrefix,
  resourceLabel,
  filters,
  columns,
  getRowKey,
  boundaryRules,
}: Props<T, F>) {
  const {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    filtered,
    loading,
    error,
    searched,
    fetchBySearch,
  } = useBackendSearch<T>(endpointPrefix, resourceLabel);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-500)]">
          Internal admin surface
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
      </div>

      <div className="flex flex-col gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchBySearch(searchQuery);
          }}
          className="flex gap-2 max-w-md"
        >
          <AdminInput
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <AdminButton type="submit" loading={loading}>
            Search
          </AdminButton>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filter === f.key
                  ? 'bg-[var(--color-primary-500)] text-white'
                  : 'bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:bg-[var(--state-hover)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <AdminErrorBanner message={error} />}

      {loading ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
          Loading {resourceLabel.toLowerCase()}...
        </div>
      ) : !searched ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
          {searchPlaceholder.replace('...', '')} above to search for {resourceLabel.toLowerCase()}.
        </div>
      ) : filtered.length === 0 && !error ? (
        <div className="p-8 text-center text-sm text-[var(--text-muted)] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
          No {resourceLabel.toLowerCase()} found.
        </div>
      ) : (
        <AdminTable columns={columns} rows={filtered} getRowKey={getRowKey} />
      )}

      {boundaryRules && boundaryRules.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex flex-col gap-1.5">
          <h2 className="font-semibold text-sm text-[var(--text-primary)]">
            Admin {title.toLowerCase()} rules
          </h2>
          <ul className="list-disc pl-4 space-y-1">
            {boundaryRules.map((rule, idx) => (
              <li key={idx}>{rule}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
