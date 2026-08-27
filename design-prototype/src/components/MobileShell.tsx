import React from "react"

interface MobileShellProps {
  children: React.ReactNode
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-[#E8EAF0] dark:bg-slate-950 flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-[393px] min-h-[852px] h-screen sm:h-[852px] bg-[#F8FAFC] dark:bg-slate-900 flex flex-col overflow-hidden sm:rounded-[40px] shadow-2xl font-sans">
        {children}
      </div>
    </div>
  )
}
