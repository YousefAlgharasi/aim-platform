import React, { useEffect } from 'react'
import { SpinnerIcon } from '../components/Icons'

interface SplashPageProps {
  onDone?: () => void
}

export function SplashPage({ onDone }: SplashPageProps) {
  useEffect(() => {
    if (!onDone) return
    const timer = setTimeout(onDone, 2200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="flex-1 bg-[#4F46E5] flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.12)_0%,transparent_65%)] pointer-events-none" />

      {/* Brand / Logo Text */}
      <div className="flex flex-col items-center gap-2 z-10">
        <h1 className="text-white font-extrabold text-7xl tracking-tight leading-none select-none">
          AIM
        </h1>
        <span className="text-white/60 text-xs font-semibold tracking-widest uppercase mt-1">
          Your AI Mind Coach
        </span>
      </div>

      {/* Loading Spinner */}
      <div className="absolute bottom-20 z-10">
        <SpinnerIcon className="size-9 text-white" />
      </div>
    </div>
  )
}

export default SplashPage
