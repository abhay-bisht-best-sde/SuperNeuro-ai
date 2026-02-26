"use client"

import { motion } from "framer-motion"
import { ArrowRight, User, Briefcase, Check } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import { cn } from "@/(client)/libs/utils"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/(client)/components/ui/form"
import { useFormContext } from "react-hook-form"
import type { WelcomeFormData } from "./schema"

interface Step1PurposeProps {
  onNext: () => void
  onBack?: () => void
}

export function Step1Purpose({ onNext }: Step1PurposeProps) {
  const { watch, setValue, control } = useFormContext<WelcomeFormData>()
  const purpose = watch("purpose")

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <User className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mb-2 text-center text-balance text-2xl font-bold text-foreground">
        How will you use SuperNeuro.ai?
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        This helps us tailor the experience for you
      </p>

      <FormField
        control={control}
        name="purpose"
        render={() => (
          <FormItem className="mb-8 w-full max-w-sm">
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue("purpose", "personal", { shouldValidate: true })}
                className={cn(
                  "flex h-auto items-center gap-4 rounded-xl border p-4 text-left transition-all",
                  purpose === "personal"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    purpose === "personal" ? "bg-primary/20" : "bg-secondary"
                  )}
                >
                  <User
                    className={cn("h-5 w-5", purpose === "personal" ? "text-primary" : "text-muted-foreground")}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Personal Use</p>
                  <p className="text-xs text-muted-foreground">
                    For learning, personal projects, and exploration
                  </p>
                </div>
                {purpose === "personal" && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                    <Check className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setValue("purpose", "professional", { shouldValidate: true })}
                className={cn(
                  "flex h-auto items-center gap-4 rounded-xl border p-4 text-left transition-all",
                  purpose === "professional"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    purpose === "professional" ? "bg-primary/20" : "bg-secondary"
                  )}
                >
                  <Briefcase
                    className={cn("h-5 w-5", purpose === "professional" ? "text-primary" : "text-muted-foreground")}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Professional / Business</p>
                  <p className="text-xs text-muted-foreground">
                    For teams, companies, and enterprise workflows
                  </p>
                </div>
                {purpose === "professional" && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                    <Check className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        onClick={onNext}
        className="h-11 w-full max-w-sm gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}
