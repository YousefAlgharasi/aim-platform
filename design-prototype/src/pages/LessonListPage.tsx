import React from 'react'
import { SparkleIcon, CheckIcon, BookIcon, MicIcon, PencilIcon } from '../components/Icons'

interface Lesson {
  id: number
  number: number
  title: string
  duration: string
  type: 'vocab' | 'grammar' | 'speaking' | 'listening'
  completed: boolean
  current?: boolean
}

const LESSONS: Lesson[] = [
  { id: 1, number: 1, title: 'Essential Greetings & Salutations', duration: '5 mins', type: 'vocab', completed: true },
  { id: 2, number: 2, title: 'Formal vs Informal Pronouns', duration: '7 mins', type: 'grammar', completed: true },
  { id: 3, number: 3, title: 'Ordering Food & Drinks at a Cafe', duration: '8 mins', type: 'speaking', completed: false, current: true },
  { id: 4, number: 4, title: 'Understanding Train & Airport Announcements', duration: '10 mins', type: 'listening', completed: false },
  { id: 5, number: 5, title: 'Expressing Preferences & Likes', duration: '6 mins', type: 'vocab', completed: false },
]

interface LessonListPageProps {
  chapterTitle?: string
  onSelectLesson: (lessonId: number, lessonTitle: string) => void
  onBack: () => void
}

export function LessonListPage({
  chapterTitle = 'Chapter 3: Travel & Navigation',
  onSelectLesson,
  onBack,
}: LessonListPageProps) {
  return (
    <div className="flex-1 h-full min-h-0 flex flex-col bg-[#F8FAFC] dark:bg-slate-900">
      {/* App Bar Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-5 pt-8 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 flex items-center justify-center transition-colors border-none cursor-pointer"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[200px]">
          {chapterTitle}
        </span>
        <div className="size-10" />
      </div>

      {/* Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10">
        {/* Chapter Title Header */}
        <div className="mb-5">
          <span className="text-[#4F46E5] dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
            Chapter Lessons
          </span>
          <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight leading-tight m-0 mt-2">
            {chapterTitle}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 m-0">
            5 Lessons · 36 Minutes Total Practice
          </p>
        </div>

        {/* Lesson Cards List */}
        <div className="flex flex-col gap-3">
          {LESSONS.map((les) => (
            <button
              key={les.id}
              type="button"
              onClick={() => onSelectLesson(les.id, les.title)}
              className={`w-full bg-white dark:bg-slate-800 ring-1 rounded-2xl p-4 flex items-center gap-4 text-left transition-all duration-200 shadow-sm border-none cursor-pointer ${
                les.current
                  ? 'ring-2 ring-[#4F46E5] dark:ring-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/30 shadow-md'
                  : 'ring-slate-200/80 dark:ring-slate-700 hover:ring-indigo-200 dark:hover:ring-indigo-700'
              }`}
            >
              {/* Type / Number Icon Pill */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-extrabold ${
                  les.completed
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : les.current
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {les.completed ? (
                  <CheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : les.type === 'speaking' ? (
                  <MicIcon className="size-5" />
                ) : (
                  <BookIcon className="size-5" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Lesson {les.number}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {les.type}
                  </span>
                  {les.current && (
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-white bg-indigo-600 px-2 py-0.5 rounded-full animate-pulse ml-auto">
                      Current
                    </span>
                  )}
                </div>

                <p className="font-bold text-slate-900 dark:text-white text-sm m-0 leading-snug truncate">
                  {les.title}
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 m-0 font-medium">
                  {les.duration}
                </p>
              </div>

              {/* Arrow */}
              <svg className="size-4 text-slate-400 dark:text-slate-500 shrink-0" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LessonListPage
