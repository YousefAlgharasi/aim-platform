import { useState, useEffect } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen =
  | 'splash'
  | 'login'
  | 'register'
  | 'onboard-vision'
  | 'onboard-focus'
  | 'onboard-habit'
  | 'onboard-start'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  indigo: '#4F46E5',
  indigoLight: 'rgba(79,70,229,0.08)',
  indigoBorder: '#4F46E5',
  indigoFade: 'rgba(79,70,229,0.2)',
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  placeholder: '#94A3B8',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#E8EAF0' }}>
      <div
        className="relative overflow-hidden flex flex-col"
        style={{
          width: 393,
          minHeight: 852,
          background: C.bg,
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          borderRadius: 40,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#A5B4FC' : C.indigo,
        boxShadow: disabled ? 'none' : `0 4px 16px ${C.indigoFade}`,
        borderRadius: 14,
        height: 54,
        color: '#F8FAFC',
        fontWeight: 600,
        fontSize: 16,
        width: '100%',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </button>
  )
}

function TextButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: C.muted,
        fontWeight: 500,
        fontSize: 16,
        cursor: 'pointer',
        padding: '12px 24px',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )
}

function InputField({
  placeholder,
  type = 'text',
  value,
  onChange,
  rightSlot,
}: {
  placeholder: string
  type?: string
  value: string
  onChange: (v: string) => void
  rightSlot?: React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#F1F5F9',
        border: `1.5px solid ${C.borderStrong}`,
        borderRadius: 14,
        height: 54,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
        transition: 'border-color 0.15s',
      }}
      onFocus={(e) => ((e.currentTarget.style.borderColor = C.indigo))}
      onBlur={(e) => ((e.currentTarget.style.borderColor = C.borderStrong))}
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          outline: 'none',
          fontSize: 15,
          color: C.text,
          fontFamily: 'inherit',
          fontWeight: 400,
        }}
      />
      {rightSlot}
    </div>
  )
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 24px', marginTop: 20 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 5,
            borderRadius: 8,
            background: i === current ? C.indigo : C.indigoFade,
            transition: 'background 0.3s',
          }}
        />
      ))}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
      <div style={{ flex: 1, height: 1, background: C.borderStrong }} />
      <span style={{ color: C.placeholder, fontSize: 13, fontWeight: 400 }}>or</span>
      <div style={{ flex: 1, height: 1, background: C.borderStrong }} />
    </div>
  )
}

function SocialButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      style={{
        flex: 1,
        height: 50,
        background: C.text,
        border: 'none',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: '#F8FAFC',
        fontWeight: 500,
        fontSize: 14,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {icon}
      {label}
    </button>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {off ? (
        <>
          <path d="M3 3l14 14M8.5 8.6A3 3 0 0 0 10 13a3 3 0 0 0 3-3 3 3 0 0 0-.6-1.8" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M6.2 6.4C4.5 7.5 3.2 8.9 2.5 10c1.3 2.7 4.1 5 7.5 5 1.3 0 2.6-.4 3.7-1M10 5c3.4 0 6.2 2.3 7.5 5a9.4 9.4 0 0 1-2 2.8" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M2.5 10C3.8 7.3 6.6 5 10 5s6.2 2.3 7.5 5c-1.3 2.7-4.1 5-7.5 5s-6.2-2.3-7.5-5z" stroke={C.muted} strokeWidth="1.6" />
          <circle cx="10" cy="10" r="2.5" stroke={C.muted} strokeWidth="1.6" />
        </>
      )}
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.1 9.2c0-.5-.04-1-.13-1.46H9v2.76h4.57a3.9 3.9 0 0 1-1.7 2.57v2.13h2.75c1.61-1.48 2.54-3.67 2.54-6z" fill="#4285F4" />
      <path d="M9 18c2.3 0 4.24-.76 5.65-2.06l-2.75-2.13c-.76.51-1.74.82-2.9.82-2.23 0-4.12-1.5-4.8-3.53H1.37v2.2A8.5 8.5 0 0 0 9 18z" fill="#34A853" />
      <path d="M4.2 11.1A5.1 5.1 0 0 1 3.93 9.5c0-.56.1-1.1.27-1.6V5.7H1.37A8.5 8.5 0 0 0 .5 9.5c0 1.37.33 2.66.87 3.8l2.83-2.2z" fill="#FBBC05" />
      <path d="M9 3.97c1.26 0 2.39.43 3.28 1.28l2.46-2.46A8.5 8.5 0 0 0 9 1 8.5 8.5 0 0 0 1.37 5.7L4.2 7.9C4.88 5.47 6.77 3.97 9 3.97z" fill="#EA4335" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="#F8FAFC">
      <path d="M17 9a8 8 0 1 0-9.25 7.9v-5.59H5.69V9h2.06V7.24c0-2.04 1.21-3.16 3.07-3.16.89 0 1.82.16 1.82.16v2h-1.03c-1.01 0-1.33.63-1.33 1.27V9h2.25l-.36 2.31H10.28V16.9A8 8 0 0 0 17 9z" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={C.indigo}>
      <path d="M13 3a4 4 0 0 1 3.46 6A4 4 0 0 1 13 15v6h-2v-2a4 4 0 0 1-3.46-6A4 4 0 0 1 9 7V3h4zm-2 2H9v2a2 2 0 0 0 2 2V5zm4 0v4a2 2 0 0 0 2-2 2 2 0 0 0-2-2zM7 11a2 2 0 0 0 0 4 4 4 0 0 0 2-.53V11H7zm10 0h-2v3.47c.63.34 1.32.53 2 .53a2 2 0 0 0 0-4z" />
    </svg>
  )
}

function SeedlingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={C.text}>
      <path d="M12 22V12M12 12C12 7 7 4 3 5c0 4 3 7 9 7zM12 12c0-5 5-8 9-7 0 4-3 7-9 7z" stroke={C.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="animate-spin" style={{ animationDuration: '0.9s' }}>
      <circle cx="18" cy="18" r="14" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      <path d="M18 4a14 14 0 0 1 14 14" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Screen 1: Splash ─────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      style={{
        flex: 1,
        background: `linear-gradient(145deg, #4F46E5 0%, #6366F1 60%, #818CF8 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 60% 40%, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.15)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
            <path d="M13 3a4 4 0 0 1 3.46 6A4 4 0 0 1 13 15v6h-2v-2a4 4 0 0 1-3.46-6A4 4 0 0 1 9 7V3h4zm-2 2H9v2a2 2 0 0 0 2 2V5zm4 0v4a2 2 0 0 0 2-2 2 2 0 0 0-2-2zM7 11a2 2 0 0 0 0 4 4 4 0 0 0 2-.53V11H7zm10 0h-2v3.47c.63.34 1.32.53 2 .53a2 2 0 0 0 0-4z" />
          </svg>
        </div>
        <div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 28, textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1 }}>NexusLearn</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginTop: 4, fontWeight: 400 }}>AI-Powered Institute</p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 60 }}>
        <SpinnerIcon />
      </div>
    </div>
  )
}

// ─── Screen 2: Login ──────────────────────────────────────────────────────────
function LoginScreen({ onRegister, onSuccess }: { onRegister: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess() }, 1400)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 24px 40px', gap: 0 }}>
      {/* Header illustration area */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, background: C.indigoLight, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={C.indigo}>
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z" />
          </svg>
        </div>
        <p style={{ color: C.placeholder, fontSize: 13, fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Welcome back</p>
        <h1 style={{ color: C.text, fontWeight: 700, fontSize: 28, lineHeight: 1.2, letterSpacing: '-0.02em' }}>Sign in to your<br />account</h1>
        <p style={{ color: C.placeholder, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Happy to see you again. Enter your email and password to continue.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <InputField placeholder="Email address" type="email" value={email} onChange={setEmail} />
        <InputField
          placeholder="Password"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          rightSlot={
            <button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <EyeIcon off={showPass} />
            </button>
          }
        />

        <div style={{ textAlign: 'right' }}>
          <button style={{ background: 'none', border: 'none', color: C.text, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            Forgot password?
          </button>
        </div>

        <div style={{ marginTop: 4 }}>
          <PrimaryButton onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </PrimaryButton>
        </div>

        <Divider />

        <div style={{ display: 'flex', gap: 10 }}>
          <SocialButton icon={<GoogleIcon />} label="Google" />
          <SocialButton icon={<FacebookIcon />} label="Facebook" />
        </div>
      </div>

      <p style={{ textAlign: 'center', color: C.text, fontSize: 14, fontWeight: 600, marginTop: 24 }}>
        Don&apos;t have an account?{' '}
        <button onClick={onRegister} style={{ background: 'none', border: 'none', color: C.indigo, fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
          Create account
        </button>
      </p>
    </div>
  )
}

// ─── Screen 3: Register ───────────────────────────────────────────────────────
function RegisterScreen({ onLogin, onSuccess }: { onLogin: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onSuccess() }, 1400)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 24px 40px', gap: 0 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, background: C.indigoLight, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={C.indigo}>
            <path d="M15 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm-9-2V8H4v2H2v2h2v2h2v-2h2v-2H6zm9 4c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" />
          </svg>
        </div>
        <p style={{ color: C.placeholder, fontSize: 13, fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>New here?</p>
        <h1 style={{ color: C.text, fontWeight: 700, fontSize: 28, lineHeight: 1.2, letterSpacing: '-0.02em' }}>Create an account</h1>
        <p style={{ color: C.placeholder, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Takes less than a minute. Enter your details below.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
        <InputField placeholder="Full name" value={name} onChange={setName} />
        <InputField placeholder="Email address" type="email" value={email} onChange={setEmail} />
        <InputField
          placeholder="Password"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          rightSlot={
            <button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <EyeIcon off={showPass} />
            </button>
          }
        />
        <InputField
          placeholder="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          value={confirm}
          onChange={setConfirm}
          rightSlot={
            <button onClick={() => setShowConfirm(!showConfirm)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <EyeIcon off={showConfirm} />
            </button>
          }
        />

        <div style={{ marginTop: 4 }}>
          <PrimaryButton onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </PrimaryButton>
        </div>

        <Divider />

        <div style={{ display: 'flex', gap: 10 }}>
          <SocialButton icon={<GoogleIcon />} label="Google" />
          <SocialButton icon={<FacebookIcon />} label="Facebook" />
        </div>
      </div>

      <p style={{ textAlign: 'center', color: C.text, fontSize: 14, fontWeight: 600, marginTop: 20 }}>
        Already have an account?{' '}
        <button onClick={onLogin} style={{ background: 'none', border: 'none', color: C.indigo, fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
          Log in
        </button>
      </p>
    </div>
  )
}

// ─── Screen 4A: Vision ────────────────────────────────────────────────────────
function VisionScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ProgressDots total={4} current={0} />

      {/* Illustration */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 0' }}>
        <div style={{ width: '100%', maxWidth: 320, aspectRatio: '1.2', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', borderRadius: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
          {/* Mini device mockup */}
          <div style={{ width: 100, height: 160, background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(79,70,229,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: 6, background: C.indigo, margin: 10, borderRadius: 4 }} />
            <div style={{ height: 4, background: '#E2E8F0', margin: '0 10 6 10', borderRadius: 4 }} />
            <div style={{ height: 4, background: '#E2E8F0', margin: '0 10 6 10', borderRadius: 4, width: '60%' }} />
            <div style={{ margin: '4px 10px', height: 52, background: 'linear-gradient(135deg, #EEF2FF, #C7D2FE)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill={C.indigo}><path d="M13 3a4 4 0 0 1 3.46 6A4 4 0 0 1 13 15v6h-2v-2a4 4 0 0 1-3.46-6A4 4 0 0 1 9 7V3h4zm-2 2H9v2a2 2 0 0 0 2 2V5zm4 0v4a2 2 0 0 0 2-2 2 2 0 0 0-2-2zM7 11a2 2 0 0 0 0 4 4 4 0 0 0 2-.53V11H7zm10 0h-2v3.47c.63.34 1.32.53 2 .53a2 2 0 0 0 0-4z" /></svg>
            </div>
            <div style={{ height: 3, background: '#E2E8F0', margin: '8px 10px 4px', borderRadius: 4 }} />
            <div style={{ height: 3, background: '#E2E8F0', margin: '0 10px 4px', borderRadius: 4, width: '70%' }} />
          </div>
          {/* Floating badges */}
          <div style={{ position: 'absolute', top: 24, right: 24, background: 'white', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 11, fontWeight: 600, color: C.indigo, display: 'flex', gap: 4, alignItems: 'center' }}>
            <span>✦</span> AI Adaptive
          </div>
          <div style={{ position: 'absolute', bottom: 28, left: 24, background: 'white', borderRadius: 10, padding: '6px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 11, fontWeight: 600, color: '#0F172A' }}>
            📈 94% retention
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 24px 0' }}>
        <h1 style={{ color: C.text, fontWeight: 700, fontSize: 28, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Your personal AI Tutor,<br />built for you.
        </h1>
        <p style={{ color: C.placeholder, fontSize: 14, lineHeight: 1.6 }}>
          Adaptive AI learning paths that evolve with your progress — lessons, quizzes, and mentorship shaped around you.
        </p>
      </div>

      <div style={{ padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
        <TextButton onClick={onSkip}>Skip for now</TextButton>
      </div>
    </div>
  )
}

// ─── Screen 4B: Goal Focus ────────────────────────────────────────────────────
type FocusOption = 'career' | 'exams' | 'speaking' | 'media'

const FOCUS_OPTIONS: { id: FocusOption; icon: string; label: string }[] = [
  { id: 'career', icon: '💼', label: 'Career & Work' },
  { id: 'exams', icon: '🎓', label: 'Exams & School' },
  { id: 'speaking', icon: '💬', label: 'Real-life Speaking' },
  { id: 'media', icon: '🎬', label: 'Media & Culture' },
]

function FocusScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [selected, setSelected] = useState<FocusOption | null>(null)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ProgressDots total={4} current={1} />

      <div style={{ padding: '36px 24px 0' }}>
        <p style={{ color: C.placeholder, fontSize: 13, fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Step 2 of 4</p>
        <h1 style={{ color: C.text, fontWeight: 700, fontSize: 28, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 10 }}>
          What is your<br />primary focus?
        </h1>
        <p style={{ color: C.placeholder, fontSize: 14, lineHeight: 1.6 }}>
          Select the goal that matches your current target.
        </p>
      </div>

      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {FOCUS_OPTIONS.map(opt => {
          const active = selected === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderRadius: 14,
                border: `1.5px solid ${active ? C.indigo : C.borderStrong}`,
                background: active ? C.indigoLight : '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{opt.icon}</span>
              <span style={{ color: active ? C.indigo : C.text, fontWeight: active ? 600 : 500, fontSize: 15 }}>{opt.label}</span>
              {active && (
                <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PrimaryButton onClick={onNext} disabled={!selected}>Continue</PrimaryButton>
        <TextButton onClick={onSkip}>Skip for now</TextButton>
      </div>
    </div>
  )
}

// ─── Screen 4C: Daily Habit ───────────────────────────────────────────────────
type HabitOption = '5min' | '15min' | '30min'

const HABIT_OPTIONS: { id: HabitOption; icon: string; label: string; sub: string }[] = [
  { id: '5min', icon: '🌱', label: '5 mins / day', sub: 'Light — great for staying consistent' },
  { id: '15min', icon: '✦', label: '15 mins / day', sub: 'Balanced — recommended for most learners' },
  { id: '30min', icon: '🔥', label: '30 mins / day', sub: 'Intensive — fastest path to fluency' },
]

function HabitScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [selected, setSelected] = useState<HabitOption | null>('15min')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ProgressDots total={4} current={2} />

      <div style={{ padding: '36px 24px 0' }}>
        <p style={{ color: C.placeholder, fontSize: 13, fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Step 3 of 4</p>
        <h1 style={{ color: C.text, fontWeight: 700, fontSize: 28, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Set your daily goal
        </h1>
        <p style={{ color: C.placeholder, fontSize: 14, lineHeight: 1.6 }}>
          How much time will you commit to learning each day?
        </p>
      </div>

      <div style={{ padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {HABIT_OPTIONS.map(opt => {
          const active = selected === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 18px',
                borderRadius: 14,
                border: `1.5px solid ${active ? C.indigo : C.borderStrong}`,
                background: active ? C.indigoLight : '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: active ? C.indigo : C.text, fontWeight: 600, fontSize: 15, margin: 0 }}>{opt.label}</p>
                <p style={{ color: C.placeholder, fontWeight: 400, fontSize: 12, margin: '2px 0 0' }}>{opt.sub}</p>
              </div>
              {active && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PrimaryButton onClick={onNext} disabled={!selected}>Continue</PrimaryButton>
        <TextButton onClick={onSkip}>Skip for now</TextButton>
      </div>
    </div>
  )
}

// ─── Screen 4D / Frame: How to Start ─────────────────────────────────────────
type StartOption = 'zero' | 'test'

function StartScreen({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState<StartOption>('test')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <ProgressDots total={4} current={3} />

      <div style={{ padding: '36px 24px 0' }}>
        <p style={{ color: C.placeholder, fontSize: 13, fontWeight: 500, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Step 4 of 4</p>
        <h1 style={{ color: C.text, fontWeight: 700, fontSize: 28, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: 10 }}>
          How would you<br />like to start?
        </h1>
        <p style={{ color: C.placeholder, fontSize: 14, lineHeight: 1.6 }}>
          Choose carefully — the placement test can only be taken once to accurately calibrate your AI tutor.
        </p>
      </div>

      <div style={{ padding: '28px 24px 0', display: 'flex', gap: 14, flex: 1, alignItems: 'flex-start' }}>
        {/* Zero option */}
        <button
          onClick={() => setSelected('zero')}
          style={{
            flex: 1,
            padding: '20px 16px',
            borderRadius: 18,
            border: `1.5px solid ${selected === 'zero' ? C.indigo : C.borderStrong}`,
            background: selected === 'zero' ? C.indigoLight : '#FFFFFF',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'flex-start',
            transition: 'all 0.15s',
            textAlign: 'left',
          }}
        >
          <div style={{ width: 40, height: 40, background: selected === 'zero' ? 'rgba(79,70,229,0.12)' : '#F1F5F9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SeedlingIcon />
          </div>
          <div>
            <p style={{ color: selected === 'zero' ? C.text : C.text, fontWeight: 700, fontSize: 15, margin: 0 }}>Start from Zero</p>
            <p style={{ color: C.placeholder, fontWeight: 400, fontSize: 12, margin: '4px 0 0', lineHeight: 1.5 }}>Skip the test and start from the absolute basics.</p>
          </div>
        </button>

        {/* Test option */}
        <button
          onClick={() => setSelected('test')}
          style={{
            flex: 1,
            padding: '20px 16px',
            borderRadius: 18,
            border: `1.5px solid ${selected === 'test' ? C.indigo : C.borderStrong}`,
            background: selected === 'test' ? C.indigoLight : '#FFFFFF',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'flex-start',
            transition: 'all 0.15s',
            textAlign: 'left',
            position: 'relative',
          }}
        >
          {selected === 'test' && (
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 14, right: 14 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          )}
          <div style={{ width: 40, height: 40, background: selected === 'test' ? 'rgba(79,70,229,0.12)' : '#F1F5F9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainIcon />
          </div>
          <div>
            <p style={{ color: selected === 'test' ? C.indigo : C.text, fontWeight: 700, fontSize: 15, margin: 0 }}>Test My Knowledge</p>
            <p style={{ color: selected === 'test' ? C.indigo : C.placeholder, fontWeight: 400, fontSize: 12, margin: '4px 0 0', lineHeight: 1.5 }}>Test your skills to let the AI find your level.</p>
          </div>
        </button>
      </div>

      <div style={{ padding: '24px 24px 40px' }}>
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </div>
    </div>
  )
}

// ─── App shell ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('splash')

  return (
    <MobileShell>
      {screen === 'splash' && <SplashScreen onDone={() => setScreen('login')} />}
      {screen === 'login' && <LoginScreen onRegister={() => setScreen('register')} onSuccess={() => setScreen('onboard-vision')} />}
      {screen === 'register' && <RegisterScreen onLogin={() => setScreen('login')} onSuccess={() => setScreen('onboard-vision')} />}
      {screen === 'onboard-vision' && <VisionScreen onNext={() => setScreen('onboard-focus')} onSkip={() => setScreen('onboard-start')} />}
      {screen === 'onboard-focus' && <FocusScreen onNext={() => setScreen('onboard-habit')} onSkip={() => setScreen('onboard-start')} />}
      {screen === 'onboard-habit' && <HabitScreen onNext={() => setScreen('onboard-start')} onSkip={() => setScreen('onboard-start')} />}
      {screen === 'onboard-start' && <StartScreen onContinue={() => setScreen('login')} />}
    </MobileShell>
  )
}
