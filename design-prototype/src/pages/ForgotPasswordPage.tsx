import React, { useState } from 'react'
import { InputField } from '../components/Input'
import { PrimaryButton, TextButton } from '../components/Button'
import { EyeIcon, SparkleIcon } from '../components/Icons'

interface ForgotPasswordPageProps {
  onBackToLogin: () => void
  onResetComplete: () => void
}

type Step = 'email' | 'sent' | 'reset' | 'success'

function ChevronLeftIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function MailIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function CheckBigIcon({ className = 'size-11 text-white' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Back"
      className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center transition-colors border-none cursor-pointer mb-5"
    >
      <ChevronLeftIcon />
    </button>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
        <SparkleIcon className="size-5 text-white" />
      </div>
      <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        AIM
      </span>
    </div>
  )
}

export function ForgotPasswordPage({ onBackToLogin, onResetComplete }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('sent')
    }, 1000)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
    }, 900)
  }

  if (step === 'sent') {
    return (
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 pt-10 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div>
          <Logo />
          <BackButton onClick={onBackToLogin} />
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <div className="size-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mb-5">
            <MailIcon className="size-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight m-0 mb-2">
            Check Your Email
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[280px]">
            We sent a password reset link to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>. Open it to continue.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <TextButton type="button" onClick={handleSendReset} className="dark:text-slate-400 dark:hover:text-white">
            Didn&apos;t get it? Resend email
          </TextButton>
          <TextButton type="button" onClick={onBackToLogin} className="dark:text-slate-400 dark:hover:text-white">
            Back to Sign In
          </TextButton>

          {/* Demo-only shortcut: a real flow continues via the emailed link, which this
              static prototype can't actually send. */}
          <button
            type="button"
            onClick={() => setStep('reset')}
            className="mt-1 h-11 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 font-semibold text-xs cursor-pointer bg-transparent transition-colors"
          >
            Continue to Reset Password (Preview)
          </button>
        </div>
      </div>
    )
  }

  if (step === 'reset') {
    return (
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 pt-10 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div>
          <Logo />
          <BackButton onClick={onBackToLogin} />

          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider block mb-1">
            Reset Password
          </span>
          <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight leading-tight m-0">
            Create a new<br />password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
            Choose a strong password you haven&apos;t used before.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-3 my-auto pt-4">
          <InputField
            type={showPass ? 'text' : 'password'}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="bg-transparent border-none cursor-pointer p-0 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center"
              >
                <EyeIcon off={showPass} />
              </button>
            }
          />
          <InputField
            type={showPass ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <span className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</span>}

          <div className="mt-2">
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 pt-12 text-center bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="my-auto flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full opacity-25 blur-lg animate-pulse" />
            <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 relative transform rotate-3">
              <CheckBigIcon />
            </div>
          </div>
          <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight m-0">Password Reset!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-[260px] leading-relaxed">
            Your password has been updated. Sign in with your new password.
          </p>
        </div>

        <div className="pb-4">
          <PrimaryButton onClick={onResetComplete}>Back to Sign In</PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 pt-10 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div>
        <Logo />
        <BackButton onClick={onBackToLogin} />

        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider block mb-1">
          Forgot Password?
        </span>
        <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight leading-tight m-0">
          Reset your<br />password
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
          Enter the email linked to your account and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSendReset} className="flex flex-col gap-3 my-auto pt-4">
        <InputField
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="mt-2">
          <PrimaryButton type="submit" disabled={loading || !email.trim()}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </PrimaryButton>
        </div>
      </form>

      <p className="text-center text-slate-700 dark:text-slate-200 text-sm font-medium mt-4">
        Remembered your password?{' '}
        <button
          type="button"
          onClick={onBackToLogin}
          className="bg-transparent border-none text-[#4F46E5] dark:text-indigo-400 font-bold text-sm cursor-pointer underline underline-offset-2 p-0 inline"
        >
          Back to Sign In
        </button>
      </p>
    </div>
  )
}

export default ForgotPasswordPage
