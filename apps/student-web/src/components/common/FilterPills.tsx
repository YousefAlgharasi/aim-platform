import type { ReactNode } from 'react';

export interface FilterOption<T extends string> {
  key: T;
  label: ReactNode;
}

interface FilterPillsProps<T extends string> {
  /** Accessible name for the group, e.g. "Filter notifications". */
  label: string;
  options: ReadonlyArray<FilterOption<T>>;
  value: T;
  onChange: (key: T) => void;
  id?: string;
  className?: string;
}

/**
 * The app's one filter control: a row of outlined pills, the selected one filled with ink. Every filter
 * (courses, notifications, achievements, improve, assessments, skills) uses this so they all look and
 * behave the same. Scrolls sideways on narrow screens; the negative margin keeps focus rings from being clipped.
 */
export function FilterPills<T extends string>({ label, options, value, onChange, id, className = '' }: FilterPillsProps<T>) {
  return (
    <div id={id} className={`-m-1 flex gap-2 overflow-x-auto p-1 ${className}`} role="tablist" aria-label={label}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            className={`min-h-11 shrink-0 cursor-pointer rounded-full border-0 px-5 text-sm font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${active ? 'bg-ink text-ink-inverse ring-ink' : 'bg-transparent text-ink-soft ring-line-strong hover:bg-surface-strong hover:text-ink'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
