"use client"

import { useAuth } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import { SuperNeuroLogo } from "./super-neuro-logo"
import { useRouter } from "next/navigation"

export function LandingHeader() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <SuperNeuroLogo />
        <div className="flex items-center gap-3">
          {isSignedIn ? (
              <Button
                onClick={() => router.push("/dashboard")}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Dashboard
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
          ) : (
          <>
              <Button
                size="sm"
                variant={"ghost"}
                onClick={() => router.push("/sign-in")}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                variant={"ghost"}
                onClick={() => router.push("/sign-up")}
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
