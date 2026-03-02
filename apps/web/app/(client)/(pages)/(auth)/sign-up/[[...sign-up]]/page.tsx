import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

export default function SignUpPage() {
  return (
    <SignUp
      afterSignOutUrl={"/"}
      forceRedirectUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL}
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
