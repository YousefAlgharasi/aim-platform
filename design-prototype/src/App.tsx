import { useState } from "react"
import { MobileShell } from "./components/MobileShell"
import { SplashPage } from "./pages/SplashPage"
import { LoginPage } from "./pages/LoginPage"
import { RegisterPage } from "./pages/RegisterPage"
import { OnboardVisionPage } from "./pages/OnboardVisionPage"
import { OnboardFocusPage } from "./pages/OnboardFocusPage"
import { OnboardHabitPage } from "./pages/OnboardHabitPage"
import { OnboardStartPage } from "./pages/OnboardStartPage"
import { AssessmentIntroPage } from "./pages/AssessmentIntroPage"
import { AssessmentQuestionPage } from "./pages/AssessmentQuestionPage"
import { AssessmentSubmitPage } from "./pages/AssessmentSubmitPage"
import { AssessmentResultsPage } from "./pages/AssessmentResultsPage"
import { MainDashboardPage } from "./pages/MainDashboardPage"

export type Screen = "splash" | "login" | "register" | "onboard-vision" | "onboard-focus" | "onboard-habit" | "onboard-start" | "assessment-intro" | "assessment-question" | "assessment-submit" | "assessment-results" | "main"

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash")

  return (
    <MobileShell>
      {screen === "splash" && <SplashPage onDone={() => setScreen("login")} />}
      {screen === "login" && (
        <LoginPage
          onRegister={() => setScreen("register")}
          onSuccess={() => setScreen("onboard-vision")}
          onSkipToHome={() => setScreen("main")}
        />
      )}
      {screen === "register" && (
        <RegisterPage
          onLogin={() => setScreen("login")}
          onSuccess={() => setScreen("onboard-vision")}
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
        <MainDashboardPage onLogout={() => setScreen("login")} />
      )}
    </MobileShell>
  )
}
