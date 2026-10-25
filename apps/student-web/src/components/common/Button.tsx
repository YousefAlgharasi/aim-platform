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
    'bg-[#4F46E5] hover:bg-[#4338CA] text-[#F8FAFC] shadow-[0_4px_16px_rgba(79,70,229,0.2)] active:scale-[0.99] disabled:bg-[#A5B4FC] dark:disabled:bg-indigo-900 disabled:shadow-none',
  secondary:
    'bg-[#F1F5F9] dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-[#E2E8F0] dark:hover:bg-slate-700 active:scale-[0.99] disabled:opacity-50',
  ghost:
    'bg-transparent text-[#4F46E5] dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 disabled:opacity-50',
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
