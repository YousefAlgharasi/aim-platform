import React, { useState } from 'react'
import { ProgressDots } from '../components/ProgressDots'
import { PrimaryButton, TextButton } from '../components/Button'
import { OptionCard } from '../components/Card'
import { SeedlingIcon, BoltIcon, RocketIcon } from '../components/Icons'

type HabitOption = '5min' | '15min' | '30min'

const HABIT_OPTIONS: { id: HabitOption; icon: React.ReactNode; label: string; sub: string }[] = [
  { id: '5min',  icon: <SeedlingIcon className="size-[22px] text-[#4F46E5]" />, label: '5 mins / day',  sub: 'Light — great for staying consistent' },
  { id: '15min', icon: <BoltIcon     className="size-[22px] text-[#4F46E5]" />, label: '15 mins / day', sub: 'Balanced — recommended for most learners' },
  { id: '30min', icon: <RocketIcon   className="size-[22px] text-[#4F46E5]" />, label: '30 mins / day', sub: 'Intensive — fastest path to fluency' },
]

interface OnboardHabitPageProps {
  onNext?: () => void
  onSkip?: () => void
}

export function OnboardHabitPage({ onNext, onSkip }: OnboardHabitPageProps) {
  const [selected, setSelected] = useState<HabitOption>('15min')

  return (
    <div className="flex-1 flex flex-col justify-between">
      <ProgressDots total={4} current={2} />

      <div className="px-6 pt-7">
        <span className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider block mb-1">
          Step 3 of 4
        </span>
        <h1 className="text-[#0F172A] font-bold text-3xl tracking-tight leading-tight mb-2">
          Set your daily goal
        </h1>
        <p className="text-[#94A3B8] text-sm leading-relaxed">
          How much time will you commit to learning each day?
        </p>
      </div>

      <div className="px-6 pt-6 flex flex-col gap-2.5 flex-1">
        {HABIT_OPTIONS.map((opt) => (
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

export default OnboardHabitPage
