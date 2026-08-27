import React from 'react'
import { SparkleIcon, CheckIcon } from '../components/Icons'

interface Chapter {
  id: number
  number: number
  title: string
  subtitle: string
  lessonsCount: number
  completedCount: number
  locked?: boolean
}

const CHAPTERS: Chapter[] = [
  { id: 1, number: 1, title: 'Foundations & Basics', subtitle: 'Essential grammar, core verbs & key vocabulary', lessonsCount: 6, completedCount: 6 },
  { id: 2, number: 2, title: 'Greetings & Small Talk', subtitle: 'Social interactions, introductions & etiquette', lessonsCount: 5, completedCount: 5 },
  { id: 3, number: 3, title: 'Travel & Navigation', subtitle: 'Airports, hotels, asking directions & transit', lessonsCount: 8, completedCount: 3 },
  { id: 4, number: 4, title: 'Dining & Socializing', subtitle: 'Ordering food, restaurants & casual dialogue', lessonsCount: 6, completedCount: 0, locked: true },
  { id: 5, number: 5, title: 'Business & Career', subtitle: 'Professional emails, meetings & interviews', lessonsCount: 7, completedCount: 0, locked: true },
]

interface ChapterListPageProps {
  courseTitle?: string
  onSelectChapter: (chapterId: number, chapterTitle: string) => void
  onBack: () => void
}

export function ChapterListPage({
  courseTitle = 'General English (B1)',
  onSelectChapter,
  onBack,
}: ChapterListPageProps) {
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
          {courseTitle}
        </span>
        <div className="size-10" />
      </div>

      {/* Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10">
        {/* Banner Hero */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 rounded-3xl p-5 mb-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-indigo-100 text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full inline-block mb-2">
            Course Overview
          </span>
          <h2 className="font-extrabold text-xl m-0 leading-tight mb-1">{courseTitle}</h2>
          <p className="text-indigo-100/90 text-xs m-0 mb-4">5 Chapters · 32 Total Lessons</p>

          <div className="flex justify-between text-xs mb-1.5 font-semibold">
            <span className="text-indigo-100">Course Progress</span>
            <span className="font-extrabold">44%</span>
          </div>
          <div className="h-2 bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
            <div className="w-[44%] h-full bg-white rounded-full transition-all duration-500" />
          </div>
        </div>

        {/* Chapters Section Header */}
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-slate-900 dark:text-white font-extrabold text-base tracking-tight">Course Chapters</span>
          <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">5 Chapters</span>
        </div>

        {/* Chapter Cards List */}
        <div className="flex flex-col gap-3">
          {CHAPTERS.map((ch) => {
            const isCompleted = ch.completedCount === ch.lessonsCount
            const isLocked = ch.locked

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => !isLocked && onSelectChapter(ch.id, ch.title)}
                disabled={isLocked}
                className={`w-full bg-white dark:bg-slate-800 ring-1 rounded-2xl p-4.5 flex items-start gap-4 text-left transition-all duration-200 shadow-sm border-none ${
                  isLocked
                    ? 'ring-slate-200/60 dark:ring-slate-800 opacity-65 cursor-not-allowed'
                    : 'ring-slate-200/80 dark:ring-slate-700 hover:ring-indigo-300 dark:hover:ring-indigo-700 hover:shadow-md cursor-pointer'
                }`}
              >
                {/* Chapter Number Badge */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-base ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isLocked
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon className="size-6 text-white" />
                  ) : (
                    <span>Ch.{ch.number}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-slate-900 dark:text-white text-base m-0 leading-tight truncate">
                      {ch.title}
                    </p>
                    {isLocked && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>

                  <p className="text-slate-400 dark:text-slate-500 text-xs m-0 mb-3 leading-relaxed line-clamp-2">
                    {ch.subtitle}
                  </p>

                  {/* Lessons Progress */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 mr-3">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                          }`}
                          style={{ width: `${(ch.completedCount / ch.lessonsCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {ch.completedCount}/{ch.lessonsCount} lessons
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ChapterListPage
