"use client"

import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, Building2, Check } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/(client)/components/ui/form"
import { useFormContext } from "react-hook-form"
import { cn } from "@/(client)/libs/utils"
import { industries } from "@/(client)/libs/constants"
import type { WelcomeFormData } from "./schema"

interface IProps {
  onNext: () => void
  onBack?: () => void
}

export function Step3Industry(props: IProps) {
  const { onNext, onBack } = props
  const { watch, setValue, control } = useFormContext<WelcomeFormData>()
  const industry = watch("industry")

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <Building2 className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mb-2 text-center text-balance text-2xl font-bold text-foreground">
        What industry are you in?
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        We will suggest relevant templates and agents
      </p>

      <FormField
        control={control}
        name="industry"
        render={() => (
          <FormItem className="mb-8 w-full max-w-sm">
            <FormControl>
              <div className="grid w-full max-w-sm grid-cols-2 gap-2">
                {industries.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant="outline"
                    onClick={() => setValue("industry", option, { shouldValidate: true })}
                    className={cn(
                      "flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      industry === option
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    {option}
                    {industry === option && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2">
                        <Check className="h-3.5 w-3.5" />
                      </motion.span>
                    )}
                  </Button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex w-full max-w-sm items-center gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="h-11 gap-2 border-border bg-card text-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          className="h-11 flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
