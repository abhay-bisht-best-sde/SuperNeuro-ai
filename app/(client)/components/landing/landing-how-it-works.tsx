"use client"

import { motion } from "framer-motion"
import { fadeUp, stagger, howItWorksSteps } from "./constants"

export function LandingHowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium text-primary">
            How It Works
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance">
            From documents to copilot in minutes
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-3"
        >
          {howItWorksSteps.map((item) => (
            <motion.div
              key={item.step}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <span className="mb-4 block text-4xl font-bold text-primary/20">
                {item.step}
              </span>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
