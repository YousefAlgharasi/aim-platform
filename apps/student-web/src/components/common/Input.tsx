import { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Trailing control inside the field, e.g. a show/hide-password toggle. */
  rightSlot?: ReactNode;
}

// Matches design-prototype/src/components/Input.tsx (InputField): 54px slate-100 field,
// 14px radius, indigo focus border. The label is kept for accessibility; the prototype
// shows only a placeholder, so the label is visually hidden unless `showLabel` styles apply.
export function Input({ label, error, id, rightSlot, className = '', placeholder, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div
        className={`h-[54px] bg-[#F1F5F9] dark:bg-slate-800 border-[1.5px] ${
          error ? 'border-red-400' : 'border-[#CBD5E1] dark:border-slate-700'
        } focus-within:border-[#4F46E5] rounded-[14px] flex items-center px-4 gap-2 transition-colors duration-150 ${className}`}
      >
        <input
          id={inputId}
          placeholder={placeholder ?? label}
          aria-describedby={errorId}
          aria-invalid={!!error}
          className="flex-1 min-w-0 bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none text-[15px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-500 font-normal"
          {...props}
        />
        {rightSlot}
      </div>
      {error && (
        <span id={errorId} role="alert" className="text-xs text-red-500 dark:text-red-400 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
