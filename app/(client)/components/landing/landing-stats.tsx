"use client"

import { motion } from "framer-motion"
import { fadeUp, stagger, stats } from "./constants"

export function LandingStats() {
  return (
    <section className="border-y border-border bg-card/30">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="mb-1 text-3xl font-bold text-foreground md:text-4xl">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
