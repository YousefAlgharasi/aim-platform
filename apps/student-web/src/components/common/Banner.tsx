import { ReactNode } from 'react';

interface BannerProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

const VARIANT: Record<BannerProps['variant'], string> = {
  info: 'bg-brand-soft text-brand-ink border-brand-line',
  success:
    'bg-success-soft text-success-ink border-success-line',
  warning:
    'bg-warning-soft text-warning-ink border-warning-line',
  error: 'bg-danger-soft text-danger-ink border-danger-line',
};

export function Banner({ variant, children }: BannerProps) {
  return (
    <div role={variant === 'error' ? 'alert' : 'status'} className={`ix-fade-up rounded-xl border px-3.5 py-3 text-[13px] font-medium leading-relaxed ${VARIANT[variant]}`}>
      {children}
    </div>
  );
}
