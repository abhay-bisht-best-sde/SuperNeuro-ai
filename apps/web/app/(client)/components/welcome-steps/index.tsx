"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { StepIndicator } from "./step-indicator"
import { Step1Purpose } from "./step-1-purpose"
import { Step2Company } from "./step-2-company"
import { Step3Industry } from "./step-3-industry"
import { Step4UseCases } from "./step-4-use-cases"
import { Form } from "@/(client)/components/ui/form"
import { useInsertUserConfig } from "@/(client)/components/query-boundary"
import { welcomeFormSchema, type WelcomeFormData } from "./schema"

const defaultValues: Partial<WelcomeFormData> = {
  purpose: undefined,
  companyName: "",
  teamSize: undefined,
  industry: undefined,
  useCases: [],
}

const WELCOME_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function WelcomePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 4

  const form = useForm<WelcomeFormData>({
    resolver: zodResolver(welcomeFormSchema),
    defaultValues,
    mode: "onBlur",
  })

  const mutation = useInsertUserConfig()

  const handleStepNext = async (step: number) => {
    const fieldsToValidate =
      step === 0
        ? (["purpose"] as const)
        : step === 1
          ? (["companyName", "teamSize"] as const)
          : step === 2
            ? (["industry"] as const)
            : (["useCases"] as const)

    const valid = await form.trigger(fieldsToValidate)
    if (!valid) return
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  const handleBack = () => setCurrentStep((s) => Math.max(0, s - 1))

  const handleComplete = async () => {
    const valid = await form.trigger()
    if (!valid) return

    const values = form.getValues()
    mutation.mutate(
      {
        purpose: values.purpose,
        companyName: values.companyName,
        teamSize: values.teamSize,
        industry: values.industry,
        useCases: values.useCases,
      },
      {
        onSuccess: () => {
          router.push("/dashboard/integrations")
        },
      }
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <motion.div
        className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-1/3 bottom-1/4 h-48 w-48 rounded-full bg-accent/5 blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">{WELCOME_ICON}</div>
            <span className="text-sm font-semibold text-foreground">SuperNeuro.ai</span>
          </div>
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          <p className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </motion.div>

        <Form {...form}>
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <Step1Purpose
                key="step1"
                onNext={() => handleStepNext(0)}
                onBack={handleBack}
              />
            )}
            {currentStep === 1 && (
              <Step2Company
                key="step2"
                onNext={() => handleStepNext(1)}
                onBack={handleBack}
              />
            )}
            {currentStep === 2 && (
              <Step3Industry
                key="step3"
                onNext={() => handleStepNext(2)}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <Step4UseCases
                key="step4"
                onNext={handleComplete}
                onBack={handleBack}
                isSubmitting={mutation.isPending}
                mutationError={mutation.error}
              />
            )}
          </AnimatePresence>
        </Form>
      </div>
    </div>
  )
}
