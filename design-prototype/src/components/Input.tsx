import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightSlot?: React.ReactNode
}

export function InputField({
  label,
  error,
  rightSlot,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div
        className={`h-[54px] bg-[#F1F5F9] dark:bg-slate-800 border-1.5 border-[#CBD5E1] dark:border-slate-700 focus-within:border-[#4F46E5] rounded-[14px] flex items-center px-4 gap-2 transition-colors duration-150 ${className}`}
      >
        <input
          className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#0F172A] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-500 font-normal"
          {...props}
        />
        {rightSlot}
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  )
}
