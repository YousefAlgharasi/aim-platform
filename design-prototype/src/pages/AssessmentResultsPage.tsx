import React, { useState } from 'react'
import { PrimaryButton } from '../components/Button'
import { SparkleIcon, CheckIcon, RocketIcon } from '../components/Icons'

interface AssessmentResultsPageProps {
  onUnlock: () => void
}

function FlagIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 3h12l-3 4.5L16 12H4"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="4" y1="3" x2="4" y2="21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function AssessmentResultsPage({ onUnlock }: AssessmentResultsPageProps) {
  const [startChoice, setStartChoice] = useState<'zero' | 'level'>('level')
  const [plan, setPlan] = useState<'free' | 'plus'>('plus')

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 overflow-y-auto bg-gradient-to-b from-indigo-50/50 via-white to-slate-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-6 my-auto">
        {/* Level badge Hero */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* Main Glowing Badge */}
          <div className="relative mb-4">
            <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl opacity-25 blur-lg" />
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/25 relative border border-indigo-400/30">
              <span className="font-extrabold text-4xl tracking-tight leading-none">B1</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mt-1">
                Level
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h2 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight m-0">Great Job!</h2>
            <SparkleIcon className="size-6 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] tracking-wider uppercase mb-2">
            Intermediate Track
          </span>
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[270px] m-0">
            Strong listening and grammar skills detected. We recommend starting at Level B1.
          </p>
        </div>

        {/* Starting level selection */}
        <div className="flex flex-col gap-3">
          <label className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider block px-1">
            Where would you like to start?
          </label>
          {[
            {
              id: 'zero' as const,
              icon: <FlagIcon className="size-5.5 text-[#4F46E5] dark:text-indigo-400" />,
              title: 'Start from zero (A1)',
              desc: 'Build your foundation from scratch.',
            },
            {
              id: 'level' as const,
              icon: <RocketIcon className="size-5.5 text-[#4F46E5] dark:text-indigo-400" />,
              title: 'Start from level (B1)',
              desc: 'Jump straight to your calibrated track.',
              recommended: true,
            },
          ].map((opt) => {
            const active = startChoice === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStartChoice(opt.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer text-left relative ${
                  active
                    ? 'bg-[rgba(79,70,229,0.07)] dark:bg-indigo-950/60 ring-2 ring-[#4F46E5] shadow-[0_2px_12px_rgba(79,70,229,0.12)]'
                    : 'bg-white dark:bg-slate-800 ring-1 ring-[#E2E8F0] dark:ring-slate-700 hover:ring-[#C7D2FE] hover:shadow-sm'
                }`}
              >
                {/* Icon Pill */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    active ? 'bg-indigo-100 dark:bg-indigo-900/60' : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {opt.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-[14px] m-0 ${active ? 'text-[#4F46E5] dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                      {opt.title}
                    </p>
                  </div>
                  <p className={`text-xs m-0 mt-0.5 ${active ? 'text-indigo-500 dark:text-indigo-300 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                    {opt.desc}
                  </p>
                </div>

                {/* Check Badge */}
                {active ? (
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] flex items-center justify-center shrink-0 shadow-md">
                    <CheckIcon className="size-3 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full ring-1 ring-slate-300 dark:ring-slate-600 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Plan selection */}
        <div className="flex flex-col gap-3">
          <label className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider block px-1">
            Select your plan
          </label>
          <div className="flex flex-col gap-3">
            {[
              {
                id: 'free' as const,
                name: 'Free Plan',
                desc: 'Standard lessons, daily limits',
                price: '$0',
                period: '/mo',
              },
              {
                id: 'plus' as const,
                name: 'AIM Plus',
                desc: 'Unlimited AI tutor, advanced tracks',
                price: '$12.99',
                period: '/mo',
                badge: '7 Days Free',
              },
            ].map((p) => {
              const active = plan === p.id
              return (
                <div key={p.id} className="relative w-full">
                  {p.badge && (
                    <div className="absolute -top-2.5 right-4 z-10 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[9px] uppercase tracking-wider shadow-sm">
                      {p.badge}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPlan(p.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer text-left ${
                      active
                        ? 'bg-[rgba(79,70,229,0.07)] dark:bg-indigo-950/60 ring-2 ring-[#4F46E5] shadow-[0_2px_12px_rgba(79,70,229,0.12)]'
                        : 'bg-white dark:bg-slate-800 ring-1 ring-[#E2E8F0] dark:ring-slate-700 hover:ring-[#C7D2FE] hover:shadow-sm'
                    }`}
                  >
                    <div className="text-left flex-1 min-w-0 pr-3">
                      <p className={`font-bold text-[14px] m-0 ${active ? 'text-[#4F46E5] dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                        {p.name}
                      </p>
                      <p className={`text-xs m-0 mt-0.5 truncate ${active ? 'text-indigo-500 dark:text-indigo-300 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                        {p.desc}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-extrabold text-base ${active ? 'text-[#4F46E5] dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                        {p.price}
                      </span>
                      <span className={`text-xs font-normal ${active ? 'text-indigo-400 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'}`}>
                        {p.period}
                      </span>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Primary Action CTA */}
      <div className="pt-4 pb-2">
        <PrimaryButton onClick={onUnlock}>Unlock My Course</PrimaryButton>
      </div>
    </div>
  )
}

export default AssessmentResultsPage
