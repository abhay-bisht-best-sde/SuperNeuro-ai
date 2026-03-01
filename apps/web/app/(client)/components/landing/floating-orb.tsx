"use client"

import { motion } from "framer-motion"
import { cn } from "@/(client)/libs/utils"

interface IProps {
  className?: string
  delay?: number
}

export function FloatingOrb(props: IProps) {
  const { className, delay = 0 } = props
  return (
    <motion.div
      className={cn("absolute rounded-full blur-3xl", className)}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  )
}
