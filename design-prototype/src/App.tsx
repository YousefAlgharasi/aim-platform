import { useEffect, useState } from "react"
import { MobileShell } from "./components/MobileShell"
import { SplashPage } from "./pages/SplashPage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage"
import { OnboardVisionPage } from "./pages/OnboardVisionPage"
import { OnboardFocusPage } from "./pages/OnboardFocusPage"
import { OnboardHabitPage } from "./pages/OnboardHabitPage"
import { OnboardStartPage } from "./pages/OnboardStartPage"
import { AssessmentIntroPage } from "./pages/AssessmentIntroPage"
import { AssessmentQuestionPage } from "./pages/AssessmentQuestionPage"
import { AssessmentSubmitPage } from "./pages/AssessmentSubmitPage"
import { AssessmentResultsPage } from "./pages/AssessmentResultsPage"
import { MainDashboardPage } from "./pages/MainDashboardPage"

export type Screen = "splash" | "login" | "register" | "forgot-password" | "onboard-vision" | "onboard-focus" | "onboard-habit" | "onboard-start" | "assessment-intro" | "assessment-question" | "assessment-submit" | "assessment-results" | "main"

const DARK_MODE_STORAGE_KEY = "aim-dark-mode"

function getInitialDarkMode(): boolean {
  try {
    const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY)
    if (stored !== null) return stored === "true"
  } catch {
    // localStorage unavailable (private browsing, disabled storage) — fall through to system preference
  }
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash")
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode))
    } catch {
      // localStorage unavailable — theme still applies for this session, just won't persist
    }
  }, [isDarkMode])

  return (
    <MobileShell>
      {screen === "splash" && <SplashPage onDone={() => setScreen("login")} />}
      {screen === "login" && (
        <LoginPage
          onRegister={() => setScreen("register")}
          onSuccess={() => setScreen("onboard-vision")}
          onSkipToHome={() => setScreen("main")}
          onForgotPassword={() => setScreen("forgot-password")}
        />
      )}
      {screen === "register" && (
        <RegisterPage
          onLogin={() => setScreen("login")}
          onSuccess={() => setScreen("onboard-vision")}
        />
      )}
      {screen === "forgot-password" && (
        <ForgotPasswordPage
          onBackToLogin={() => setScreen("login")}
          onResetComplete={() => setScreen("login")}
        />
      )}
      {screen === "onboard-vision" && (
        <OnboardVisionPage
          onNext={() => setScreen("onboard-focus")}
          onSkip={() => setScreen("onboard-start")}
        />
      )}
      {screen === "onboard-focus" && (
        <OnboardFocusPage
          onNext={() => setScreen("onboard-habit")}
          onSkip={() => setScreen("onboard-start")}
        />
      )}
      {screen === "onboard-habit" && (
        <OnboardHabitPage
          onNext={() => setScreen("onboard-start")}
          onSkip={() => setScreen("onboard-start")}
        />
      )}
      {screen === "onboard-start" && (
        <OnboardStartPage
          onContinue={(mode) =>
            setScreen(mode === "test" ? "assessment-intro" : "main")
          }
        />
      )}
      {screen === "assessment-intro" && (
        <AssessmentIntroPage onStart={() => setScreen("assessment-question")} />
      )}
      {screen === "assessment-question" && (
        <AssessmentQuestionPage
          onFinish={() => setScreen("assessment-submit")}
        />
      )}
      {screen === "assessment-submit" && (
        <AssessmentSubmitPage onDone={() => setScreen("assessment-results")} />
      )}
      {screen === "assessment-results" && (
        <AssessmentResultsPage onUnlock={() => setScreen("main")} />
      )}
      {screen === "main" && (
        <MainDashboardPage
          onLogout={() => setScreen("login")}
          isDarkMode={isDarkMode}
          onToggleDarkMode={setIsDarkMode}
        />
      )}
    </MobileShell>
  )
}
