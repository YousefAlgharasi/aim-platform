import React from "react"

export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-[#CBD5E1] dark:bg-slate-700" />
      <span className="text-[#94A3B8] dark:text-slate-500 text-xs font-normal">{label}</span>
      <div className="flex-1 h-px bg-[#CBD5E1] dark:bg-slate-700" />
    </div>
  )
}
