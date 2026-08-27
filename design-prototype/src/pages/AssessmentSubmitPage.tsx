import React, { useState, useEffect } from "react"
import { SparkleIcon } from "../components/Icons"

interface AssessmentSubmitPageProps {
  onDone: () => void
}

export function AssessmentSubmitPage({ onDone }: AssessmentSubmitPageProps) {
  const [analyzing, setAnalyzing] = useState(true)
  const [analysisStep, setAnalysisStep] = useState(0)

  const steps = [
    "Evaluating response accuracy...",
    "Calibrating skill level...",
    "Generating personalized roadmap..."
  ]

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 900)

    const timer = setTimeout(() => {
      setAnalyzing(false)
      onDone()
    }, 3000)

    return () => {
      clearInterval(stepInterval)
      clearTimeout(timer)
    }
  }, [onDone])

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 py-8 text-center bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full flex flex-col items-center z-10 my-auto">
        {/* Animated Hero Check Badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 opacity-20 blur-lg animate-pulse" />
          <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 relative transform rotate-3">
            <svg
              className="size-11 text-white stroke-[2.5]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-slate-900 font-extrabold text-2xl tracking-tight m-0">
          Submission Successful!
        </h1>
        <p className="text-slate-500 text-sm mt-2 mb-8 max-w-[260px] leading-relaxed">
          Your placement test results have been recorded and saved.
        </p>

        {/* Stats Summary Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-8">
          {/* Completed Card */}
          <div className="bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/80 rounded-2xl p-4 flex flex-col items-start text-left shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <svg className="size-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10" cy="10" r="7" />
                <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Completed
            </span>
            <span className="text-slate-900 font-extrabold text-xl mt-0.5">
              21 <span className="text-slate-400 font-medium text-xs">/ 25</span>
            </span>
          </div>

          {/* Skipped Card */}
          <div className="bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/80 rounded-2xl p-4 flex flex-col items-start text-left shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <svg className="size-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 7v4M10 13.5h.01" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Skipped
            </span>
            <span className="text-slate-900 font-extrabold text-xl mt-0.5">
              4 <span className="text-slate-400 font-medium text-xs">questions</span>
            </span>
          </div>
        </div>

        {/* AI Calibration Banner */}
        {analyzing && (
          <div className="w-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200/60 rounded-2xl p-5 backdrop-blur-md flex flex-col items-center gap-3.5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-7 h-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                <SparkleIcon className="size-3.5 text-indigo-600 absolute inset-0 m-auto" />
              </div>
              <span className="text-indigo-600 font-bold text-sm">
                AI Engine Active
              </span>
            </div>

            {/* Dynamic Step Text */}
            <p className="text-slate-700 font-semibold text-xs m-0 animate-pulse">
              {steps[analysisStep]}
            </p>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed max-w-[240px] m-0">
              Calibrating starting level to ensure your learning path is perfectly paced.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssessmentSubmitPage
