import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "text" | "social"
  icon?: React.ReactNode
}

export function PrimaryButton({
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`w-full h-[54px] rounded-[14px] font-semibold text-[16px] tracking-tight transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
        disabled
          ? "bg-[#A5B4FC] text-white cursor-not-allowed shadow-none"
          : "bg-[#4F46E5] hover:bg-[#4338CA] text-[#F8FAFC] shadow-[0_4px_16px_rgba(79,70,229,0.2)] active:scale-[0.99]"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`w-full h-[50px] rounded-[14px] font-semibold text-[15px] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] ${
        disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.99]"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function TextButton({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`bg-transparent border-none text-[#64748B] hover:text-[#0F172A] font-medium text-[16px] cursor-pointer px-6 py-3 transition-colors duration-150 text-center ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SocialButton({
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex-1 h-[50px] bg-[#0F172A] hover:opacity-90 rounded-[14px] flex items-center justify-center gap-2 text-[#F8FAFC] font-medium text-[14px] cursor-pointer transition-opacity duration-150 ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}
