import React, { useState, useEffect } from "react"
import { ProgressBar } from "../components/ProgressDots"

type QuestionType = "mcq" | "reading" | "speaking" | "listening" | "writing"
interface Question {
  type: QuestionType
  category: string
  number: number
  total: number
  prompt: string
  passage?: string
  options?: string[]
  correctIndex?: number
  writingTarget?: string
}

const QUESTIONS: Question[] = [
  {
    type: "mcq",
    category: "CONDITIONALS",
    number: 4,
    total: 20,
    prompt: "Choose the correct option to complete the sentence:",
    passage: '"If I ___ time, I would have finished the project on schedule."',
    options: ["have", "had had", "had", "has"],
    correctIndex: 1,
  },
  {
    type: "reading",
    category: "READING",
    number: 5,
    total: 20,
    prompt:
      "What is identified as the primary catalyst for reducing student attrition rates?",
    passage:
      "Artificial intelligence is rapidly reshaping personalized learning systems. By analyzing micro-behaviors and mistake patterns in real-time, modern algorithms can predict student disengagement before it occurs.",
    options: [
      "Providing human tutor oversight",
      "Providing automated certificates",
      "Altering course trajectories dynamically based on user data",
      "Lowering subscription costs for premium learning paths",
    ],
    correctIndex: 2,
  },
  {
    type: "speaking",
    category: "SPEAKING",
    number: 6,
    total: 20,
    prompt: "Describe your typical morning routine in one minute.",
  },
  {
    type: "listening",
    category: "LISTENING",
    number: 8,
    total: 20,
    prompt: "What is the speaker's main goal?",
    options: [
      "To request a professional meeting",
      "To cancel a previous dinner reservation",
      "To inquire about available travel options",
      "To provide feedback on a recent service",
    ],
    correctIndex: 1,
  },
  {
    type: "writing",
    category: "WRITING",
    number: 6,
    total: 20,
    prompt: "Introduce yourself",
    passage:
      "Write a short paragraph (3-5 sentences) introducing yourself to a new friend. Include your name, where you are from, and one hobby.",
    writingTarget: "3-5 sentences",
  },
]

function QuestionTimer({ seconds }: { seconds: number }) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")
  return (
    <div className="flex items-center gap-1.5 bg-[rgba(79,70,229,0.08)] rounded-full px-3 py-1">
      <svg className="size-3.5 text-[#4F46E5]" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M7 4.5v3l1.5 1.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[#4F46E5] font-semibold text-xs font-mono">
        {mm}:{ss}
      </span>
    </div>
  )
}

interface AssessmentQuestionPageProps {
  onFinish: () => void
}

export function AssessmentQuestionPage({
  onFinish,
}: AssessmentQuestionPageProps) {
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [writingText, setWritingText] = useState("")
  const [recording, setRecording] = useState(false)
  const [recordSecs, setRecordSecs] = useState(0)
  const [timer, setTimer] = useState(24 * 60 + 14)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioSecs, setAudioSecs] = useState(0)
  const AUDIO_TOTAL = 42 // seconds

  const q = QUESTIONS[qIndex]
  const progressVal = qIndex + 1

  useEffect(() => {
    const t = setInterval(() => setTimer((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let t: ReturnType<typeof setInterval>
    if (recording) {
      t = setInterval(() => setRecordSecs((s) => s + 1), 1000)
    }
    return () => clearInterval(t)
  }, [recording])

  useEffect(() => {
    let t: ReturnType<typeof setInterval>
    if (audioPlaying) {
      t = setInterval(() => {
        setAudioSecs((s) => {
          if (s >= AUDIO_TOTAL) { setAudioPlaying(false); return s }
          return s + 1
        })
      }, 1000)
    }
    return () => clearInterval(t)
  }, [audioPlaying])

  const handleSubmit = () => {
    setSelected(null)
    setWritingText("")
    setRecording(false)
    setRecordSecs(0)
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
    else onFinish()
  }

  // Reset audio when question changes
  useEffect(() => {
    setAudioPlaying(false)
    setAudioSecs(0)
  }, [qIndex])

  const handleSkip = () => {
    setSelected(null)
    setWritingText("")
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
    else onFinish()
  }

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Header */}
      <div className="p-5 pb-3 flex flex-col gap-2.5">
        <div className="flex justify-end">
          <QuestionTimer seconds={timer} />
        </div>
        <ProgressBar value={progressVal} total={QUESTIONS.length} />
      </div>

      {/* Main question card & options */}
      <div className="flex-1 px-5 flex flex-col gap-3.5 overflow-y-auto pb-2">
        <div className={`${q.type === 'speaking' ? 'flex-1' : ''} flex flex-col bg-white border-1.5 border-[#E2E8F0] rounded-2xl p-4 sm:p-5`}>
          <p className="text-[#4F46E5] font-semibold text-[11px] tracking-wider uppercase mb-2.5">
            {q.category} · QUESTION {q.number}/{q.total}
          </p>
          <p className="text-[#0F172A] font-medium text-base leading-snug m-0">
            {q.prompt}
          </p>
          {q.passage && (
            <div className="mt-3.5 bg-[#F1F5F9] border-l-3 border-[#4F46E5] rounded-r-lg p-3">
              <p
                className={`text-sm leading-relaxed m-0 ${
                  q.type === "reading"
                    ? "text-[#64748B] italic"
                    : "text-[#0F172A] font-normal"
                }`}
              >
                {q.passage}
              </p>
            </div>
          )}

          {/* Speaking UI — vertically centred inside the stretched card */}
          {q.type === "speaking" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
              {/* Mic button with pulse rings */}
              <div className="relative">
                {recording && (
                  <>
                    <div className="absolute -inset-5 rounded-full bg-[#4F46E5]/10 animate-ping" />
                    <div className="absolute -inset-3 rounded-full bg-[#4F46E5]/15" />
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setRecording(!recording)}
                  className={`size-28 rounded-full border-none cursor-pointer flex items-center justify-center shadow-xl relative transition-all duration-200 active:scale-95 ${
                    recording
                      ? "bg-red-500 hover:bg-red-600 shadow-red-200"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] shadow-indigo-200"
                  }`}
                >
                  {recording ? (
                    /* Stop icon */
                    <svg className="size-9 text-white" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    /* Mic icon */
                    <svg className="size-9 text-white" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                      <path d="M19 11a7 7 0 0 1-14 0M12 18v4M8 22h8"
                        stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Status text */}
              <div className="text-center">
                <p className={`text-sm font-medium m-0 ${
                  recording ? "text-red-500" : "text-[#64748B]"
                }`}>
                  {recording ? "Recording… tap to stop" : "Tap to start recording"}
                </p>
                {recording && (
                  <p className="text-[#4F46E5] font-semibold text-xs mt-1.5 m-0 font-mono tracking-widest">
                    {String(Math.floor(recordSecs / 60)).padStart(2, "0")}:{String(recordSecs % 60).padStart(2, "0")} / 01:00
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Listening UI — compact auto-play bar */}
          {q.type === "listening" && (
            <div className="mt-4 flex items-center gap-3 bg-[#EEF2FF] rounded-2xl px-4 py-3">
              {/* Tap-to-play icon button */}
              <button
                type="button"
                onClick={() => setAudioPlaying(p => !p)}
                className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center shrink-0 shadow-sm border-none cursor-pointer hover:bg-[#4338CA] active:scale-95 transition-all"
              >
                {audioPlaying ? (
                  /* Speaker waves — playing */
                  <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  </svg>
                ) : audioSecs >= AUDIO_TOTAL ? (
                  /* Replay icon — finished */
                  <svg className="size-5 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M1 4v6h6M23 20v-6h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  /* Play arrow — idle */
                  <svg className="size-5 text-white" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Progress + time */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="relative h-2 bg-[#C7D2FE] rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#4F46E5] rounded-full transition-all duration-1000"
                    style={{ width: `${(audioSecs / AUDIO_TOTAL) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-mono font-semibold text-[#4F46E5]">
                    {String(Math.floor(audioSecs / 60)).padStart(2,'0')}:{String(audioSecs % 60).padStart(2,'0')}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    {String(Math.floor(AUDIO_TOTAL / 60)).padStart(2,'0')}:{String(AUDIO_TOTAL % 60).padStart(2,'0')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Options */}
        {(q.type === "mcq" || q.type === "reading" || q.type === "listening") &&
          q.options && (
            <div className="flex flex-col gap-2.5">
              {q.options.map((opt, i) => {
                const active = selected === i
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelected(i)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border-1.5 transition-all duration-150 cursor-pointer text-left ${
                      active
                        ? "border-[#4F46E5] bg-[rgba(79,70,229,0.08)]"
                        : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        active
                          ? "text-[#4F46E5] font-semibold"
                          : "text-[#0F172A] font-normal"
                      }`}
                    >
                      {opt}
                    </span>
                    <div
                      className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        active
                          ? "border-[#4F46E5] bg-[#4F46E5]"
                          : "border-[#CBD5E1] bg-transparent"
                      }`}
                    >
                      {active && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

        {/* Writing input */}
        {q.type === "writing" && (
          <div>
            <label className="text-[#0F172A] font-semibold text-sm mb-2 block">
              Your Response
            </label>
            <textarea
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              placeholder="Type your response here..."
              rows={6}
              className="w-full bg-[#F1F5F9] border-1.5 border-[#E2E8F0] focus:border-[#4F46E5] rounded-xl p-3.5 text-sm text-[#0F172A] outline-none resize-none leading-relaxed font-sans"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[#64748B] text-xs">
                Target: {q.writingTarget}
              </span>
              <span className="text-[#64748B] text-xs">
                {writingText.length} characters
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="p-5 pb-9 flex gap-3">
        <button
          type="button"
          onClick={handleSkip}
          className="flex-1 h-12 rounded-xl bg-[#F1F5F9] border-none text-[#0F172A] font-semibold text-sm cursor-pointer hover:bg-[#E2E8F0]"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            q.type !== "speaking" && q.type !== "writing" && selected === null
          }
          className={`flex-[2] h-12 rounded-xl bg-[#4F46E5] border-none text-white font-semibold text-sm shadow-md transition-opacity ${
            q.type !== "speaking" && q.type !== "writing" && selected === null
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:bg-[#4338CA]"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default AssessmentQuestionPage
