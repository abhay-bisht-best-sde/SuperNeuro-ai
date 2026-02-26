import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthHero } from "./components/auth-hero"
import { buttonVariants } from "@/(client)/components/ui/button"
import { cn } from "@/(client)/libs/utils"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "absolute left-6 top-6 gap-1.5 text-muted-foreground hover:text-foreground lg:left-12 cursor-pointer"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        {children}
      </div>
      <AuthHero />
    </div>
  )
}
