"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { fadeUp, stagger, testimonials } from "./constants"

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium text-primary">
            Testimonials
          </p>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance">
            Trusted by teams building with AI
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-3 flex items-center gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-primary text-primary"
                  />
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-foreground">
                {`"${t.content}"`}
              </p>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
