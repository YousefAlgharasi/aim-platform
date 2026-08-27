import React from 'react'
import { PrimaryButton } from '../components/Button'
import { ClockIcon, ClipboardIcon, LightbulbIcon, SparkleIcon } from '../components/Icons'

interface AssessmentIntroPageProps {
  onStart: () => void
}

export function AssessmentIntroPage({ onStart }: AssessmentIntroPageProps) {
  const items = [
    {
      icon: <ClockIcon className="size-5 text-[#4F46E5]" />,
      title: '25 Minutes',
      desc: 'Estimated duration for a full calibrated assessment.',
    },
    {
      icon: <ClipboardIcon className="size-5 text-[#4F46E5]" />,
      title: '20 Adaptive Questions',
      desc: 'Questions dynamically adapt to your skill level.',
    },
    {
      icon: <LightbulbIcon className="size-5 text-amber-500" />,
      title: 'Helpful Tip',
      desc: "If you don't know an answer, it is okay to skip and let the AI adjust.",
    },
  ]

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 pt-10 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50">
      <div>
        {/* Hero Icon Badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl opacity-20 blur-md" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 relative border border-indigo-400/30">
            <svg
              className="size-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#4F46E5] font-extrabold text-xs uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full">
            Placement Test
          </span>
        </div>
        <h1 className="text-slate-900 font-extrabold text-3xl tracking-tight leading-tight m-0 mt-2">
          Level Assessment
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
          Calibrate your AI tutor to find your optimal starting point.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="flex flex-col gap-3 my-6 flex-1 justify-center">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex gap-4 items-center bg-white ring-1 ring-slate-200/80 rounded-2xl p-4 shadow-xs hover:ring-indigo-200 transition-all duration-200"
          >
            <div className="w-11 h-11 bg-indigo-50/80 rounded-xl flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 font-bold text-[15px] m-0 leading-snug">{item.title}</p>
              <p className="text-slate-400 font-normal text-xs mt-0.5 mb-0 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}

        <p className="text-slate-400 text-xs text-center mt-4 leading-relaxed">
          By starting, you agree to our{' '}
          <span className="text-[#4F46E5] font-semibold cursor-pointer underline underline-offset-2">
            Assessment Honor Code
          </span>
        </p>
      </div>

      <div className="pb-4">
        <PrimaryButton onClick={onStart}>Start Assessment</PrimaryButton>
      </div>
    </div>
  )
}

export default AssessmentIntroPage
