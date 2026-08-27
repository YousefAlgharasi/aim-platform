import React, { useState, useEffect } from 'react'
import { MicIcon, SparkleIcon, CheckIcon } from '../components/Icons'

interface VoiceTeacherPageProps {
  targetPhrase?: string
  onBack: () => void
}

export function VoiceTeacherPage({
  targetPhrase = 'Could I get a cup of coffee with milk, please?',
  onBack,
}: VoiceTeacherPageProps) {
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    let t: ReturnType<typeof setInterval>
    if (recording) {
      t = setInterval(() => setSecs((s) => s + 1), 1000)
    }
    return () => clearInterval(t)
  }, [recording])

  const toggleRecording = () => {
    if (recording) {
      setRecording(false)
      setRecorded(true)
    } else {
      setRecording(true)
      setRecorded(false)
      setSecs(0)
    }
  }

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col justify-between bg-gradient-to-b from-indigo-50/50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
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

        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 tracking-tight">
          Voice Practice
        </span>

        <div className="size-10" />
      </div>

      {/* Target Phrase Hero */}
      <div className="px-6 pt-6 text-center">
        <span className="text-[#4F46E5] dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
          Speak this phrase
        </span>
        <h2 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight leading-snug mt-3 mb-2">
          "{targetPhrase}"
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Focus on polite intonation and clear pronunciation.
        </p>
      </div>

      {/* Mic Animation Section */}
      <div className="my-auto flex flex-col items-center justify-center py-6">
        {/* Waveform Bar Equalizer */}
        <div className="flex items-end gap-1.5 h-10 mb-6">
          {[4, 8, 14, 22, 16, 28, 18, 12, 24, 15, 8, 5].map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-200 ${
                recording ? 'bg-indigo-600 dark:bg-indigo-400 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'
              }`}
              style={{ height: `${recording ? h * 1.5 : 8}px` }}
            />
          ))}
        </div>

        {/* Mic Pulse Button */}
        <div className="relative">
          {recording && (
            <>
              <div className="absolute -inset-6 rounded-full bg-indigo-600/10 animate-ping" />
              <div className="absolute -inset-3 rounded-full bg-indigo-600/20" />
            </>
          )}
          <button
            type="button"
            onClick={toggleRecording}
            className={`size-28 rounded-full border-none cursor-pointer flex items-center justify-center shadow-xl relative transition-all duration-200 active:scale-95 ${
              recording
                ? 'bg-rose-500 text-white shadow-rose-200'
                : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
            }`}
          >
            <MicIcon className="size-10 text-white" />
          </button>
        </div>

        <p className={`text-sm font-bold mt-5 mb-0 ${recording ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
          {recording ? 'Listening... Tap to stop' : 'Tap mic & speak out loud'}
        </p>

        {recording && (
          <span className="text-[#4F46E5] dark:text-indigo-400 font-mono text-xs font-bold mt-1 tracking-widest">
            00:{String(secs).padStart(2, '0')} / 00:15
          </span>
        )}
      </div>

      {/* AI Score Feedback Box */}
      {recorded && (
        <div className="mx-6 mb-8 bg-white dark:bg-slate-800 ring-1 ring-emerald-200 dark:ring-emerald-900 rounded-2xl p-4 flex items-center gap-4 shadow-md shadow-emerald-500/10 animate-in fade-in slide-in-from-bottom-2">
          <div className="size-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-black text-lg">
            96%
          </div>
          <div>
            <p className="font-extrabold text-slate-900 dark:text-white text-sm m-0">Excellent Pronunciation!</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 m-0">
              Clear intonation and accent accuracy detected by AI tutor.
            </p>
          </div>
        </div>
      )}

      <div className="p-6 pb-9 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-xs m-0">
          Powered by AIM Speech Recognition Engine
        </p>
      </div>
    </div>
  )
}

export default VoiceTeacherPage
