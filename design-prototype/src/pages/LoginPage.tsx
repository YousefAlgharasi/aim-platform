import React, { useState } from "react"
import { InputField } from "../components/Input"
import { PrimaryButton, SocialButton } from "../components/Button"
import { Divider } from "../components/Divider"
import { EyeIcon, GoogleIcon, FacebookIcon, SparkleIcon } from "../components/Icons"

interface LoginPageProps {
  onRegister?: () => void
  onSuccess?: () => void
  onSkipToHome?: () => void
}

export function LoginPage({ onRegister, onSuccess, onSkipToHome }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (onSuccess) onSuccess()
    }, 1200)
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 pt-10 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <SparkleIcon className="size-5 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            AIM
          </span>
        </div>

        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider block mb-1">
          Welcome back
        </span>
        <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight leading-tight m-0">
          Sign in to your<br />account
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
          Happy to see you again. Enter your email and password to continue.
        </p>
      </div>

      {/* Form section */}
      <form onSubmit={handleLogin} className="flex flex-col gap-3 my-auto pt-4">
        <InputField
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputField
          type={showPass ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

        <div className="text-right">
          <button
            type="button"
            className="bg-transparent border-none text-[#4F46E5] dark:text-indigo-400 font-semibold text-xs cursor-pointer hover:underline p-0"
          >
            Forgot password?
          </button>
        </div>

        <div className="mt-2">
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </PrimaryButton>
        </div>

        <Divider />

        <div className="flex gap-2.5">
          <SocialButton icon={<GoogleIcon />}>Google</SocialButton>
          <SocialButton icon={<FacebookIcon />}>Facebook</SocialButton>
        </div>

        {onSkipToHome && (
          <button
            type="button"
            onClick={onSkipToHome}
            className="mt-1 h-11 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 font-semibold text-xs cursor-pointer bg-transparent transition-colors"
          >
            Skip to Home (Preview)
          </button>
        )}
      </form>

      {/* Footer link */}
      <p className="text-center text-slate-700 dark:text-slate-200 text-sm font-medium mt-4">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onRegister}
          className="bg-transparent border-none text-[#4F46E5] dark:text-indigo-400 font-bold text-sm cursor-pointer underline underline-offset-2 p-0 inline"
        >
          Create account
        </button>
      </p>
    </div>
  )
}

export default LoginPage
