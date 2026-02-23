"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary/60"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
