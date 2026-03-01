"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface IProps {
  label?: string
}

export function TypingIndicator(props: IProps) {
  const { label = "Thinking..." } = props

  return (
    <div className="flex items-center gap-3 px-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-4 w-4 text-primary" />
        </motion.div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-muted-foreground">{label}</p>
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
    </div>
  )
}
