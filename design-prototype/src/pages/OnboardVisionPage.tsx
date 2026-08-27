import React from 'react'
import { ProgressDots } from '../components/ProgressDots'
import { PrimaryButton, TextButton } from '../components/Button'
import chatAiSvg from '../assets/undraw_chat_ai.svg'

interface OnboardVisionPageProps {
  onNext?: () => void
  onSkip?: () => void
}

export function OnboardVisionPage({ onNext, onSkip }: OnboardVisionPageProps) {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <ProgressDots total={4} current={0} />

      {/* Hero Illustration */}
      <div className="flex-1 flex items-center justify-center px-6 pb-0">
        <img
          src={chatAiSvg}
          alt="AI Chat illustration"
          className="w-full max-w-[340px]"
        />
      </div>

      {/* Content Text */}
      <div className="px-6 pt-4">
        <h1 className="text-[#0F172A] dark:text-white font-bold text-3xl tracking-tight leading-tight mb-2">
          Your personal AI Tutor,<br />built for you.
        </h1>
        <p className="text-[#94A3B8] dark:text-slate-500 text-sm leading-relaxed">
          Adaptive AI learning paths that evolve with your progress — lessons, quizzes, and mentorship shaped around you.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="p-6 pb-10 flex flex-col gap-2">
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
        <TextButton onClick={onSkip}>Skip for now</TextButton>
      </div>
    </div>
  )
}

export default OnboardVisionPage
