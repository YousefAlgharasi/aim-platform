import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Trailing control inside the field, e.g. a show/hide-password toggle. */
  rightSlot?: ReactNode;
}

// Matches design-prototype/src/components/Input.tsx (InputField): 54px slate-100 field,
// 14px radius, indigo focus border. The label stays visible above the field (a placeholder-only
// label vanishes once the user types, and the prototype's pale placeholder fails text contrast);
// `placeholder` is optional hint text, not the field's name.
export function Input({ label, error, id, rightSlot, className = '', placeholder, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={inputId} className="text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      <div
        className={`h-[54px] bg-field border-[1.5px] ${
          error ? 'border-danger' : 'border-line-strong dark:border-line'
        } focus-within:border-brand-ink focus-within:ring-2 focus-within:ring-brand-ink/25 rounded-[14px] flex items-center px-4 gap-2 transition-colors duration-150 ${className}`}
      >
        <input
          id={inputId}
          placeholder={placeholder}
          aria-describedby={errorId}
          aria-invalid={!!error}
          className="flex-1 min-w-0 h-full bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none text-[15px] text-ink placeholder-ink-muted font-normal"
          {...props}
        />
        {rightSlot}
      </div>
      {error && (
        <span id={errorId} role="alert" className="text-[13px] text-danger-ink font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
