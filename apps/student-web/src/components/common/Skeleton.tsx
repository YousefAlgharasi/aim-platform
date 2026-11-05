import type React from 'react';
import { useI18n } from '../../i18n/I18nContext';

/** A shimmering placeholder block. Size it with className (h-*, w-*, rounded-*). */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-xl bg-surface-muted bg-[linear-gradient(100deg,transparent_30%,rgb(var(--c-surface-strong)/0.55)_50%,transparent_70%)] bg-[length:200%_100%] motion-safe:animate-[skeleton-shimmer_1.6s_ease-in-out_infinite] ${className}`}
    />
  );
}

/** Card-shaped placeholder that mirrors the dashboard widgets so the layout does not jump when data arrives. */
export function SkeletonCard({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`bg-surface rounded-[20px] p-5 ring-1 ring-line shadow-card flex flex-col gap-3 ${className}`}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}

/** Wrapper: one "Loading" announcement per screen; the grey blocks inside are hidden from assistive tech. */
function Shell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { t } = useI18n();
  return (
    <div role="status" aria-busy="true" aria-label={t('Loading')} className={`flex flex-col gap-5 ${className}`}>
      {children}
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-2 px-1">
      <Skeleton className="h-7 w-48 max-w-[70%]" />
      <Skeleton className="h-3 w-72 max-w-[90%]" />
    </div>
  );
}

/** Dashboard-shaped loading state: grey blocks where the widgets will be. */
export function DashboardSkeleton() {
  return (
    <Shell className="!gap-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><SkeletonCard lines={3} /><SkeletonCard lines={3} /></div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
    </Shell>
  );
}

/** Rows of items (notifications, payments, deadlines, history, tickets…). `bare` omits the page header. */
export function ListSkeleton({ rows = 5, bare = false }: { rows?: number; bare?: boolean }) {
  return (
    <Shell>
      {!bare && <Header />}
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-[20px] bg-surface p-4 ring-1 ring-line shadow-card">
            <Skeleton className="size-11 shrink-0 rounded-2xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <Skeleton className="hidden h-8 w-20 rounded-xl sm:block" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

/** Grid of cards (courses, practice topics, achievements, certificates). */
export function CardGridSkeleton({ cards = 6, bare = false }: { cards?: number; bare?: boolean }) {
  return (
    <Shell>
      {!bare && <Header />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-[20px] bg-surface p-4 ring-1 ring-line shadow-card">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

/** A hero panel followed by content cards (course / assessment / certificate / ticket / result details). */
export function DetailSkeleton() {
  return (
    <Shell>
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SkeletonCard lines={2} /><SkeletonCard lines={2} /><SkeletonCard lines={2} />
      </div>
      <SkeletonCard lines={4} />
    </Shell>
  );
}

/** Settings / profile / checkout style forms. */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Shell>
      <Header />
      <div className="flex flex-col gap-5 rounded-[20px] bg-surface p-5 ring-1 ring-line shadow-card">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ))}
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
    </Shell>
  );
}

/** Practice / placement / exam question screen: progress bar, prompt, answer options. */
export function QuestionSkeleton() {
  return (
    <Shell className="mx-auto w-full max-w-2xl">
      <Skeleton className="h-2.5 w-full rounded-full" />
      <div className="flex flex-col gap-4 rounded-3xl bg-surface p-5 ring-1 ring-line shadow-card sm:p-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-6 w-2/3" />
        <div className="mt-2 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-2xl" />)}
        </div>
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
    </Shell>
  );
}

/** AI / voice teacher conversation: alternating message bubbles and the input bar. */
export function ChatSkeleton() {
  return (
    <Shell className="mx-auto w-full max-w-3xl">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 w-3/4 rounded-2xl rounded-es-none" />
        <Skeleton className="h-12 w-1/2 self-end rounded-2xl rounded-ee-none" />
        <Skeleton className="h-24 w-4/5 rounded-2xl rounded-es-none" />
      </div>
      <Skeleton className="mt-2 h-14 w-full rounded-2xl" />
    </Shell>
  );
}
