import React, { useState } from 'react'
import { ProgressDots } from '../components/ProgressDots'
import { PrimaryButton, TextButton } from '../components/Button'
import { OptionCard } from '../components/Card'
import { BriefcaseIcon, AcademicIcon, ChatIcon, FilmIcon } from '../components/Icons'

type FocusOption = 'career' | 'exams' | 'speaking' | 'media'

const FOCUS_OPTIONS: { id: FocusOption; icon: React.ReactNode; label: string; sub?: string }[] = [
  { id: 'career', icon: <BriefcaseIcon className="size-[22px] text-[#4F46E5] dark:text-indigo-400" />, label: 'Career & Work', sub: 'Professional vocabulary & business English' },
  { id: 'exams', icon: <AcademicIcon className="size-[22px] text-[#4F46E5] dark:text-indigo-400" />, label: 'Exams & School', sub: 'IELTS, TOEFL, and academic prep' },
  { id: 'speaking', icon: <ChatIcon className="size-[22px] text-[#4F46E5] dark:text-indigo-400" />, label: 'Real-life Speaking', sub: 'Fluency in everyday conversations' },
  { id: 'media', icon: <FilmIcon className="size-[22px] text-[#4F46E5] dark:text-indigo-400" />, label: 'Media & Culture', sub: 'Movies, podcasts, and casual slang' },
]

interface OnboardFocusPageProps {
  onNext?: () => void
  onSkip?: () => void
}

export function OnboardFocusPage({ onNext, onSkip }: OnboardFocusPageProps) {
  const [selected, setSelected] = useState<FocusOption | null>('career')

  return (
    <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <ProgressDots total={4} current={1} />

      <div className="px-6 pt-6">
        <span className="text-[#4F46E5] dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider block mb-1">
          Step 2 of 4
        </span>
        <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight leading-tight mb-2">
          What is your<br />primary focus?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed m-0">
          Select the goal that matches your current target.
        </p>
      </div>

      <div className="px-6 pt-5 flex flex-col gap-3 flex-1 justify-center">
        {FOCUS_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            icon={opt.icon}
            title={opt.label}
            subtitle={opt.sub}
            selected={selected === opt.id}
            onClick={() => setSelected(opt.id)}
          />
        ))}
      </div>

      <div className="p-6 pb-10 flex flex-col gap-2">
        <PrimaryButton onClick={onNext} disabled={!selected}>
          Continue
        </PrimaryButton>
        <TextButton onClick={onSkip}>Skip for now</TextButton>
      </div>
    </div>
  )
}

export default OnboardFocusPage
