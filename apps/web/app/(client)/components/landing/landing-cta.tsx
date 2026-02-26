"use client"

import { useAuth } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { FloatingOrb } from "./floating-orb"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export function LandingCta() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 text-center md:p-20"
        >
          <FloatingOrb className="left-0 top-0 h-48 w-48 bg-primary/20" />
          <FloatingOrb
            className="bottom-0 right-0 h-40 w-40 bg-accent/15"
            delay={3}
          />

          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance">
              Ready to build your AI copilot?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground text-pretty">
              Join teams using SuperNeuro.ai to ship RAG-powered copilots faster
              than ever. Bring your docs, your key, and your rules.
            </p>
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90"
                  onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-in")}
                >
                  {isSignedIn ? "Go to Dashboard" : "Start building"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
