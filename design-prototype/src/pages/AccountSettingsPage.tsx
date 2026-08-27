import React, { useState } from 'react'
import { CheckIcon, LogOutIcon } from '../components/Icons'

interface AccountSettingsPageProps {
  onBack: () => void
  isDarkMode: boolean
  onToggleDarkMode: (val: boolean) => void
  onLogout?: () => void
}

export function AccountSettingsPage({
  onBack,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
}: AccountSettingsPageProps) {
  const [name, setName] = useState('Alex Johnson')
  const email = 'alex.johnson@example.com' // Locked account email
  const [goal, setGoal] = useState('15 Mins / Day')
  const [dailyReminders, setDailyReminders] = useState(true)
  const [weaknessAlerts, setWeaknessAlerts] = useState(true)
  const [savedStatus, setSavedStatus] = useState(false)

  // Password fields
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [passUpdated, setPassUpdated] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedStatus(true)
    setTimeout(() => setSavedStatus(false), 2500)
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPass || !newPass) return
    setPassUpdated(true)
    setCurrentPass('')
    setNewPass('')
    setTimeout(() => setPassUpdated(false), 2500)
  }

  return (
    <div className={`flex-1 h-full min-h-0 flex flex-col justify-between overflow-y-auto ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Top App Bar */}
      <div className={`sticky top-0 z-20 backdrop-blur-md flex items-center justify-between px-5 pt-8 pb-3 border-b shrink-0 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
        <button
          type="button"
          onClick={onBack}
          className={`size-10 rounded-xl flex items-center justify-center transition-colors border-none cursor-pointer ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
          title="Back"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-extrabold text-sm">Account Settings</span>
        <button
          type="button"
          onClick={onBack}
          className="size-9 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] flex items-center justify-center shadow-md text-white font-black text-xs border-none cursor-pointer hover:opacity-90 transition-opacity"
        >
          A
        </button>
      </div>

      <div className="flex-1 p-5 pt-4 pb-16 flex flex-col gap-5">
        {/* Profile Card */}
        <div className={`ring-1 rounded-2xl p-4.5 shadow-2xs ${isDarkMode ? 'bg-slate-800/90 ring-slate-700' : 'bg-white ring-slate-200/70'}`}>
          <div className="flex items-center gap-3.5 mb-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
              A
            </div>
            <div>
              <p className="font-bold text-sm m-0">{name}</p>
              <p className={`text-xs m-0 mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{email}</p>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-1">
                AIM Plus Member
              </span>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
            <div>
              <label className={`text-[11px] font-bold block mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none border transition-all ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10'
                }`}
              />
            </div>

            {/* Read-only Locked Email Address */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Email Address
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  isDarkMode ? 'bg-slate-900 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  <svg className="size-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Verified Email</span>
                </span>
              </div>
              <input
                type="email"
                value={email}
                readOnly
                disabled
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border cursor-not-allowed select-none transition-colors ${
                  isDarkMode
                    ? 'bg-slate-900/50 border-slate-800 text-slate-400'
                    : 'bg-slate-100/70 border-slate-200/80 text-slate-500'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] font-bold block mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Daily Learning Commitment
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              >
                <option value="5 Mins / Day">5 Mins / Day (Casual)</option>
                <option value="15 Mins / Day">15 Mins / Day (Recommended)</option>
                <option value="30 Mins / Day">30 Mins / Day (Intensive)</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs border-none cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
            >
              {savedStatus ? (
                <>
                  <CheckIcon className="size-4 text-emerald-300" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </form>
        </div>

        {/* Theme & Appearance Section */}
        <div className={`ring-1 rounded-2xl p-4.5 shadow-2xs ${isDarkMode ? 'bg-slate-800/90 ring-slate-700' : 'bg-white ring-slate-200/70'}`}>
          <p className="font-bold text-xs m-0 mb-3">App Theme & Display</p>

          <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
            isDarkMode
              ? 'bg-slate-900/80 border-slate-700 text-slate-100'
              : 'bg-slate-50 border-slate-200/80 text-slate-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`size-9 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-indigo-950 border border-indigo-800/60 text-indigo-300' : 'bg-amber-50 border border-amber-200/60 text-amber-600'
              }`}>
                {isDarkMode ? (
                  <svg className="size-4.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                ) : (
                  <svg className="size-4.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-bold text-xs m-0">{isDarkMode ? 'Dark Theme' : 'Light Theme'}</p>
                <p className={`text-[10px] m-0 mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isDarkMode ? 'Easier on the eyes in low light' : 'Clean, high contrast appearance'}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => onToggleDarkMode(!isDarkMode)}
              className={`w-12 h-6.5 rounded-full p-0.5 cursor-pointer border-none transition-colors duration-200 ${
                isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`size-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  isDarkMode ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={`ring-1 rounded-2xl p-4.5 shadow-2xs ${isDarkMode ? 'bg-slate-800/90 ring-slate-700' : 'bg-white ring-slate-200/70'}`}>
          <p className="font-bold text-xs m-0 mb-3">Notification Preferences</p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-xs m-0">Daily Study Reminders</p>
                <p className={`text-[10px] m-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Get notified at your preferred study time</p>
              </div>
              <button
                type="button"
                onClick={() => setDailyReminders(!dailyReminders)}
                className={`w-11 h-6 rounded-full p-0.5 cursor-pointer border-none transition-colors duration-200 ${
                  dailyReminders ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`size-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    dailyReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className={`flex items-center justify-between pt-2.5 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <div>
                <p className="font-semibold text-xs m-0">Weakness Diagnostic Alerts</p>
                <p className={`text-[10px] m-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Alerts when AI detects new learning gaps</p>
              </div>
              <button
                type="button"
                onClick={() => setWeaknessAlerts(!weaknessAlerts)}
                className={`w-11 h-6 rounded-full p-0.5 cursor-pointer border-none transition-colors duration-200 ${
                  weaknessAlerts ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`size-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    weaknessAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className={`ring-1 rounded-2xl p-4.5 shadow-2xs ${isDarkMode ? 'bg-slate-800/90 ring-slate-700' : 'bg-white ring-slate-200/70'}`}>
          <p className="font-bold text-xs m-0 mb-3">Security & Password</p>

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-3">
            <div>
              <label className={`text-[11px] font-bold block mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>

            <div>
              <label className={`text-[11px] font-bold block mb-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold outline-none border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!currentPass || !newPass}
              className={`py-2.5 rounded-xl text-white font-bold text-xs border-none cursor-pointer transition-colors shadow-xs disabled:opacity-40 ${
                isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {passUpdated ? 'Password Updated!' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Log Out Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <LogOutIcon className="size-4 text-rose-600" />
            <span>Log Out of AIM Account</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default AccountSettingsPage
