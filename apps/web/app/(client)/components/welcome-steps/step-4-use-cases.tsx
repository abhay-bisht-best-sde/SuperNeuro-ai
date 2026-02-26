"use client"

import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/(client)/components/ui/form"
import { useFormContext } from "react-hook-form"
import { cn } from "@/(client)/libs/utils"
import { useCases as useCaseOptions } from "./constants"
import type { WelcomeFormData } from "./schema"

interface Step4UseCasesProps {
  onNext: () => void
  onBack?: () => void
  isSubmitting?: boolean
  mutationError?: Error | null
}

export function Step4UseCases({ onNext, onBack, isSubmitting = false, mutationError }: Step4UseCasesProps) {
  const { watch, setValue, control } = useFormContext<WelcomeFormData>()
  const selectedCases = watch("useCases") ?? []

  const toggleCase = (c: string) => {
    const next = selectedCases.includes(c)
      ? selectedCases.filter((x) => x !== c)
      : [...selectedCases, c]
    setValue("useCases", next, { shouldValidate: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mb-2 text-center text-balance text-2xl font-bold text-foreground">
        What will you use AI for?
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Select all that apply. You can always change this later.
      </p>

      <FormField
        control={control}
        name="useCases"
        render={() => (
          <FormItem className="mb-8 w-full max-w-sm">
            <FormControl>
              <div className="flex w-full max-w-sm flex-wrap gap-2">
                {useCaseOptions.map((uc) => {
                  const selected = selectedCases.includes(uc)
                  return (
                    <Button
                      key={uc}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCase(uc)}
                      className={cn(
                        "rounded-lg px-3.5 py-2 text-xs font-medium transition-all",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      )}
                    >
                      {selected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mr-1.5 inline-block"
                        >
                          <Check className="inline h-3 w-3" />
                        </motion.span>
                      )}
                      {uc}
                    </Button>
                  )
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {mutationError && (
        <p className="mb-4 text-sm text-destructive">
          {mutationError instanceof Error ? mutationError.message : "Something went wrong"}
        </p>
      )}

      <div className="flex w-full max-w-sm items-center gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          disabled={isSubmitting}
          className="h-11 gap-2 border-border bg-card text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="h-11 flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
        >
          Complete Setup
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  )
}
