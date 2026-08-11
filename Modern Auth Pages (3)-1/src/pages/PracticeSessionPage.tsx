import React, { useState } from 'react'
import { PrimaryButton } from '../components/Button'
import { ProgressBar } from '../components/ProgressDots'
import { CheckIcon, ZapIcon, SparkleIcon, TrophyIcon } from '../components/Icons'

interface PracticeQuestion {
  id: number
  prompt: string
  translation: string
  options: string[]
  correctIndex: number
}

const QUESTIONS: PracticeQuestion[] = [
  {
    id: 1,
    prompt: 'Which is the most polite way to order coffee at a cafe in English?',
    translation: 'Choose the natural and polite phrasing.',
    options: ['Could I get a cup of coffee, please?', 'Give me coffee now.', 'I want a coffee.', 'Coffee is good for me.'],
    correctIndex: 0,
  },
  {
    id: 2,
    prompt: 'Which phrase means asking the server for the final check?',
    translation: 'Selecting the appropriate dining expression.',
    options: ['Where is the restroom?', 'Could you bring us the bill, please?', 'Do you have a table?', 'Thanks for everything.'],
    correctIndex: 1,
  },
  {
    id: 3,
    prompt: 'Complete: "______ do you recommend for lunch today?"',
    translation: 'Select the correct question word.',
    options: ['Why', 'Who', 'What', 'Where'],
    correctIndex: 2,
  },
]

interface PracticeSessionPageProps {
  onDone: () => void
  onBack: () => void
}

export function PracticeSessionPage({ onDone, onBack }: PracticeSessionPageProps) {
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const currentQ = QUESTIONS[qIndex]

  const handleCheck = () => {
    if (selected === null) return
    setAnswered(true)
    if (selected === currentQ.correctIndex) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((i) => i + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      setFinished(true)
    }
  }

  if (finished) {
    return (
      <div className="flex-1 h-full min-h-0 flex flex-col justify-between p-6 sm:p-7 pt-12 text-center bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
        <div className="my-auto flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-25 blur-lg animate-pulse" />
            <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/25 relative transform rotate-3">
              <TrophyIcon className="size-11 text-white" />
            </div>
          </div>

          <span className="text-amber-600 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full mb-2">
            Practice Complete!
          </span>
          <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight m-0">Great Job!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 mb-6 max-w-[260px]">
            You scored {score}/{QUESTIONS.length} on this practice session.
          </p>

          <div className="w-full bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 rounded-2xl p-4 flex items-center justify-around shadow-sm mb-6">
            <div className="text-center">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                XP Earned
              </span>
              <span className="text-[#4F46E5] dark:text-indigo-400 font-extrabold text-2xl">+50 XP</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                Accuracy
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl">
                {Math.round((score / QUESTIONS.length) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="pb-4">
          <PrimaryButton onClick={onDone}>Continue to Lesson</PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col justify-between bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* App Bar & Progress */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 pt-8 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center transition-colors border-none cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <span className="text-xs font-extrabold text-[#4F46E5] dark:text-indigo-400 uppercase tracking-wider">
            Practice Session
          </span>
          <button
            type="button"
            onClick={onBack}
            className="size-9 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-xs border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            A
          </button>
        </div>

        <ProgressBar value={qIndex + 1} total={QUESTIONS.length} />
      </div>

      {/* Main Question Box */}
      <div className="flex-1 px-5 pt-6 flex flex-col gap-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-800/90 ring-1 ring-slate-200/80 dark:ring-slate-700 rounded-2xl p-5 shadow-xs">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] uppercase tracking-wider block mb-2">
            Question {qIndex + 1} of {QUESTIONS.length}
          </span>
          <p className="text-slate-900 dark:text-white font-bold text-lg leading-snug m-0">{currentQ.prompt}</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 m-0 leading-relaxed">{currentQ.translation}</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selected === idx
            const isCorrect = idx === currentQ.correctIndex

            let cardStyle = 'bg-white dark:bg-slate-800/90 ring-1 ring-slate-200/80 dark:ring-slate-700 hover:ring-indigo-200 text-slate-900 dark:text-slate-100'
            if (answered) {
              if (isCorrect) cardStyle = 'bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500 text-emerald-800 dark:text-emerald-300'
              else if (isSelected && !isCorrect) cardStyle = 'bg-rose-50 dark:bg-rose-950/60 ring-2 ring-rose-500 text-rose-800 dark:text-rose-300'
            } else if (isSelected) {
              cardStyle = 'bg-indigo-50/50 dark:bg-indigo-950/60 ring-2 ring-[#4F46E5] text-indigo-700 dark:text-indigo-300'
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => !answered && setSelected(idx)}
                disabled={answered}
                className={`w-full p-4 rounded-2xl text-left font-bold text-sm transition-all duration-200 flex items-center justify-between border-none cursor-pointer ${cardStyle}`}
              >
                <span>{opt}</span>
                {answered && isCorrect && <CheckIcon className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pb-9 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        {!answered ? (
          <PrimaryButton onClick={handleCheck} disabled={selected === null}>
            Check Answer
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={handleNext}>
            {qIndex < QUESTIONS.length - 1 ? 'Next Question' : 'Complete Session'}
          </PrimaryButton>
        )}
      </div>
    </div>
  )
}

export default PracticeSessionPage
