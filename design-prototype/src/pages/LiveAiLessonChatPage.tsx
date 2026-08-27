import { useState, useEffect } from 'react'
import { SparkleIcon, CheckIcon, TrophyIcon, MicIcon } from '../components/Icons'
import { TextButton } from '../components/Button'

interface VoiceMessage {
  id: number
  sender: 'ai' | 'user'
  text: string
  audioTime?: string
}

export interface NextLessonInfo {
  title: string
  chapterTitle: string
  isNewChapter: boolean
}

interface LiveAiLessonChatPageProps {
  lessonTitle?: string
  onFinishLesson: () => void
  onBack: () => void
  /** What comes after this lesson: the next lesson to jump into, 'chapter-complete' when
   *  this was the chapter's last lesson and nothing further is unlocked yet, or omitted
   *  when the caller has no course-progression data for this lesson. */
  nextLessonInfo?: NextLessonInfo | 'chapter-complete' | null
  onGoToNextLesson?: (nextLessonTitle: string) => void
}

export function LiveAiLessonChatPage({
  lessonTitle = 'Ordering Food & Drinks at a Cafe',
  onFinishLesson,
  onBack,
  nextLessonInfo,
  onGoToNextLesson,
}: LiveAiLessonChatPageProps) {
  const [step, setStep] = useState(1) // Step 1 to 3
  const [state, setState] = useState<'ai-speaking' | 'listening' | 'evaluating'>('ai-speaking')
  const [completed, setCompleted] = useState(false)
  const [secs, setSecs] = useState(0)
  const [replyMode, setReplyMode] = useState<'voice' | 'text'>('voice')
  const [textInput, setTextInput] = useState('')

  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: `Hello Alex! Welcome to your live lesson on "${lessonTitle}". ☕\n\nListen carefully: "Could I get a cup of coffee, please?"`,
      audioTime: '00:06',
    },
  ])

  // Timer for recording
  useEffect(() => {
    let t: ReturnType<typeof setInterval>
    if (state === 'listening') {
      t = setInterval(() => setSecs((s) => s + 1), 1000)
    }
    return () => clearInterval(t)
  }, [state])

  const submitUserResponse = (userText: string, audioTime?: string) => {
    setState('evaluating')

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: userText, audioTime },
    ])

    setTimeout(() => {
      if (step < 3) {
        setStep((s) => s + 1)
        setState('ai-speaking')
        setSecs(0)
        const nextPrompt =
          step === 1
            ? 'Excellent! Now try asking for the check: "Could you bring us the bill, please?"'
            : 'Spot on! Now ask for recommendations: "What do you recommend for lunch today?"'

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'ai',
              text: nextPrompt,
              audioTime: '00:05',
            },
          ])
        }, 300)
      } else {
        setCompleted(true)
      }
    }, 1500)
  }

  const handleMicTap = () => {
    if (state === 'listening') {
      // User finishes speaking
      const userText =
        step === 1
          ? 'Could I get a cup of coffee, please?'
          : step === 2
          ? 'Could you bring us the bill, please?'
          : 'What do you recommend for lunch today?'

      submitUserResponse(userText, `00:${String(secs).padStart(2, '0')}`)
    } else if (state === 'ai-speaking') {
      // Allow skipping AI speech directly to listening
      setState('listening')
      setSecs(0)
    }
  }

  const handleTextSend = () => {
    if (!textInput.trim() || state !== 'ai-speaking') return
    submitUserResponse(textInput.trim())
    setTextInput('')
  }

  if (completed) {
    return (
      <div className="flex-1 h-full min-h-0 flex flex-col justify-between p-6 sm:p-7 pt-12 text-center bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
        <div className="my-auto flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full opacity-25 blur-lg animate-pulse" />
            <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 relative transform rotate-3">
              <TrophyIcon className="size-11 text-white" />
            </div>
          </div>

          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full mb-2">
            Live Lesson Completed!
          </span>
          <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight m-0">Lesson Mastered!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 mb-6 max-w-[260px] leading-relaxed">
            You completed the live AI lesson for "{lessonTitle}".
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
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg flex items-center gap-1">
                <CheckIcon className="size-4" /> 98% Score
              </span>
            </div>
          </div>
        </div>

        <div className="pb-4 flex flex-col gap-2.5">
          {nextLessonInfo === 'chapter-complete' && (
            <div className="w-full py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-200 dark:ring-amber-900 text-amber-700 dark:text-amber-300 font-bold text-sm text-center">
              🎉 Chapter Complete! Next chapter unlocks soon.
            </div>
          )}

          {nextLessonInfo && nextLessonInfo !== 'chapter-complete' && onGoToNextLesson ? (
            <>
              <button
                type="button"
                onClick={() => onGoToNextLesson(nextLessonInfo.title)}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-base border-none cursor-pointer shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-98 transition-all"
              >
                {nextLessonInfo.isNewChapter
                  ? `Start Next Chapter: ${nextLessonInfo.chapterTitle}`
                  : `Next Lesson: ${nextLessonInfo.title}`}
              </button>
              <TextButton onClick={onFinishLesson} className="h-auto py-0 text-sm dark:text-slate-400 dark:hover:text-white">
                Back to Lesson
              </TextButton>
            </>
          ) : (
            <button
              type="button"
              onClick={onFinishLesson}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-base border-none cursor-pointer shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-98 transition-all"
            >
              Return to Lesson Detail
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col justify-between bg-gradient-to-b from-indigo-50/50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header & Step Indicator */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col gap-2 px-5 pt-8 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 flex items-center justify-center border-none cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <SparkleIcon className="size-4 text-white" />
            </div>
            <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Live AI Lesson
            </span>
          </div>

          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">Step {step}/3</span>
        </div>

        {/* Step Progress Line */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Voice Transcript Feed */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-indigo-500/15'
                  : 'bg-white dark:bg-slate-800 ring-1 ring-slate-200/80 dark:ring-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>

            {m.audioTime && (
              <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 mt-1 px-1 flex items-center gap-1">
                🔊 Audio {m.audioTime}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Center Live Voice Controls */}
      <div className="p-6 pb-9 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
        {/* Equalizer Waveform */}
        <div className="flex items-end gap-1.5 h-9 mb-4">
          {[6, 12, 20, 30, 22, 34, 25, 14, 28, 16, 10, 6].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-200 ${
                state === 'ai-speaking'
                  ? 'bg-indigo-600 dark:bg-indigo-400 animate-pulse'
                  : state === 'listening'
                  ? 'bg-rose-500 animate-bounce'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
              style={{ height: `${state !== 'evaluating' ? h : 6}px` }}
            />
          ))}
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          {state === 'ai-speaking' && (
            <span className="text-indigo-600 dark:text-indigo-300 font-extrabold text-xs bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              🔊 AI Tutor Speaking...
            </span>
          )}
          {state === 'listening' && (
            <span className="text-rose-600 dark:text-rose-300 font-extrabold text-xs bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
              🎙️ Listening to your voice (00:{String(secs).padStart(2, '0')})
            </span>
          )}
          {state === 'evaluating' && (
            <span className="text-indigo-600 dark:text-indigo-300 font-extrabold text-xs bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full flex items-center gap-1.5">
              ✦ AI Evaluating...
            </span>
          )}
        </div>

        {/* Voice / Text reply toggle — one button, click flips to the other mode.
            Label always names the mode you're switching TO (not the current one),
            since the mic button / text field below already shows what's active. */}
        <button
          type="button"
          onClick={() => setReplyMode((m) => (m === 'voice' ? 'text' : 'voice'))}
          disabled={state !== 'ai-speaking'}
          className="mb-5 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border-none cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-1.5"
        >
          {replyMode === 'voice' ? '⌨️ typing' : '🎙️ speaking'}
        </button>

        {replyMode === 'voice' ? (
          <>
            {/* Central Pulse Mic Button */}
            <div className="relative">
              {state === 'listening' && (
                <>
                  <div className="absolute -inset-5 rounded-full bg-rose-500/10 animate-ping" />
                  <div className="absolute -inset-2.5 rounded-full bg-rose-500/20" />
                </>
              )}
              <button
                type="button"
                onClick={handleMicTap}
                disabled={state === 'evaluating'}
                className={`size-22 rounded-full border-none cursor-pointer flex items-center justify-center shadow-xl relative transition-all duration-200 active:scale-95 ${
                  state === 'listening'
                    ? 'bg-rose-500 text-white shadow-rose-200'
                    : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
                }`}
              >
                <MicIcon className="size-9 text-white" />
              </button>
            </div>

            <p className="text-slate-400 dark:text-slate-500 text-xs mt-3 mb-0 font-medium">
              {state === 'listening' ? 'Tap mic when finished speaking' : 'Tap mic to interrupt or speak'}
            </p>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleTextSend()
            }}
            className="w-full flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 pl-4 border border-slate-200/60 dark:border-slate-700"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={state !== 'ai-speaking'}
              placeholder="Type your answer..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || state !== 'ai-speaking'}
              className="size-10 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center border-none cursor-pointer transition-opacity disabled:opacity-40 shrink-0"
            >
              <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LiveAiLessonChatPage
