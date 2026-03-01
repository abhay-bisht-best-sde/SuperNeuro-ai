"use client"

import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/(client)/components/ui/button"
import { Input } from "@/(client)/components/ui/input"
import { Label } from "@/(client)/components/ui/label"
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/(client)/components/ui/form"
import { useFormContext } from "react-hook-form"
import { cn } from "@/(client)/libs/utils"
import { teamSizes } from "./constants"
import type { WelcomeFormData } from "./schema"

interface IProps {
  onNext: () => void
  onBack?: () => void
}

export function Step2Company(props: IProps) {
  const { onNext, onBack } = props
  const { watch, setValue, control } = useFormContext<WelcomeFormData>()
  const teamSize = watch("teamSize")

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
        Tell us about your organization
      </h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Help us customize your workspace
      </p>

      <FormField
        control={control}
        name="companyName"
        render={({ field }) => (
          <FormItem className="mb-6 w-full max-w-sm">
            <Label htmlFor="company" className="mb-2 block text-xs text-muted-foreground">
              Company / Organization name
            </Label>
            <FormControl>
              <Input
                id="company"
                placeholder="Acme Inc."
                className="h-11 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="teamSize"
        render={() => (
          <FormItem className="mb-8 w-full max-w-sm">
            <Label className="mb-3 block text-xs text-muted-foreground">Team size</Label>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {teamSizes.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("teamSize", size, { shouldValidate: true })}
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs font-medium transition-all",
                      teamSize === size
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    {size}
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
