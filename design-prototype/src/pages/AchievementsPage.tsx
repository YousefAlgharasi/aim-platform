import React, { useState } from 'react'
import { TrophyIcon, FlameIcon, ZapIcon, CheckIcon, BookIcon, MicIcon, SparkleIcon } from '../components/Icons'

interface AchievementItem {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  total?: number
  category: 'learning' | 'streak' | 'mastery'
}

interface AchievementsPageProps {
  onBack: () => void
}

export function AchievementsPage({ onBack }: AchievementsPageProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  const achievements: AchievementItem[] = [
    {
      id: 1,
      title: 'First Step',
      description: 'Complete your first English lesson',
      icon: <BookIcon className="size-5" />,
      unlocked: true,
      unlockedAt: 'Unlocked Jul 12',
      category: 'learning',
    },
    {
      id: 2,
      title: 'Streak Master',
      description: 'Maintain a 7-day learning streak',
      icon: <FlameIcon className="size-5 text-amber-500" />,
      unlocked: true,
      unlockedAt: 'Unlocked Today',
      category: 'streak',
    },
    {
      id: 3,
      title: 'Grammar Wizard',
      description: 'Score 90%+ in Grammar assessment',
      icon: <CheckIcon className="size-5 text-emerald-500" />,
      unlocked: true,
      unlockedAt: 'Unlocked Aug 01',
      category: 'mastery',
    },
    {
      id: 4,
      title: 'Voice Champion',
      description: 'Complete 5 Live AI Voice practice sessions',
      icon: <MicIcon className="size-5 text-indigo-500" />,
      unlocked: true,
      unlockedAt: 'Unlocked Aug 03',
      category: 'mastery',
    },
    {
      id: 5,
      title: 'Vocabulary Titan',
      description: 'Master 200+ active words',
      icon: <TrophyIcon className="size-5 text-purple-500" />,
      unlocked: true,
      unlockedAt: 'Unlocked Aug 04',
      category: 'mastery',
    },
    {
      id: 6,
      title: 'Speed Learner',
      description: 'Finish 3 lessons in a single day',
      icon: <ZapIcon className="size-5 text-amber-500" />,
      unlocked: false,
      progress: 2,
      total: 3,
      category: 'learning',
    },
    {
      id: 7,
      title: 'Perfect Quiz Accuracy',
      description: 'Score 100% on 5 practice quizzes',
      icon: <SparkleIcon className="size-5 text-indigo-500" />,
      unlocked: false,
      progress: 3,
      total: 5,
      category: 'mastery',
    },
    {
      id: 8,
      title: 'Polyglot Legend',
      description: 'Reach Level 20 in English',
      icon: <TrophyIcon className="size-5 text-[#4F46E5]" />,
      unlocked: false,
      progress: 12,
      total: 20,
      category: 'learning',
    },
  ]

  const filtered = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked') return !a.unlocked
    return true
  })

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col justify-between overflow-y-auto bg-[#F8FAFC]">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-5 pt-8 pb-3 border-b border-slate-100 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="size-10 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-colors border-none cursor-pointer"
          title="Back"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-extrabold text-sm text-slate-900">Achievements</span>
        <button
          type="button"
          onClick={onBack}
          className="size-9 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-xs border-none cursor-pointer hover:opacity-90 transition-opacity"
        >
          A
        </button>
      </div>

      <div className="flex-1 p-5 pt-4 pb-16 flex flex-col gap-4">
        {/* Sleek Summary Header Card */}
        <div className="bg-white ring-1 ring-slate-200/70 rounded-xl p-4 shadow-2xs flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <TrophyIcon className="size-4 text-amber-500" />
              <span className="font-bold text-slate-900 text-xs">AIM Milestones</span>
            </div>
            <p className="text-slate-400 text-[11px] m-0">
              {unlockedCount} of {achievements.length} badges unlocked
            </p>
          </div>
          <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
            Gold League #3
          </span>
        </div>

        {/* Filter Switcher */}
        <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { id: 'locked', label: `In Progress (${achievements.length - unlockedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-none cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievement Items Grid */}
        <div className="flex flex-col gap-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white ring-1 rounded-xl p-3.5 flex items-center gap-3.5 shadow-2xs transition-all ${
                item.unlocked ? 'ring-slate-200/70' : 'ring-slate-200/40 opacity-75'
              }`}
            >
              {/* Badge Icon Container */}
              <div
                className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                  item.unlocked
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="font-bold text-slate-900 text-xs m-0 truncate">{item.title}</p>
                  {item.unlocked && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-md shrink-0">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px] m-0 truncate">{item.description}</p>

                {/* Progress bar if locked */}
                {!item.unlocked && item.progress !== undefined && item.total !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(item.progress / item.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {item.progress}/{item.total}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AchievementsPage
