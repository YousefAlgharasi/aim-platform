import React from "react"

export function ProgressDots({
  total,
  current,
}: {
  total: number
  current: number
}) {
  return (
    <div className="flex gap-2 px-6 mt-5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
            i === current ? "bg-[#4F46E5]" : "bg-[rgba(79,70,229,0.2)]"
          }`}
        />
      ))}
    </div>
  )
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  return (
    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#4F46E5] rounded-full transition-all duration-400 ease-out"
        style={{ width: `${(value / total) * 100}%` }}
      />
    </div>
  )
}
