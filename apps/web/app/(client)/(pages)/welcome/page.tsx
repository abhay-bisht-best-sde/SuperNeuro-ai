import { WelcomeGuard } from "./welcome-guard"
import { WelcomePage } from "@/(client)/components/welcome-steps"

export default function WelcomeScreen() {
  return (
    <WelcomeGuard>
      <WelcomePage />
    </WelcomeGuard>
  )
}
