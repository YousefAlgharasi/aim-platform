import React, { useState, useEffect } from 'react'
import { PrimaryButton } from '../components/Button'
import {
  FlameIcon,
  BookIcon,
  MicIcon,
  PencilIcon,
  ZapIcon,
  CalendarIcon,
  LightbulbIcon,
  HomeIcon,
  RefreshIcon,
  ChartIcon,
  UserIcon,
  TrophyIcon,
  CreditCardIcon,
  LogOutIcon,
  SparkleIcon,
  CheckIcon,
} from '../components/Icons'
import { LessonDetailPage } from './LessonDetailPage'
import { PracticeSessionPage } from './PracticeSessionPage'
import { AiTeacherChatPage } from './AiTeacherChatPage'
import { LiveAiLessonChatPage, type NextLessonInfo } from './LiveAiLessonChatPage'
import { AchievementsPage } from './AchievementsPage'
import { AccountSettingsPage } from './AccountSettingsPage'

export type TabId = 'home' | 'learn' | 'review' | 'progress' | 'profile'
export type ViewState =
  | { type: 'tab'; tab: TabId }
  | { type: 'lesson-detail'; lessonTitle: string }
  | { type: 'live-ai-lesson'; lessonTitle: string }
  | { type: 'practice'; lessonTitle?: string }
  | { type: 'ai-chat' }
  | { type: 'achievements' }
  | { type: 'settings' }

interface LessonItem {
  id: number
  number: number
  title: string
  duration: string
  type: 'vocab' | 'grammar' | 'speaking' | 'listening'
  completed: boolean
  current?: boolean
  locked?: boolean
}

interface ChapterData {
  id: number
  number: number
  title: string
  subtitle: string
  lessonsCount: number
  completedCount: number
  lessons: LessonItem[]
}

const CHAPTERS_DATA: ChapterData[] = [
  {
    id: 1,
    number: 1,
    title: 'Foundations & Core Verbs',
    subtitle: 'Essential grammar, core verbs & key sentence structure',
    lessonsCount: 3,
    completedCount: 3,
    lessons: [
      { id: 101, number: 1, title: 'Essential Greetings & Salutations', duration: '5 mins', type: 'vocab', completed: true },
      { id: 102, number: 2, title: 'Subject Pronouns & Present Tense', duration: '7 mins', type: 'grammar', completed: true },
      { id: 103, number: 3, title: 'Basic Sentence Patterns', duration: '6 mins', type: 'grammar', completed: true },
    ],
  },
  {
    id: 2,
    number: 2,
    title: 'Greetings & Small Talk',
    subtitle: 'Social interactions, introductions & everyday etiquette',
    lessonsCount: 3,
    completedCount: 3,
    lessons: [
      { id: 201, number: 1, title: 'Introducing Yourself & Others', duration: '5 mins', type: 'speaking', completed: true },
      { id: 202, number: 2, title: 'Asking How Someone Is Doing', duration: '6 mins', type: 'vocab', completed: true },
      { id: 203, number: 3, title: 'Polite Conversation Closings', duration: '5 mins', type: 'speaking', completed: true },
    ],
  },
  {
    id: 3,
    number: 3,
    title: 'Travel & Dining Out',
    subtitle: 'Airports, cafes, asking directions & restaurant etiquette',
    lessonsCount: 3,
    completedCount: 1,
    lessons: [
      { id: 301, number: 1, title: 'Navigating Airports & Transit', duration: '8 mins', type: 'listening', completed: true },
      { id: 302, number: 2, title: 'Ordering Food & Drinks at a Cafe', duration: '8 mins', type: 'speaking', completed: false, current: true },
      { id: 303, number: 3, title: 'Asking for the Bill & Tipping', duration: '7 mins', type: 'vocab', completed: false },
    ],
  },
  {
    id: 4,
    number: 4,
    title: 'Workplace & Career Communication',
    subtitle: 'Professional emails, meeting phrasings & interviews',
    lessonsCount: 3,
    completedCount: 0,
    lessons: [
      { id: 401, number: 1, title: 'Writing Formal Emails', duration: '9 mins', type: 'grammar', completed: false, locked: true },
      { id: 402, number: 2, title: 'Participating in Meetings', duration: '10 mins', type: 'speaking', completed: false, locked: true },
      { id: 403, number: 3, title: 'Job Interview Essentials', duration: '12 mins', type: 'vocab', completed: false, locked: true },
    ],
  },
]

/** What comes after `lessonTitle` in the course: the next lesson to jump into,
 *  'chapter-complete' when it was the chapter's last lesson and the next chapter
 *  isn't unlocked yet, or null when the title isn't found in CHAPTERS_DATA at all
 *  (e.g. practice started from the Progress tab with no specific lesson context). */
function findNextLessonInfo(lessonTitle: string): NextLessonInfo | 'chapter-complete' | null {
  for (let ci = 0; ci < CHAPTERS_DATA.length; ci++) {
    const chapter = CHAPTERS_DATA[ci]
    const lessonIndex = chapter.lessons.findIndex((l) => l.title === lessonTitle)
    if (lessonIndex === -1) continue

    if (lessonIndex + 1 < chapter.lessons.length) {
      const next = chapter.lessons[lessonIndex + 1]
      if (next.locked) return 'chapter-complete'
      return { title: next.title, chapterTitle: chapter.title, isNewChapter: false }
    }

    const nextChapter = CHAPTERS_DATA[ci + 1]
    const firstOfNextChapter = nextChapter?.lessons[0]
    if (firstOfNextChapter && !firstOfNextChapter.locked) {
      return { title: firstOfNextChapter.title, chapterTitle: nextChapter.title, isNewChapter: true }
    }
    return 'chapter-complete'
  }
  return null
}

const ROADMAP = [
  { id: 1, label: 'Basics 1', sub: 'Mastered', state: 'done', offsetX: 0 },
  { id: 2, label: 'Greetings', sub: 'Mastered', state: 'done', offsetX: 50 },
  { id: 3, label: 'Travel Prep', sub: 'Current Lesson', state: 'current', offsetX: -40 },
  { id: 4, label: 'Dining Out', sub: 'Locked', state: 'locked', offsetX: 45 },
  { id: 5, label: 'Future Tense', sub: 'Locked', state: 'locked', offsetX: -30 },
]

const MISSIONS = [
  { icon: <BookIcon className="size-5 text-[#4F46E5]" />, label: 'Finish 2 Lessons', done: true, progress: 2, total: 2 },
  { icon: <MicIcon className="size-5 text-[#4F46E5]" />, label: 'Practice Speaking', done: false, progress: 0, total: 1 },
  { icon: <PencilIcon className="size-5 text-[#4F46E5]" />, label: 'Write a Paragraph', done: false, progress: 0, total: 1 },
]

function MenuIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="16" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

function CloseIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function ChevronDownIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function ZigZagRoadmap({ onSelectLesson }: { onSelectLesson: (label: string) => void }) {
  return (
    <div className="relative w-full flex flex-col items-center py-4 my-2">
      {/* Background Curved Path */}
      <svg className="absolute top-8 left-0 w-full h-[calc(100%-60px)] pointer-events-none z-0" viewBox="0 0 300 400" preserveAspectRatio="none">
        <path
          d="M 150,20 C 220,70 220,90 110,140 C 30,190 30,210 195,260 C 260,300 230,320 120,360"
          fill="none"
          stroke="#C7D2FE"
          strokeWidth="4"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />
      </svg>

      {ROADMAP.map((node) => {
        const isDone = node.state === 'done'
        const isCurrent = node.state === 'current'
        const isLocked = node.state === 'locked'

        return (
          <div
            key={node.id}
            className="relative z-10 flex flex-col items-center my-4 transition-transform duration-300"
            style={{ transform: `translateX(${node.offsetX}px)` }}
          >
            {/* "CURRENT STEP" Badge */}
            {isCurrent && (
              <div className="absolute -top-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md shadow-indigo-500/30 uppercase tracking-widest whitespace-nowrap animate-bounce">
                Current Step
              </div>
            )}

            {/* Node Circle */}
            <button
              type="button"
              onClick={() => !isLocked && onSelectLesson(node.label)}
              className={`relative flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isCurrent
                  ? 'size-17 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] ring-4 ring-indigo-200 shadow-xl shadow-indigo-500/30 rounded-3xl rotate-3'
                  : isDone
                  ? 'size-14 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/20 rounded-2xl'
                  : 'size-14 bg-white ring-2 ring-slate-200 rounded-2xl shadow-sm'
              }`}
            >
              {isDone && (
                <svg className="size-7 text-white" viewBox="0 0 22 22" fill="none">
                  <path d="M5 11l4 4 8-8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {isCurrent && (
                <svg className="size-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {isLocked && (
                <svg className="size-6 text-slate-400" viewBox="0 0 20 20" fill="none">
                  <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Label */}
            <div className="text-center mt-2">
              <p
                className={`text-xs m-0 leading-tight ${
                  isCurrent ? 'font-extrabold text-slate-900 text-sm' : isLocked ? 'text-slate-400 font-medium' : 'text-slate-800 font-bold'
                }`}
              >
                {node.label}
              </p>
              <p
                className={`text-[11px] font-semibold m-0 mt-0.5 ${
                  isDone ? 'text-emerald-600' : isCurrent ? 'text-[#4F46E5]' : 'text-slate-400'
                }`}
              >
                {node.sub}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HomePage({ onSelectLesson }: { onSelectLesson: (title: string) => void }) {
  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto pb-10">
      <div className="px-5 pt-5 flex flex-col gap-6">
        {/* Enhanced Welcome Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 rounded-3xl p-5.5 relative overflow-hidden text-white shadow-xl shadow-indigo-500/25 border border-indigo-400/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="font-extrabold text-xl m-0 leading-tight">Hello, Alex! 👋</p>
              <p className="text-indigo-100/90 text-xs mt-1 m-0 font-medium">Level 12 · General English (B1)</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm">
              <FlameIcon className="size-4 text-amber-300 fill-amber-300" />
              <span>7 Days</span>
            </div>
          </div>

          <div className="relative z-10 pt-1">
            <div className="flex justify-between text-xs mb-1.5 font-semibold">
              <span className="text-indigo-100">Overall Progress</span>
              <span className="font-extrabold text-white">75%</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
              <div className="w-[75%] h-full bg-gradient-to-r from-white to-indigo-100 rounded-full transition-all duration-500 shadow-sm" />
            </div>
          </div>
        </div>

        {/* Daily Missions */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-slate-900 font-extrabold text-base tracking-tight">Daily Missions</span>
            <span className="text-[#4F46E5] font-semibold text-xs bg-indigo-50 px-2.5 py-1 rounded-full">
              Reset in 4h
            </span>
          </div>

          {/* Vertical Mission Rows */}
          <div className="flex flex-col gap-2.5">
            {MISSIONS.map((m, i) => (
              <div
                key={i}
                className={`w-full bg-white ring-1 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 shadow-sm ${
                  m.done ? 'ring-emerald-200 bg-emerald-50/20' : 'ring-slate-200/80 hover:ring-indigo-200'
                }`}
              >
                {/* Icon Pill */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    m.done ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-[#4F46E5]'
                  }`}
                >
                  {m.icon}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className={`font-bold text-sm m-0 truncate ${m.done ? 'text-slate-700' : 'text-slate-900'}`}>
                      {m.label}
                    </p>
                    <span className={`text-xs font-extrabold ${m.done ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {m.progress}/{m.total}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        m.done ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                      }`}
                      style={{ width: `${(m.progress / m.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status Check Circle */}
                {m.done ? (
                  <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                    <CheckIcon className="size-3.5 text-white" />
                  </div>
                ) : (
                  <div className="size-6 rounded-full ring-1 ring-slate-300 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning Roadmap */}
        <div className="mt-2">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-slate-900 font-extrabold text-base tracking-tight">Learning Roadmap</span>
            <span className="text-slate-400 font-semibold text-xs">Chapter 1</span>
          </div>

          <ZigZagRoadmap onSelectLesson={onSelectLesson} />
        </div>
      </div>
    </div>
  )
}

// ── Learn Tab (Collapsible Chapters Page) ──────────────────────────────────
function LearnTab({ onSelectLesson }: { onSelectLesson: (lessonTitle: string) => void }) {
  const [openChapterId, setOpenChapterId] = useState<number | null>(3) // Default to Chapter 3 (active chapter)

  const toggleChapter = (id: number) => {
    setOpenChapterId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto px-5 pt-5 pb-16">
      {/* Current Course Hero Progress Card */}
      <div className="bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#818CF8] rounded-3xl p-5 mb-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <span className="text-indigo-100 text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full inline-block mb-2">
          Active Enrolled Course
        </span>
        <h2 className="font-extrabold text-xl m-0 leading-tight mb-1">General English (B1)</h2>
        <p className="text-indigo-100/90 text-xs m-0 mb-4">4 Chapters · 12 Total Lessons</p>

        <div className="flex justify-between text-xs mb-1.5 font-semibold">
          <span className="text-indigo-100 font-medium">Course Progress</span>
          <span className="font-extrabold text-white">58%</span>
        </div>
        <div className="h-2 bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
          <div className="w-[58%] h-full bg-white rounded-full transition-all duration-500 shadow-sm" />
        </div>
      </div>

      {/* Chapters Header */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-slate-900 font-extrabold text-base tracking-tight">Course Chapters</span>
        <span className="text-slate-400 text-xs font-medium">4 Chapters</span>
      </div>

      {/* Collapsible Chapters Accordion */}
      <div className="flex flex-col gap-3 mb-8">
        {CHAPTERS_DATA.map((ch) => {
          const isOpen = openChapterId === ch.id
          const isCompleted = ch.completedCount === ch.lessonsCount
          const isLocked = ch.completedCount === 0 && ch.id > 3

          return (
            <div
              key={ch.id}
              className={`bg-white ring-1 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm ${
                isOpen
                  ? 'ring-2 ring-[#4F46E5] shadow-md'
                  : 'ring-slate-200/80 hover:ring-indigo-200'
              }`}
            >
              {/* Accordion Header Button */}
              <button
                type="button"
                onClick={() => toggleChapter(ch.id)}
                className="w-full p-4 flex items-center gap-3.5 text-left border-none bg-transparent cursor-pointer"
              >
                {/* Chapter Number Badge */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : isOpen
                      ? 'bg-[#4F46E5] text-white shadow-sm'
                      : 'bg-indigo-50 text-[#4F46E5]'
                  }`}
                >
                  {isCompleted ? <CheckIcon className="size-5 text-white" /> : `Ch.${ch.number}`}
                </div>

                {/* Chapter Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-slate-900 text-base m-0 leading-tight truncate">
                      {ch.title}
                    </p>
                  </div>
                  <p className="text-slate-400 text-xs m-0 truncate font-medium">
                    {ch.completedCount}/{ch.lessonsCount} lessons completed
                  </p>
                </div>

                {/* Chevron */}
                <div
                  className={`size-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : ''
                  }`}
                >
                  <ChevronDownIcon className="size-4" />
                </div>
              </button>

              {/* Collapsible Lessons List */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1 px-1">
                    Lessons in this chapter
                  </p>

                  {ch.lessons.map((les) => (
                    <button
                      key={les.id}
                      type="button"
                      onClick={() => !les.locked && onSelectLesson(les.title)}
                      disabled={les.locked}
                      className={`w-full bg-white ring-1 rounded-xl p-3 flex items-center gap-3 text-left border-none transition-all duration-150 ${
                        les.locked
                          ? 'ring-slate-200/50 opacity-60 cursor-not-allowed'
                          : les.current
                          ? 'ring-2 ring-[#4F46E5] bg-indigo-50/30 cursor-pointer shadow-xs'
                          : 'ring-slate-200/80 hover:ring-indigo-300 cursor-pointer'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          les.completed
                            ? 'bg-emerald-100 text-emerald-600'
                            : les.current
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {les.completed ? (
                          <CheckIcon className="size-4 text-emerald-600" />
                        ) : les.type === 'speaking' ? (
                          <MicIcon className="size-4" />
                        ) : (
                          <BookIcon className="size-4" />
                        )}
                      </div>

                      {/* Lesson title & type */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400">
                            Lesson {les.number}
                          </span>
                          <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-full uppercase">
                            {les.type}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs m-0 truncate">
                          {les.title}
                        </p>
                      </div>

                      {/* Arrow / Lock */}
                      {les.locked ? (
                        <svg className="size-3.5 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="none">
                          <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg className="size-3.5 text-indigo-600 shrink-0" viewBox="0 0 16 16" fill="none">
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Next Locked Course Muted Card */}
      <div className="bg-slate-100/90 ring-1 ring-slate-200/80 rounded-3xl p-5 relative overflow-hidden opacity-80">
        <div className="flex items-center gap-2 mb-2">
          <svg className="size-4 text-slate-500" viewBox="0 0 20 20" fill="none">
            <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="text-slate-600 font-extrabold text-xs uppercase tracking-wider">
            Next Up · Locked Course
          </span>
        </div>
        <h3 className="font-bold text-slate-800 text-base m-0 mb-1">
          Business English (B2)
        </h3>
        <p className="text-slate-500 text-xs m-0 leading-relaxed">
          Unlocks automatically once you complete all chapters in General English (B1).
        </p>
      </div>
    </div>
  )
}

function ReviewTab() {
  const items = [
    { word: 'Appreciate', meaning: 'To feel grateful for something', due: 'Now', level: 1 },
    { word: 'Could you please...', meaning: 'Polite request phrasing', due: 'Now', level: 2 },
    { word: 'Sincerely', meaning: 'Formal email sign-off', due: 'In 2h', level: 3 },
    { word: 'Looking forward to', meaning: 'Anticipating with pleasure', due: 'Tomorrow', level: 4 },
  ]

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto px-5 pt-5 pb-16">
      <h1 className="text-[#0F172A] font-extrabold text-2xl tracking-tight mb-1">Review</h1>
      <p className="text-[#94A3B8] text-sm mb-5">Spaced-repetition flashcards due today.</p>

      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[
          { label: 'Due now', val: '12', color: 'text-red-500' },
          { label: 'Learned', val: '84', color: 'text-[#4F46E5]' },
          { label: 'Streak', val: '7', color: 'text-amber-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white ring-1 ring-slate-200/80 rounded-2xl p-3 text-center shadow-xs">
            <p className={`font-black text-xl m-0 ${s.color}`}>{s.val}</p>
            <p className="text-[#64748B] text-xs font-medium mt-0.5 m-0">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white ring-1 ring-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs"
          >
            <div>
              <p className="text-[#0F172A] font-bold text-base m-0">{item.word}</p>
              <p className="text-[#64748B] text-xs mt-0.5 m-0">{item.meaning}</p>
            </div>
            <span className={`font-semibold text-xs ${item.due === 'Now' ? 'text-red-500' : 'text-[#64748B]'}`}>
              {item.due}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <PrimaryButton>Start Review Session</PrimaryButton>
      </div>
    </div>
  )
}

function ProgressTab({
  onStartPractice,
  onAskAiTeacher,
}: {
  onStartPractice: () => void
  onAskAiTeacher: () => void
}) {
  const [subTab, setSubTab] = useState<'overview' | 'skills' | 'weaknesses' | 'review'>('overview')

  const stats = [
    { label: 'Day Streak', val: '7 Days', icon: <FlameIcon className="size-4.5 text-amber-500" /> },
    { label: 'Total XP', val: '1,420 XP', icon: <ZapIcon className="size-4.5 text-indigo-500" /> },
    { label: 'Lessons Done', val: '38 Completed', icon: <BookIcon className="size-4.5 text-emerald-500" /> },
    { label: 'Words Mastered', val: '210 Words', icon: <TrophyIcon className="size-4.5 text-purple-500" /> },
  ]

  const skillsData = [
    {
      name: 'Speaking & Pronunciation',
      score: 84,
      subStats: [
        { label: 'Accent & Phonetics', score: '86%' },
        { label: 'Intonation & Rhythm', score: '82%' },
        { label: 'Fluency & Pace', score: '84%' },
      ],
    },
    {
      name: 'Grammar & Syntax',
      score: 92,
      subStats: [
        { label: 'Present / Past Tenses', score: '95%' },
        { label: 'Modal Verbs & Questions', score: '90%' },
        { label: 'Prepositional Phrases', score: '64%' },
      ],
    },
    {
      name: 'Listening & Comprehension',
      score: 78,
      subStats: [
        { label: 'Native Speed Audio', score: '72%' },
        { label: 'Contextual Inference', score: '84%' },
        { label: 'Detail Retrieval', score: '78%' },
      ],
    },
    {
      name: 'Vocabulary & Phrasal Verbs',
      score: 88,
      subStats: [
        { label: 'Active Vocabulary', score: '90%' },
        { label: 'Passive Vocabulary', score: '86%' },
        { label: 'Idiomatic Expressions', score: '75%' },
      ],
    },
  ]

  const weaknesses = [
    {
      id: 1,
      title: 'Preposition Usage in Polite Requests',
      accuracy: '62% accuracy',
      tag: 'High Priority',
      tagStyle: 'bg-rose-50 text-rose-600',
      description: 'Confusing "for" and "to" in phrases like "ask for the bill".',
      actionLabel: 'Practice Weakness',
      actionType: 'practice',
    },
    {
      id: 2,
      title: 'Fast-Paced Native Conversation',
      accuracy: '70% accuracy',
      tag: 'Medium Priority',
      tagStyle: 'bg-amber-50 text-amber-600',
      description: 'Audio comprehension drops at speech speeds above 1.2x.',
      actionLabel: 'Ask AI Tutor',
      actionType: 'ai-chat',
    },
    {
      id: 3,
      title: 'Past Continuous vs. Past Simple',
      accuracy: '75% accuracy',
      tag: 'Low Priority',
      tagStyle: 'bg-indigo-50 text-indigo-600',
      description: 'Slight delay when picking correct tense during fast quizzes.',
      actionLabel: 'Practice Weakness',
      actionType: 'practice',
    },
  ]

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto px-5 pt-5 pb-16 bg-[#F8FAFC]">
      {/* Clean Header */}
      <div className="mb-4">
        <h1 className="text-[#0F172A] font-extrabold text-xl tracking-tight m-0">
          Progress & Analytics
        </h1>
        <p className="text-slate-400 text-xs mt-0.5 m-0 font-medium">
          Track your language proficiency and study stats
        </p>
      </div>

      {/* Segmented Sub-Tab Switcher */}
      <div className="bg-slate-200/50 p-1 rounded-xl flex gap-1 mb-5">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'skills', label: 'Skills' },
          { id: 'weaknesses', label: 'Weaknesses' },
          { id: 'review', label: 'Schedule' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id as any)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all border-none cursor-pointer ${
              subTab === tab.id
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-VIEW 1: OVERVIEW */}
      {subTab === 'overview' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="bg-white ring-1 ring-slate-200/70 rounded-xl p-3.5 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  {s.icon}
                  <span className="text-slate-500 text-xs font-medium">{s.label}</span>
                </div>
                <p className="text-slate-900 font-extrabold text-lg m-0">{s.val}</p>
              </div>
            ))}
          </div>

          <div className="bg-white ring-1 ring-slate-200/70 rounded-xl p-4 shadow-2xs">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-slate-900 font-bold text-xs m-0">Weekly Activity</p>
                <p className="text-slate-400 text-[11px] m-0">35 mins / day average</p>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                245 mins total
              </span>
            </div>

            <div className="flex justify-between items-end h-24 pt-2">
              {[
                { day: 'Mon', h: 45, val: '25m' },
                { day: 'Tue', h: 75, val: '40m' },
                { day: 'Wed', h: 55, val: '30m' },
                { day: 'Thu', h: 95, val: '50m' },
                { day: 'Fri', h: 65, val: '35m' },
                { day: 'Sat', h: 40, val: '20m' },
                { day: 'Sun', h: 85, val: '45m' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[9px] font-medium text-slate-400">{bar.val}</span>
                  <div className="w-4 bg-slate-100 rounded-full h-full flex items-end">
                    <div
                      className="w-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ height: `${bar.h}%` }}
                    />
                  </div>
                  <span className="text-slate-500 text-[10px] font-semibold">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: SKILLS MATRIX (Clean & Minimal) */}
      {subTab === 'skills' && (
        <div className="flex flex-col gap-3">
          {skillsData.map((sk, idx) => (
            <div key={idx} className="bg-white ring-1 ring-slate-200/70 rounded-xl p-4 shadow-2xs">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 text-xs">{sk.name}</span>
                <span className="font-extrabold text-indigo-600 text-xs">{sk.score}%</span>
              </div>

              {/* Thin Sleek Progress Bar */}
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${sk.score}%` }}
                />
              </div>

              {/* Minimal sub-stats list */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                {sk.subStats.map((sub, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">{sub.label}</span>
                    <span className="font-bold text-slate-700">{sub.score}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-VIEW 3: WEAKNESSES (Clean & Minimal) */}
      {subTab === 'weaknesses' && (
        <div className="flex flex-col gap-3">
          {weaknesses.map((w) => (
            <div key={w.id} className="bg-white ring-1 ring-slate-200/70 rounded-xl p-4 shadow-2xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${w.tagStyle}`}>
                  {w.tag} · {w.accuracy}
                </span>
              </div>

              <p className="font-bold text-slate-900 text-xs m-0">{w.title}</p>
              <p className="text-slate-500 text-[11px] m-0 leading-relaxed">{w.description}</p>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={w.actionType === 'practice' ? onStartPractice : onAskAiTeacher}
                  className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs border-none cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  {w.actionType === 'practice' ? <ZapIcon className="size-3.5" /> : <SparkleIcon className="size-3.5" />}
                  <span>{w.actionLabel}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-VIEW 4: REVIEW SCHEDULE (Clean & Minimal) */}
      {subTab === 'review' && (
        <div className="flex flex-col gap-3.5">
          {/* Sleek Minimal Summary Header */}
          <div className="bg-white ring-1 ring-slate-200/70 rounded-xl p-4 shadow-2xs flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <SparkleIcon className="size-3.5 text-indigo-600" />
                <span className="font-bold text-slate-900 text-xs">SuperMemo-2 Algorithm</span>
              </div>
              <p className="text-slate-400 text-[11px] m-0">Optimized spaced repetition active</p>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
              94% Recall
            </span>
          </div>

          {/* Clean Stat Metric Boxes */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Due Today', count: '12', color: 'text-rose-600' },
              { label: 'Due Tomorrow', count: '18', color: 'text-amber-600' },
              { label: 'In 3 Days', count: '24', color: 'text-indigo-600' },
            ].map((bucket, i) => (
              <div key={i} className="bg-white ring-1 ring-slate-200/70 rounded-xl p-3 text-center shadow-2xs">
                <p className={`font-black text-base m-0 ${bucket.color}`}>{bucket.count}</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5 m-0">{bucket.label}</p>
              </div>
            ))}
          </div>

          {/* Minimal Review Queue List */}
          <div className="bg-white ring-1 ring-slate-200/70 rounded-xl p-4 shadow-2xs">
            <p className="font-bold text-slate-900 text-xs mb-2.5">Review Queue</p>

            <div className="flex flex-col gap-2 mb-3">
              {[
                { word: 'Could I get a cup of coffee, please?', tag: 'Cafe Ordering' },
                { word: 'Could you bring us the bill, please?', tag: 'Dining Etiquette' },
                { word: 'What do you recommend for lunch today?', tag: 'Social Interactions' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50/70 rounded-lg p-2.5 border border-slate-100 flex justify-between items-center text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-slate-800 m-0 truncate">{item.word}</p>
                    <span className="text-[10px] text-slate-400">{item.tag}</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
                    Due Now
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onStartPractice}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs border-none cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ZapIcon className="size-3.5 text-white" />
              <span>Start Review Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileTab({
  onOpenSettings,
  onOpenAchievements,
}: {
  onOpenSettings?: () => void
  onOpenAchievements?: () => void
}) {
  const options = [
    { icon: <UserIcon className="size-5" />, label: 'Edit Profile & Settings', action: onOpenSettings },
    { icon: <TrophyIcon className="size-5" />, label: 'Achievements & Milestones', action: onOpenAchievements },
    { icon: <CreditCardIcon className="size-5" />, label: 'Subscription Plan' },
    { icon: <LogOutIcon className="size-5 text-red-500" />, label: 'Log Out', danger: true },
  ]

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto px-5 pt-5 pb-16">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="size-20 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#818CF8] flex items-center justify-center shadow-lg mb-3">
          <span className="text-white font-extrabold text-2xl">A</span>
        </div>
        <h2 className="text-[#0F172A] font-bold text-xl m-0">Alex Johnson</h2>
        <p className="text-[#64748B] text-xs mt-0.5 m-0">alex.johnson@example.com</p>
      </div>

      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={opt.action}
            className="w-full bg-white ring-1 ring-slate-200/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-[#CBD5E1] transition-colors border-none text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="text-[#4F46E5]">{opt.icon}</div>
              <span className={`font-semibold text-sm ${opt.danger ? 'text-red-500' : 'text-[#0F172A]'}`}>
                {opt.label}
              </span>
            </div>
            <svg className="size-4 text-[#94A3B8]" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

export function MainDashboardPage({ onLogout }: { onLogout?: () => void }) {
  const [viewState, setViewStateState] = useState<ViewState>({ type: 'tab', tab: 'home' })
  const [historyStack, setHistoryStack] = useState<ViewState[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const setViewState = (nextState: ViewState) => {
    setHistoryStack((prev) => [...prev, viewState])
    setViewStateState(nextState)
  }

  const handleBack = () => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1]
      setHistoryStack((prevStack) => prevStack.slice(0, prevStack.length - 1))
      setViewStateState(prev)
    } else {
      setViewStateState({ type: 'tab', tab: 'profile' })
    }
  }

  const activeTab = viewState.type === 'tab' ? viewState.tab : 'home'
  const isSubScreen = viewState.type !== 'tab'

  return (
    <div className={`flex-1 h-full min-h-0 flex flex-col relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC]'}`}>
      {/* Main Top App Bar (Only for Main Tabs) */}
      {!isSubScreen && (
        <div className={`sticky top-0 z-20 backdrop-blur-md flex items-center justify-between px-5 pt-8 pb-3 border-b shrink-0 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20">
              AIM
            </div>
            <span className={`font-extrabold text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AIM English</span>
          </div>

          {/* Profile Avatar Button */}
          <button
            type="button"
            onClick={() => setViewState({ type: 'tab', tab: 'profile' })}
            className="size-9 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-xs border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            A
          </button>
        </div>
      )}

      {/* Screen Routing */}
      {viewState.type === 'tab' && viewState.tab === 'home' && (
        <HomePage onSelectLesson={(title) => setViewState({ type: 'lesson-detail', lessonTitle: title })} />
      )}
      {viewState.type === 'tab' && viewState.tab === 'learn' && (
        <LearnTab onSelectLesson={(title) => setViewState({ type: 'lesson-detail', lessonTitle: title })} />
      )}
      {viewState.type === 'tab' && viewState.tab === 'review' && <ReviewTab />}
      {viewState.type === 'tab' && viewState.tab === 'progress' && (
        <ProgressTab
          onStartPractice={() => setViewState({ type: 'practice' })}
          onAskAiTeacher={() => setViewState({ type: 'ai-chat' })}
        />
      )}
      {viewState.type === 'tab' && viewState.tab === 'profile' && (
        <ProfileTab
          onOpenSettings={() => setViewState({ type: 'settings' })}
          onOpenAchievements={() => setViewState({ type: 'achievements' })}
        />
      )}

      {/* Sub-screens */}
      {viewState.type === 'lesson-detail' && (
        <LessonDetailPage
          lessonTitle={viewState.lessonTitle}
          isCompleted={completedLessons.has(viewState.lessonTitle)}
          onBack={handleBack}
          onStartLiveAiLesson={() => setViewState({ type: 'live-ai-lesson', lessonTitle: viewState.lessonTitle })}
          onStartPractice={() => setViewState({ type: 'practice', lessonTitle: viewState.lessonTitle })}
          onAskAiTeacher={() => setViewState({ type: 'ai-chat' })}
        />
      )}

      {viewState.type === 'live-ai-lesson' && (
        <LiveAiLessonChatPage
          lessonTitle={viewState.lessonTitle}
          onFinishLesson={() => {
            setCompletedLessons((prev) => new Set(prev).add(viewState.lessonTitle))
            handleBack()
          }}
          onBack={handleBack}
          nextLessonInfo={findNextLessonInfo(viewState.lessonTitle)}
          onGoToNextLesson={(nextTitle) => {
            setCompletedLessons((prev) => new Set(prev).add(viewState.lessonTitle))
            setViewState({ type: 'lesson-detail', lessonTitle: nextTitle })
          }}
        />
      )}

      {viewState.type === 'practice' && (
        <PracticeSessionPage
          onDone={handleBack}
          onBack={handleBack}
          nextLessonInfo={viewState.lessonTitle ? findNextLessonInfo(viewState.lessonTitle) : null}
          onGoToNextLesson={
            viewState.lessonTitle
              ? (nextTitle) => setViewState({ type: 'lesson-detail', lessonTitle: nextTitle })
              : undefined
          }
        />
      )}

      {viewState.type === 'ai-chat' && (
        <AiTeacherChatPage
          onBack={handleBack}
        />
      )}

      {viewState.type === 'achievements' && (
        <AchievementsPage
          onBack={handleBack}
        />
      )}

      {viewState.type === 'settings' && (
        <AccountSettingsPage
          onBack={handleBack}
          isDarkMode={isDarkMode}
          onToggleDarkMode={(val) => setIsDarkMode(val)}
          onLogout={onLogout}
        />
      )}

      {/* Floating Action Button (FAB) for Drawer Menu — Bottom Right */}
      {!isSubScreen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="fixed sm:absolute bottom-6 right-6 z-40 size-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/35 flex items-center justify-center border-none cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200"
          title="Open Navigation Menu"
        >
          <MenuIcon className="size-6 text-white" />
        </button>
      )}

      {/* Navigation Drawer */}
      {drawerOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className={`relative w-4/5 max-w-[300px] h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-in slide-in-from-left duration-250 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-2xl bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent tracking-tight">
                  AIM
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className={`size-8 rounded-full flex items-center justify-center border-none cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                >
                  <CloseIcon className="size-4" />
                </button>
              </div>

              <div className={`rounded-2xl p-3.5 mb-6 border flex items-center gap-3 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100'}`}>
                <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm m-0 truncate">Alex Johnson</p>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5 shadow-2xs">
                    AIM Plus Member
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {[
                  { icon: <HomeIcon className="size-5" />, label: 'Home Feed', action: () => { setViewState({ type: 'tab', tab: 'home' }); setDrawerOpen(false); } },
                  { icon: <BookIcon className="size-5" />, label: 'Chapters & Course', action: () => { setViewState({ type: 'tab', tab: 'learn' }); setDrawerOpen(false); } },
                  { icon: <ChartIcon className="size-5" />, label: 'Analytics & Progress', action: () => { setViewState({ type: 'tab', tab: 'progress' }); setDrawerOpen(false); } },
                  { icon: <TrophyIcon className="size-5" />, label: 'Achievements', action: () => { setViewState({ type: 'achievements' }); setDrawerOpen(false); } },
                  { icon: <UserIcon className="size-5" />, label: 'Account Settings', action: () => { setViewState({ type: 'settings' }); setDrawerOpen(false); } },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.action}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-colors border-none cursor-pointer text-left ${
                      isDarkMode
                        ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800'
                        : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70'
                    }`}
                  >
                    <div className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>{item.icon}</div>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`pt-4 border-t flex flex-col items-center gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-xs font-bold text-red-500 hover:underline bg-transparent border-none cursor-pointer"
                >
                  Log Out
                </button>
              )}
              <p className={`text-xs text-center m-0 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                AIM Mind Coach v2.4.0
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainDashboardPage
