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
    <div className={`bg-surface rounded-[20px] p-5 ring-1 ring-line flex flex-col gap-3 ${className}`}>
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

/** Dashboard-shaped loading state: mirrors the real layout (roadmap, 2×2 stat tiles, deadlines | word of the day, daily goal, widgets). */
export function DashboardSkeleton() {
  return (
    <Shell className="!gap-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="contents lg:col-span-7 lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          {/* Roadmap: chapter row, then the stops zig-zagging down the road. */}
          <div className="rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
              <div className="flex min-w-0 flex-1 flex-col gap-2"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-3 w-24" /></div>
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="mt-4 flex flex-col">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex h-[116px] items-center gap-4 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                  <Skeleton className="size-[68px] shrink-0 !rounded-full" />
                  <div className="flex w-32 flex-col gap-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-full" /></div>
                </div>
              ))}
            </div>
          </div>
          {/* Stat tiles: two by two, like the page. */}
          <div className="grid grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-2xl bg-surface p-5 ring-1 ring-line">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
          {/* Top learners: ends the column */}
          <SkeletonCard lines={5} className="lg:flex-1" />
        </div>
        <div className="contents lg:col-span-5 lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
          {/* Word of the day: first on phones, like the page */}
          <div className="order-first flex flex-col gap-4 rounded-2xl bg-surface p-6 ring-1 ring-line sm:p-8 lg:order-none">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="mt-4 h-14 w-48 max-w-full !rounded-full" />
          </div>
          {/* Daily goal */}
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface p-6 ring-1 ring-line">
            <Skeleton className="size-[136px] !rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
          </div>
          <SkeletonCard lines={3} />
          {/* Deadlines: ends the column, level with Top learners */}
          <SkeletonCard lines={2} className="lg:flex-1" />
        </div>
      </div>
    </Shell>
  );
}

/** Whole-app placeholder shown while the session is being restored (replaces a bare spinner). */
export function AppShellSkeleton() {
  const { t } = useI18n();
  return (
    <div role="status" aria-busy="true" aria-label={t('Loading')} className="flex min-h-screen bg-page">
      <div aria-hidden="true" className="hidden w-64 shrink-0 flex-col gap-3 border-e border-line p-5 lg:flex">
        <Skeleton className="h-9 w-32" />
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
      <div className="flex-1 p-4 sm:p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-5">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><SkeletonCard /><SkeletonCard /></div>
        </div>
      </div>
    </div>
  );
}

/** Compact in-card placeholder for a section that loads on its own (no page header, no extra margins). */
export function InlineSkeleton({ rows = 3 }: { rows?: number }) {
  const { t } = useI18n();
  return (
    <div role="status" aria-busy="true" aria-label={t('Loading')} className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === rows - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}

/** Weak-spot cards: summary strip followed by cards with a bar and two actions. */
export function ImproveSkeleton() {
  return (
    <Shell>
      <Header />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-[20px] bg-surface p-5 ring-1 ring-line">
            <div className="flex items-center justify-between"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-6 w-20 rounded-full" /></div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-2"><Skeleton className="h-10 w-28 rounded-xl" /><Skeleton className="h-10 w-28 rounded-xl" /></div>
          </div>
        ))}
      </div>
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
          <div key={i} className="flex items-center gap-4 rounded-[20px] bg-surface p-4 ring-1 ring-line">
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
          <div key={i} className="flex flex-col gap-3 rounded-[20px] bg-surface p-4 ring-1 ring-line">
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
      <Skeleton className="h-44 w-full rounded-2xl" />
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
      <div className="flex flex-col gap-5 rounded-[20px] bg-surface p-5 ring-1 ring-line">
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
/** `narrow` is for the placement test's own reading column; everywhere else it fills the page column. */
export function QuestionSkeleton({ narrow = false }: { narrow?: boolean }) {
  return (
    <Shell className={narrow ? 'mx-auto w-full max-w-2xl' : 'w-full'}>
      <Skeleton className="h-2.5 w-full rounded-full" />
      <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6">
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
    <Shell className="w-full">
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

// ── Pre-dashboard flow (/start and the placement test) ──────────────────────
// These mirror the real full-screen pages (no sidebar), so nothing jumps when the content arrives.

/** /start: step list on the left, the question and its ruled options on the right. */
export function StartCardSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="hidden flex-col gap-2 lg:flex"><Skeleton className="h-5 w-40" /><Skeleton className="h-3 w-32" /></div>
        <div className="flex flex-col gap-3 lg:hidden"><Skeleton className="h-4 w-32" /><Skeleton className="h-0.5 w-full" /></div>
        <div className="mt-8 hidden flex-col gap-5 border-y border-line py-5 lg:flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4"><Skeleton className="size-8 shrink-0 rounded-full" /><Skeleton className="h-4 w-28" /></div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-8 lg:col-span-7 lg:col-start-6">
        <div className="flex flex-col gap-3"><Skeleton className="h-10 w-4/5" /><Skeleton className="h-4 w-3/5" /></div>
        <div className="flex flex-col divide-y divide-line border-y border-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 py-4"><Skeleton className="size-6 shrink-0 rounded-full" /><div className="flex flex-1 flex-col gap-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-3 w-3/4" /></div></div>
          ))}
        </div>
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  );
}

function FlowHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <Skeleton className="h-6 w-14" />
        <div className="flex gap-1.5"><Skeleton className="size-11 rounded-xl" /><Skeleton className="h-11 w-14 rounded-xl" /></div>
      </div>
    </div>
  );
}

/** Full-screen loader for /start (and while the app checks whether setup is finished). */
export function FlowPageSkeleton() {
  const { t } = useI18n();
  return (
    <div role="status" aria-busy="true" aria-label={t('Loading')} className="flex min-h-screen flex-col bg-page">
      <FlowHeaderSkeleton />
      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:py-20"><StartCardSkeleton /></div>
    </div>
  );
}

/** The placement intro: title, ruled facts, numbered sections, start button. */
export function PlacementIntroSkeleton() {
  const { t } = useI18n();
  return (
    <div role="status" aria-busy="true" aria-label={t('Loading')} className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div aria-hidden="true" className="flex flex-col gap-3"><Skeleton className="h-11 w-3/4" /><Skeleton className="h-4 w-4/5" /></div>
      <div aria-hidden="true" className="flex flex-col divide-y divide-line border-y border-line">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 py-4"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-3 w-3/5" /></div>
        ))}
      </div>
      <div aria-hidden="true" className="flex flex-col divide-y divide-line">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5"><Skeleton className="h-5 w-5" /><Skeleton className="h-5 flex-1" /><Skeleton className="h-3 w-16" /></div>
        ))}
      </div>
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}

/** Full-screen loader for the placement area while the guard checks the account. */
export function PlacementPageSkeleton() {
  return (
    <div className="min-h-screen bg-page">
      <FlowHeaderSkeleton />
      <div className="px-5 py-10 sm:px-8 sm:py-14"><PlacementIntroSkeleton /></div>
    </div>
  );
}
