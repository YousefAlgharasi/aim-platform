import React, { useState } from "react"
import { InputField } from "../components/Input"
import { PrimaryButton, SocialButton } from "../components/Button"
import { Divider } from "../components/Divider"
import { EyeIcon, GoogleIcon, FacebookIcon, SparkleIcon } from "../components/Icons"

interface RegisterPageProps {
  onLogin?: () => void
  onSuccess?: () => void
}

export function RegisterPage({ onLogin, onSuccess }: RegisterPageProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (onSuccess) onSuccess()
    }, 1200)
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-7 pt-10 overflow-y-auto bg-gradient-to-b from-indigo-50/40 via-white to-slate-50/50">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <SparkleIcon className="size-5 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            AIM
          </span>
        </div>

        <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-wider block mb-1">
          Start your journey
        </span>
        <h1 className="text-slate-900 font-extrabold text-3xl tracking-tight leading-tight m-0">
          Create an account
        </h1>
        <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
          Takes less than a minute. Enter your details below.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} className="flex flex-col gap-3 my-4">
        <InputField
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
              className="bg-transparent border-none cursor-pointer p-0 text-slate-400 hover:text-slate-700 flex items-center"
            >
              <EyeIcon off={showPass} />
            </button>
          }
        />
        <InputField
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="bg-transparent border-none cursor-pointer p-0 text-slate-400 hover:text-slate-700 flex items-center"
            >
              <EyeIcon off={showConfirm} />
            </button>
          }
        />

        <div className="mt-2">
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </PrimaryButton>
        </div>

        <Divider />

        <div className="flex gap-2.5">
          <SocialButton icon={<GoogleIcon />}>Google</SocialButton>
          <SocialButton icon={<FacebookIcon />}>Facebook</SocialButton>
        </div>
      </form>

      {/* Footer link */}
      <p className="text-center text-slate-700 text-sm font-medium mt-2 mb-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onLogin}
          className="bg-transparent border-none text-[#4F46E5] font-bold text-sm cursor-pointer underline underline-offset-2 p-0 inline"
        >
          Log in
        </button>
      </p>
    </div>
  )
}

export default RegisterPage
