import React from 'react'

interface IconProps {
  className?: string
  color?: string
}

export function EyeIcon({ off = false, className = 'size-5' }: { off?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      {off ? (
        <>
          <path
            d="M3 3l14 14M8.5 8.6A3 3 0 0 0 10 13a3 3 0 0 0 3-3 3 3 0 0 0-.6-1.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6.2 6.4C4.5 7.5 3.2 8.9 2.5 10c1.3 2.7 4.1 5 7.5 5 1.3 0 2.6-.4 3.7-1M10 5c3.4 0 6.2 2.3 7.5 5a9.4 9.4 0 0 1-2 2.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M2.5 10C3.8 7.3 6.6 5 10 5s6.2 2.3 7.5 5c-1.3 2.7-4.1 5-7.5 5s-6.2-2.3-7.5-5z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
        </>
      )}
    </svg>
  )
}

export function GoogleIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="none">
      <path
        d="M17.1 9.2c0-.5-.04-1-.13-1.46H9v2.76h4.57a3.9 3.9 0 0 1-1.7 2.57v2.13h2.75c1.61-1.48 2.54-3.67 2.54-6z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.3 0 4.24-.76 5.65-2.06l-2.75-2.13c-.76.51-1.74.82-2.9.82-2.23 0-4.12-1.5-4.8-3.53H1.37v2.2A8.5 8.5 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M4.2 11.1A5.1 5.1 0 0 1 3.93 9.5c0-.56.1-1.1.27-1.6V5.7H1.37A8.5 8.5 0 0 0 .5 9.5c0 1.37.33 2.66.87 3.8l2.83-2.2z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.97c1.26 0 2.39.43 3.28 1.28l2.46-2.46A8.5 8.5 0 0 0 9 1 8.5 8.5 0 0 0 1.37 5.7L4.2 7.9C4.88 5.47 6.77 3.97 9 3.97z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function FacebookIcon({ className = 'size-[18px]' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 18 18" fill="currentColor">
      <path d="M17 9a8 8 0 1 0-9.25 7.9v-5.59H5.69V9h2.06V7.24c0-2.04 1.21-3.16 3.07-3.16.89 0 1.82.16 1.82.16v2h-1.03c-1.01 0-1.33.63-1.33 1.27V9h2.25l-.36 2.31H10.28V16.9A8 8 0 0 0 17 9z" />
    </svg>
  )
}

export function BrainIcon({ className = 'size-6', color = '#4F46E5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M13 3a4 4 0 0 1 3.46 6A4 4 0 0 1 13 15v6h-2v-2a4 4 0 0 1-3.46-6A4 4 0 0 1 9 7V3h4zm-2 2H9v2a2 2 0 0 0 2 2V5zm4 0v4a2 2 0 0 0 2-2 2 2 0 0 0-2-2zM7 11a2 2 0 0 0 0 4 4 4 0 0 0 2-.53V11H7zm10 0h-2v3.47c.63.34 1.32.53 2 .53a2 2 0 0 0 0-4z" />
    </svg>
  )
}

/** Feather — represents "light & easy" habit level */
export function SeedlingIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {/* Quill shaft */}
      <path d="M20.24 3.76a9 9 0 0 0-12.73 0L3 8.27V21h12.73l4.51-4.51a9 9 0 0 0 0-12.73z" fill="currentColor" fillOpacity="0.12" />
      <path d="M20.24 3.76a9 9 0 0 0-12.73 0L3 8.27V21h12.73l4.51-4.51a9 9 0 0 0 0-12.73z" />
      {/* Centre vein */}
      <line x1="3" y1="21" x2="12" y2="12" />
    </svg>
  )
}

export function SpinnerIcon({ className = 'size-9 text-white' }: IconProps) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="14" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M18 4a14 14 0 0 1 14 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function CheckIcon({ className = 'size-3 text-white' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Newly Added Icons replacing Emojis ──────────────────────────────────────

export function BriefcaseIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

export function AcademicIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
    </svg>
  )
}

export function ChatIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function FilmIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  )
}

/** SparkleIcon kept as alias — use BoltIcon for habit balanced level */
export function SparkleIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
    </svg>
  )
}

/** Lightning bolt — represents "balanced" habit level */
export function BoltIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      {/* Filled body */}
      <path
        d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Inner highlight line */}
      <path d="M12.5 7l-4 6h4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  )
}

export function FlameIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-4.04 3.03-7.55 7.07-9.58.46-.23 1.03.04 1.12.55.24 1.34.87 2.57 1.81 3.53.4.4.98.54 1.5.34.52-.2 1.05-.31 1.6-.31 3.87 0 7 3.13 7 7 0 3.58-4.03 6.47-9.1 6.47z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-4.04 3.03-7.55 7.07-9.58.46-.23 1.03.04 1.12.55.24 1.34.87 2.57 1.81 3.53.4.4.98.54 1.5.34.52-.2 1.05-.31 1.6-.31 3.87 0 7 3.13 7 7 0 3.58-4.03 6.47-9.1 6.47z" />
    </svg>
  )
}

/** Rocket — represents "intensive" habit level */
export function RocketIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      {/* Body */}
      <path
        d="M12 2C12 2 7 6 7 12v2l-2 2v3h4l1-1h4l1 1h4v-3l-2-2v-2C17 6 12 2 12 2z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Window */}
      <circle cx="12" cy="10" r="2" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.4" />
      {/* Left fin detail */}
      <path d="M7 14l-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {/* Right fin detail */}
      <path d="M17 14l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function ClockIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function ClipboardIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  )
}

export function LightbulbIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A7 7 0 1 0 7.5 11.5c.76.76 1.23 1.52 1.41 2.5" />
    </svg>
  )
}

export function TrophyIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H7M14 14.66V17c0 .55.45 1 1 1h2" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  )
}

export function BookIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

export function MicIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  )
}

export function PencilIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

export function CalendarIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function ZapIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function HomeIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function RefreshIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

export function ChartIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

export function UserIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function CreditCardIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}

export function LogOutIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function TrendingUpIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
