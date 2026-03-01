"use client"

import { motion } from "framer-motion"
import { fadeUp, stagger, features } from "@/(client)/libs/constants"

export function LandingFeatures() {
  return (
    <section id="features" className="border-y border-border bg-card/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium text-primary">Features</p>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance">
            Everything you need for production RAG
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-pretty">
            A complete platform for building, testing, and deploying
            RAG-powered copilots on your own data.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/30 hover:bg-card/80"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
