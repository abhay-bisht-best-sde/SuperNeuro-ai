import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

export default function SignInPage() {
  return (
    <SignIn
      afterSignInUrl="/dashboard/integrations"
      signUpUrl="/sign-up"
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: "var(--background)",
          colorInputBackground: "var(--card)",
          colorInputText: "var(--foreground)",
          colorText: "var(--foreground)",
          colorTextSecondary: "var(--muted-foreground)",
          borderRadius: "var(--radius)",
        },
      }}
    />
  )
}
