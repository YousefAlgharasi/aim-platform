import React, { useState } from 'react'
import { BookIcon, SparkleIcon, ZapIcon, CheckIcon, RocketIcon } from '../components/Icons'

interface LessonDetailPageProps {
  lessonTitle?: string
  isCompleted?: boolean
  onBack: () => void
  onStartLiveAiLesson: () => void
  onStartPractice: () => void
  onAskAiTeacher: () => void
}

export function LessonDetailPage({
  lessonTitle = 'Ordering Food & Drinks at a Cafe',
  isCompleted = false,
  onBack,
  onStartLiveAiLesson,
  onStartPractice,
  onAskAiTeacher,
}: LessonDetailPageProps) {
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)

  const keyPhrases = [
    { phrase: 'Could I get a cup of coffee, please?', translation: 'Polite ordering at a cafe or restaurant.' },
    { phrase: 'Could you bring us the bill, please?', translation: 'Asking the server for the check.' },
    { phrase: 'What do you recommend today?', translation: 'Asking for today\'s specials.' },
  ]

  const handlePlayAudio = (idx: number) => {
    setPlayingAudio(idx)
    setTimeout(() => setPlayingAudio(null), 1500)
  }

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col justify-between overflow-y-auto bg-[#F8FAFC] dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-5 pt-8 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center transition-colors border-none cursor-pointer"
          title="Back"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-extrabold text-sm text-slate-900 dark:text-white">Lesson Details</span>
        <div className="size-10" />
      </div>

      <div className="flex-1 p-5 pt-4 pb-8 flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          {/* Lesson Hero Card */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 rounded-3xl p-5.5 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-indigo-100 text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
                Lesson 3 · Speaking & Vocab
              </span>
              {isCompleted && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <CheckIcon className="size-3 text-emerald-300" /> Completed
                </span>
              )}
            </div>

            <h1 className="font-extrabold text-xl m-0 leading-tight mb-2 text-white">{lessonTitle}</h1>
            <p className="text-indigo-100/90 text-xs m-0 leading-relaxed">
              Master essential dialogue, dining etiquette, and confidence when ordering in English.
            </p>
          </div>

          {/* Key Vocabulary & Phrases Preview Card */}
          <div className="bg-white dark:bg-slate-800/90 ring-1 ring-slate-200/80 dark:ring-slate-700/80 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center">
                  <BookIcon className="size-4" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Key Vocabulary & Phrases</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Tap 🔊 to listen</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {keyPhrases.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 text-xs m-0">{item.phrase}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] m-0 mt-0.5">{item.translation}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(idx)}
                    className={`size-8 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors shrink-0 ${
                      playingAudio === idx ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                    }`}
                    title="Listen Pronunciation"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Section */}
          <div className="flex flex-col gap-3">
            {/* Primary CTA: Start Live AI Voice Lesson */}
            <button
              type="button"
              onClick={onStartLiveAiLesson}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-extrabold text-base border-none cursor-pointer shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-98 transition-all"
            >
              <RocketIcon className="size-5 text-white" />
              <span>{isCompleted ? 'Re-learn with Live AI Voice' : 'Start Learning Now'}</span>
            </button>

            {isCompleted && (
              /* Post-Lesson Reinforcement Modes */
              <div className="flex flex-col gap-3 mt-1">
                <div className="px-1">
                  <span className="text-slate-900 dark:text-white font-extrabold text-base tracking-tight block">
                    Lesson Mastered! 🌟
                  </span>
                  <p className="text-slate-400 dark:text-slate-500 text-xs m-0 mt-0.5">
                    Reinforce your knowledge or practice with quick exercises.
                  </p>
                </div>

                {/* Practice Now */}
                <button
                  type="button"
                  onClick={onStartPractice}
                  className="w-full bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-indigo-950/80 ring-2 ring-[#4F46E5] rounded-2xl p-4 flex items-center gap-4 text-left transition-all duration-200 shadow-md shadow-indigo-500/10 cursor-pointer border-none"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <ZapIcon className="size-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-indigo-700 dark:text-indigo-300 text-base m-0">Practice Now</p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white bg-indigo-600 px-2 py-0.5 rounded-full">
                        Quiz
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-xs m-0 mt-0.5">
                      Test your comprehension with quick interactive exercises.
                    </p>
                  </div>
                </button>

                {/* Ask AI Tutor */}
                <button
                  type="button"
                  onClick={onAskAiTeacher}
                  className="w-full bg-white dark:bg-slate-800/90 ring-1 ring-slate-200/80 dark:ring-slate-700/80 hover:ring-indigo-300 rounded-2xl p-4 flex items-center gap-4 text-left transition-all duration-200 shadow-sm cursor-pointer border-none"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <SparkleIcon className="size-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm m-0">Ask AI Tutor</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs m-0 mt-0.5">
                      Chat with your AI tutor to clarify rules or ask questions.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonDetailPage
