import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

// Visual language from design-prototype/src/components/Button.tsx
// (PrimaryButton / SecondaryButton / TextButton): 14px radius, indigo-600 primary.
const VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-brand hover:bg-brand-hover active:bg-brand-active text-on-brand shadow-md shadow-brand/20 active:scale-[0.99] disabled:bg-disabled disabled:text-ink-disabled disabled:shadow-none',
  secondary:
    'bg-control text-ink hover:bg-surface-strong active:scale-[0.99] disabled:bg-disabled disabled:text-ink-disabled',
  ghost:
    'bg-transparent text-brand-ink hover:bg-brand-soft disabled:text-ink-disabled',
};

const SIZE: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-xl',
  md: 'h-[46px] px-5 text-[15px] rounded-[14px]',
  lg: 'h-[54px] px-6 text-[16px] rounded-[14px] tracking-tight',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 border-0 font-semibold cursor-pointer transition-all duration-150 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
