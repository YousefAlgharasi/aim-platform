// P11-009: AIM design system unified compact filter bar
import type { ReactNode } from 'react';
import { AdminInput, AdminSelect } from '../Input/admin-inputs';

export type SelectFilterOption = { label: string; value: string };

export type SelectFilterConfig = {
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
  readonly className?: string;
};

export function AdminFilterBar({
  children,
  label = 'Filters',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  selectFilters = [],
  onClearAll,
  className = '',
}: Props) {
  const hasDeclarativeSearch = searchValue !== undefined && onSearchChange !== undefined;

  // Calculate active filter count for badge
  const activeCount =
    (searchValue?.trim() ? 1 : 0) +
    selectFilters.filter((f) => Boolean(f.value)).length;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2.5 p-2 sm:p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xs mb-4 transition-colors ${className}`}
      role="search"
      aria-label={label}
    >
      {/* Search Input */}
      {hasDeclarativeSearch && (
        <div className="relative w-full sm:w-64 md:w-72 sm:shrink-0">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <AdminInput
            size="sm"
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 pr-8 text-xs sm:text-sm bg-[var(--surface-sunken)] hover:bg-[var(--surface)] focus:bg-[var(--surface)]"
          />
          {searchValue && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--state-hover)] cursor-pointer transition-colors"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Select Filters — strictly inline on sm+, with active filter styling */}
      {selectFilters.map((filter) => {
        const isActive = Boolean(filter.value);
        return (
          <div
            key={filter.key}
            className="w-full sm:w-auto sm:min-w-[130px] sm:max-w-[190px] shrink-0"
          >
            <AdminSelect
              size="sm"
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className={`w-full text-xs sm:text-sm transition-all ${
                isActive
                  ? 'border-[var(--color-primary-500)] bg-[var(--primary-soft)]/20 font-semibold text-[var(--color-primary-600)]'
                  : 'bg-[var(--surface-sunken)] hover:bg-[var(--surface)]'
              }`}
            >
              {filter.placeholder && <option value="">{filter.placeholder}</option>}
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </AdminSelect>
          </div>
        );
      })}

      {/* Custom Children (e.g. custom inputs, buttons or selects) */}
      {children && (
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
          {children}
        </div>
      )}

      {/* Clear All Button */}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--color-error-600)] hover:bg-[var(--error-soft)] transition-colors cursor-pointer sm:ml-auto shrink-0 self-start sm:self-center"
          title="Clear all filters"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
          <span>Clear all</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[var(--primary-soft)] text-[var(--primary-soft-fg)] text-[10px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
