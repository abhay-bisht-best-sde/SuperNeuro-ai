"use client"

import type { MotionValue } from "framer-motion"
import { motion } from "framer-motion"
import type { RefObject } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import { FloatingOrb } from "./floating-orb"
import { TECH_BADGES } from "./constants"
import { Button } from "../ui/button"
import { cn } from "@/(client)/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const HERO_GRID_MASK =
  "bg-[linear-gradient(to_right,oklch(0.22_0.008_285/0.7)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.22_0.008_285/0.7)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_10%,transparent_85%)]"

interface LandingHeroProps {
  heroRef: RefObject<HTMLDivElement | null>
  heroY: MotionValue<number>
  heroOpacity: MotionValue<number>
}

export function LandingHero({ heroRef, heroY, heroOpacity }: LandingHeroProps) {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16"
    >
      <FloatingOrb
        className="left-1/4 top-1/3 h-72 w-72 bg-primary/20"
        delay={0}
      />
      <FloatingOrb
        className="right-1/4 top-1/2 h-56 w-56 bg-accent/15"
        delay={2}
      />
      <FloatingOrb
        className="left-1/2 bottom-1/4 h-64 w-64 bg-primary/10"
        delay={4}
      />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            RAG, agents, and tool calling—all in one platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground text-balance md:text-7xl"
        >
          Super Intelligence
          <br />
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            RAG, agents, and tools
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty"
        >
          Upload documents, build custom agents with tools, and deploy a
          production-ready RAG copilot—powered by your own OpenAI key. From
          chunking to real-time chat, SuperNeuro.ai handles it all.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
            <Button
              size="lg"
              onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-in")}
              className="h-12 gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90"
            >
              Start Building Free
              <ArrowRight className="h-4 w-4" />
            </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {TECH_BADGES.map((tech) => (
            <span
              key={tech}
              className="rounded-md border border-border bg-card/60 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <div className={cn("absolute inset-0", HERO_GRID_MASK)} />
    </section>
  )
}
