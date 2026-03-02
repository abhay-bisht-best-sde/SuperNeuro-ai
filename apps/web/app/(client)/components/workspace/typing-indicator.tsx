"use client"

import { motion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"

interface IProps {
  label?: string
}

export function TypingIndicator(props: IProps) {
  const { label = "Thinking..." } = props

  return (
    <div className="flex items-center gap-3 px-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <motion.div
          className="flex shrink-0 items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Loader2 className="h-4 w-4 text-primary" />
        </motion.div>
      </div>
    </div>
  )
}
