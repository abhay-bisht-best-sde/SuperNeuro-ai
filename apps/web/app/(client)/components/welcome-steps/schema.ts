import { z } from "zod"
import { industries, teamSizes, useCases } from "@/(client)/libs/constants"

export const welcomeFormSchema = z.object({
  purpose: z.enum(["personal", "professional"], {
    required_error: "Please select how you'll use SuperNeuro.ai",
  }),
  companyName: z.string().min(1, "Company / Organization name is required"),
  teamSize: z
    .string({ required_error: "Please select your team size" })
    .refine((v) => teamSizes.includes(v), "Please select your team size"),
  industry: z
    .string({ required_error: "Please select your industry" })
    .refine((v) => industries.includes(v), "Please select your industry"),
  useCases: z
    .array(z.string())
    .min(1, "Please select at least one use case")
    .refine((arr) => arr.every((u) => useCases.includes(u)), "Please select at least one use case"),
})

export type WelcomeFormData = z.infer<typeof welcomeFormSchema>

export const step1Schema = welcomeFormSchema.pick({ purpose: true })
export const step2Schema = welcomeFormSchema.pick({ companyName: true, teamSize: true })
export const step3Schema = welcomeFormSchema.pick({ industry: true })
export const step4Schema = welcomeFormSchema.pick({ useCases: true })
