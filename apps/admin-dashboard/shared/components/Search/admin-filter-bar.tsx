// P11-009: AIM design system filter bar
import type { ReactNode } from 'react';
import { AdminInput, AdminSelect } from '../Input/admin-inputs';

type SelectFilterOption = { label: string; value: string };

type SelectFilterConfig = {
  key: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: SelectFilterOption[];
};

type Props = {
  readonly children?: ReactNode;
  readonly label?: string;
  readonly searchValue?: string;
  readonly onSearchChange?: (val: string) => void;
  readonly searchPlaceholder?: string;
  readonly selectFilters?: SelectFilterConfig[];
  readonly onClearAll?: () => void;
};

export function AdminFilterBar({
  children,
  label = 'Filters',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  selectFilters = [],
  onClearAll,
}: Props) {
  const hasDeclarativeSearch = searchValue !== undefined && onSearchChange !== undefined;

  return (
    <div
      className="flex items-center flex-wrap gap-2 px-4 py-3 bg-[var(--surface-sunken)] border border-[var(--border)] rounded-xl mb-4"
      role="search"
      aria-label={label}
    >
      {children}

      {hasDeclarativeSearch && (
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <AdminInput
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 pr-8 text-sm"
          />
          {searchValue && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {selectFilters.map((filter) => (
        <AdminSelect
          key={filter.key}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="min-w-[130px]"
        >
          {filter.placeholder && <option value="">{filter.placeholder}</option>}
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </AdminSelect>
      ))}

      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-[var(--text-link)] hover:underline px-2 cursor-pointer"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
