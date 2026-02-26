"use client"

import { motion } from "framer-motion"

export function AuthHero() {
  return (
    <div className="relative hidden min-h-screen w-full overflow-hidden lg:block">
      {/* Animated gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_0%,var(--tw-gradient-stops))] from-primary/40 via-background via-40% to-background" />
      {/* Moving gradient orbs */}
      <motion.div
        className="absolute -left-1/4 top-1/4 h-[480px] w-[480px] rounded-full bg-primary/30 blur-[120px]"
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/25 blur-[100px]"
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-3/20 blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      {/* Granular noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
      {/* Subtle grid for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(1 0 0) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(1 0 0) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      {/* Illustration: floating abstract shapes + key/lock motif */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <div className="relative h-full w-full max-w-lg">
          {/* Central illustration */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <svg
              viewBox="0 0 200 200"
              fill="none"
              className="h-64 w-64 text-primary/90 md:h-80 md:w-80"
              aria-hidden
            >
              {/* Shield / lock shape */}
              <motion.path
                d="M100 30 L160 55 L160 100 C160 140 130 170 100 185 C70 170 40 140 40 100 L40 55 Z"
                stroke="currentColor"
                strokeWidth="2"
                fill="oklch(0.17 0.02 285 / 0.6)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              {/* Keyhole */}
              <motion.circle
                cx="100"
                cy="95"
                r="18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
              <motion.rect
                x="91"
                y="95"
                width="18"
                height="28"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              />
            </svg>
          </motion.div>
          {/* Orbiting orbs via rotating containers */}
          {[
            { size: 12, radius: 90, duration: 18 },
            { size: 8, radius: 125, duration: 24 },
            { size: 10, radius: 70, duration: 14 },
            { size: 6, radius: 150, duration: 20 },
          ].map((orb, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: orb.radius * 2, height: orb.radius * 2 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: orb.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <motion.div
                className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/60"
                style={{
                  width: orb.size,
                  height: orb.size,
                  boxShadow: "0 0 20px oklch(0.65 0.25 295 / 0.5)",
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
      {/* Bottom tagline */}
      <motion.p
        className="absolute bottom-12 left-0 right-0 text-center text-sm text-muted-foreground/80"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Secure sign-in · Your data stays yours
      </motion.p>
    </div>
  )
}
