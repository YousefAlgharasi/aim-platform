import React, { useState } from "react"
import { ProgressDots } from "../components/ProgressDots"
import { PrimaryButton } from "../components/Button"
import { CheckIcon } from "../components/Icons"

type StartOption = "zero" | "test"

interface OnboardStartPageProps {
  onContinue: (mode: StartOption) => void
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function FlagIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 3h12l-3 4.5L16 12H4"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="4" y1="3" x2="4" y2="21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function TargetIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9"   fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2"   fill="currentColor" fillOpacity="0.65" stroke="currentColor" strokeWidth="1.3" />
      <line x1="12" y1="3"  x2="12" y2="6.5"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="17.5" x2="12" y2="21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="3"  y1="12" x2="6.5" y2="12"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="17.5" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

// ── Row Choice Card ───────────────────────────────────────────────────────────

interface RowChoiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  recommended?: boolean
  selected: boolean
  onClick: () => void
}

function RowChoiceCard({
  icon,
  title,
  description,
  recommended,
  selected,
  onClick,
}: RowChoiceCardProps) {
  return (
    /* Outer wrapper — provides top space for the legend badge to float into */
    <div className={`relative w-full ${recommended ? "mt-4" : ""}`}>

      {/* ── "Recommended" legend badge ────────────────────────────────────── */}
      {recommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-0.5 rounded-full bg-indigo-600 shadow-[0_2px_8px_rgba(79,70,229,0.45)]">
          {/* Star spark */}
          <svg className="size-3 text-indigo-200" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1l1.2 3.6H11L8.1 6.7l1.1 3.5L6 8.3l-3.2 1.9 1.1-3.5L1 4.6h3.8z" />
          </svg>
          <span className="text-[10px] font-bold tracking-widest text-white uppercase">
            Recommended
          </span>
        </div>
      )}

      {/* ── Card button ───────────────────────────────────────────────────── */}
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 cursor-pointer text-left
          ${selected
            ? "bg-[rgba(79,70,229,0.07)] ring-2 ring-[#4F46E5] shadow-[0_4px_20px_rgba(79,70,229,0.15)]"
            : recommended
              ? "bg-white ring-2 ring-[#4F46E5]/40 hover:ring-[#4F46E5]/70 hover:shadow-md"
              : "bg-white ring-1 ring-[#E2E8F0] hover:ring-[#C7D2FE] hover:shadow-sm"
          }`}
      >
        {/* Icon pill */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200
            ${selected
              ? "bg-indigo-100 text-[#4F46E5]"
              : recommended
                ? "bg-indigo-50 text-[#4F46E5]"
                : "bg-slate-100 text-slate-500"
            }`}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-[15px] m-0 leading-snug ${selected ? "text-[#4F46E5]" : "text-[#0F172A]"}`}>
            {title}
          </p>
          <p className={`text-xs m-0 mt-0.5 leading-relaxed ${selected ? "text-indigo-400" : "text-[#94A3B8]"}`}>
            {description}
          </p>
        </div>

        {/* Check badge */}
        {selected ? (
          <div className="w-6 h-6 rounded-full bg-[#4F46E5] flex items-center justify-center shrink-0 shadow-md">
            <CheckIcon className="size-3 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full ring-1 ring-[#CBD5E1] shrink-0" />
        )}
      </button>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function OnboardStartPage({ onContinue }: OnboardStartPageProps) {
  const [selected, setSelected] = useState<StartOption>("test")

  return (
    <div className="flex-1 flex flex-col justify-between">
      <ProgressDots total={4} current={3} />

      <div className="px-6 pt-7">
        <span className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider block mb-1">
          Step 4 of 4
        </span>
        <h1 className="text-[#0F172A] font-bold text-3xl tracking-tight leading-tight mb-2">
          How would you<br />like to start?
        </h1>
        <p className="text-[#94A3B8] text-sm leading-relaxed">
          Choose carefully — the placement test can only be taken once to accurately calibrate your AI tutor.
        </p>
      </div>

      {/* Cards */}
      <div className="px-6 pt-5 flex flex-col gap-2 flex-1 items-start">
        <RowChoiceCard
          icon={<FlagIcon className="size-6" />}
          title="Start from Zero"
          description="Skip the test and begin from the absolute basics."
          selected={selected === "zero"}
          onClick={() => setSelected("zero")}
        />
        <RowChoiceCard
          icon={<TargetIcon className="size-6" />}
          title="Test My Knowledge"
          description="Let the AI find your exact level with a quick assessment."
          recommended
          selected={selected === "test"}
          onClick={() => setSelected("test")}
        />
      </div>

      <div className="p-6 pb-10">
        <PrimaryButton onClick={() => onContinue(selected)}>
          Continue
        </PrimaryButton>
      </div>
    </div>
  )
}

export default OnboardStartPage
