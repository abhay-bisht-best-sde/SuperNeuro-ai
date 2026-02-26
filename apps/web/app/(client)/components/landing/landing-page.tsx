"use client"

import { useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { LandingHeader } from "@/(client)/components/landing/landing-header"
import { LandingHero } from "@/(client)/components/landing/landing-hero"
import { LandingStats } from "@/(client)/components/landing/landing-stats"
import { LandingHowItWorks } from "@/(client)/components/landing/landing-how-it-works"
import { LandingFeatures } from "@/(client)/components/landing/landing-features"
import { LandingTestimonials } from "@/(client)/components/landing/landing-testimonials"
import { LandingCta } from "@/(client)/components/landing/landing-cta"
import { LandingFooter } from "@/(client)/components/landing/landing-footer"

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <LandingHero heroRef={heroRef} heroY={heroY} heroOpacity={heroOpacity} />
      <LandingStats />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingCta />
      <LandingFooter />
    </div>
  )
}
