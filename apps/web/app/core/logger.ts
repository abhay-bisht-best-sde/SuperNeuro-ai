import { createConsola } from "consola"

/**
 * Colourful logger for Next.js server-side debugging.
 * Use in API routes, server components, and server actions.
 *
 * Levels: logger.info(), logger.success(), logger.warn(), logger.error(), logger.debug()
 * With tag: logger.withTag('api').info('message')
 */
const consola = createConsola({
  level: process.env.NODE_ENV === "production" ? 3 : 5, // 3 = warn+, 5 = debug in dev
  defaults: {
    tag: "app",
  },
})

export const logger = consola
