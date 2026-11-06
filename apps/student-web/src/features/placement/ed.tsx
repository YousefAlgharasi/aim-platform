import type { ReactNode } from 'react';

/**
 * Editorial building blocks for the pre-dashboard flow (/start and the placement test).
 * Same language as the landing and sign-in pages: display headings, hairline rules, flat rows,
 * pill buttons. Kept apart from ./ui.tsx on purpose: that file also styles the assessments screens.
 */

/** A single reading column; PlacementLayout supplies the page padding. */
export const ED_SHELL = 'mx-auto w-full max-w-2xl flex flex-col gap-8';

export const ED_BTN = '!rounded-full !tracking-normal';

export const ED_H1 = 'lp-display m-0 text-[2.25rem] font-semibold text-ink sm:text-[2.75rem] rtl:text-4xl';
export const ED_H2 = 'm-0 text-2xl font-semibold leading-snug tracking-tight text-ink rtl:tracking-normal';
export const ED_BODY = 'm-0 text-base leading-relaxed text-ink-muted';

/** A flat surface for the few things that need one (an alert, the audio player, a feedback note). */
export const ED_PANEL = 'rounded-2xl bg-surface p-5 ring-1 ring-line';

export function EdHeader({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <header>
      <h1 className={ED_H1}>{title}</h1>
      {subtitle && <p className={`${ED_BODY} mt-3 max-w-lg`}>{subtitle}</p>}
    </header>
  );
}

/** Ruled list row: hairline above every row but the first. */
export const edRow = (i: number) => (i === 0 ? '' : 'border-t border-line');

/** One segment per step; finished segments are solid, the current one is half-filled. */
export function EdProgress({ value, total, label }: { value: number; total: number; label?: string }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
          <span className={`block h-full rounded-full bg-brand transition-[width] duration-500 ease-out ${i < value ? 'w-full' : i === value ? 'w-1/2' : 'w-0'}`} />
        </span>
      ))}
    </div>
  );
}

export function EdTimer({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return (
    <span aria-live="off" className={`lp-num inline-flex items-center gap-1.5 text-sm font-semibold ${warning ? 'text-danger-ink' : 'text-ink'}`}>
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
      {children}
    </span>
  );
}

/** Answer row: radio dot, optional letter, hairline between rows. Selected = ink text and a brand dot. */
export function EdChoiceRow({
  selected,
  name,
  value,
  onChange,
  disabled,
  keyLabel,
  children,
}: {
  selected: boolean;
  name: string;
  value: string;
  onChange: () => void;
  disabled?: boolean;
  keyLabel?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={`relative flex cursor-pointer items-center gap-4 px-1 py-4 transition-colors has-[:focus-visible]:rounded-lg has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 ${selected ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}
    >
      <input type="radio" name={name} value={value} checked={selected} onChange={onChange} disabled={disabled} className="sr-only" />
      <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-full ring-2 transition-colors ${selected ? 'ring-brand' : 'ring-line-strong'}`}>
        {selected && <span className="size-3 rounded-full bg-brand" />}
      </span>
      {keyLabel && <span aria-hidden className={`lp-num w-5 shrink-0 text-sm font-semibold ${selected ? 'text-brand-ink' : 'text-ink-muted'}`}>{keyLabel}</span>}
      <span className={`min-w-0 flex-1 text-lg leading-snug ${selected ? 'font-semibold' : 'font-medium'}`}>{children}</span>
    </label>
  );
}

/** A figure with a plain label under it (answered / skipped on the review screen). */
export function EdStat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="lp-num m-0 text-5xl font-semibold tracking-tight text-ink rtl:tracking-normal">{value}</p>
      <p className="m-0 mt-1 text-sm text-ink-muted">{label}</p>
    </div>
  );
}
