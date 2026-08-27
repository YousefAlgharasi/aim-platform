import React from "react"
import { CheckIcon } from "./Icons"

interface OptionCardProps {
  icon?: React.ReactNode | string
  title: string
  subtitle?: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function OptionCard({
  icon,
  title,
  subtitle,
  selected = false,
  onClick,
  className = "",
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer text-left relative ${
        selected
          ? "bg-[rgba(79,70,229,0.07)] ring-2 ring-[#4F46E5] shadow-[0_2px_12px_rgba(79,70,229,0.12)]"
          : "bg-white ring-1 ring-[#E2E8F0] hover:ring-[#C7D2FE] hover:shadow-sm"
      } ${className}`}
    >
      {/* Icon pill */}
      {icon && (
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
            selected ? "bg-[rgba(79,70,229,0.14)]" : "bg-indigo-50"
          }`}
        >
          {icon}
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-[15px] m-0 leading-snug ${
            selected ? "text-[#4F46E5]" : "text-[#0F172A]"
          }`}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-[#94A3B8] font-normal mt-0.5 mb-0 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Check badge */}
      {selected && (
        <div className="w-6 h-6 rounded-full bg-[#4F46E5] flex items-center justify-center shrink-0 shadow-md">
          <CheckIcon />
        </div>
      )}
    </button>
  )
}

interface ChoiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  selected?: boolean
  onClick?: () => void
}

export function ChoiceCard({
  icon,
  title,
  description,
  selected = false,
  onClick,
}: ChoiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-5 rounded-[18px] border-1.5 flex flex-col gap-3 items-start transition-all duration-150 cursor-pointer text-left relative ${
        selected
          ? "border-[#4F46E5] bg-[rgba(79,70,229,0.08)]"
          : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
      }`}
    >
      {selected && (
        <div className="w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center absolute top-3.5 right-3.5">
          <CheckIcon />
        </div>
      )}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          selected ? "bg-[rgba(79,70,229,0.12)]" : "bg-[#F1F5F9]"
        }`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`font-bold text-[15px] m-0 ${
            selected ? "text-[#4F46E5]" : "text-[#0F172A]"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs font-normal mt-1 mb-0 leading-relaxed ${
            selected ? "text-[#4F46E5]" : "text-[#94A3B8]"
          }`}
        >
          {description}
        </p>
      </div>
    </button>
  )
}
