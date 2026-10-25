import { ReactNode } from 'react';

interface BannerProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

const VARIANT: Record<BannerProps['variant'], string> = {
  info: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
  warning:
    'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
  error: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60',
};

export function Banner({ variant, children }: BannerProps) {
  return (
    <div role="status" className={`rounded-xl border px-3.5 py-3 text-[13px] font-medium leading-relaxed ${VARIANT[variant]}`}>
      {children}
    </div>
  );
}
