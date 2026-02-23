import { cn } from "@/(client)/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === currentStep ? "w-8 bg-primary" : i < currentStep ? "w-4 bg-primary/40" : "w-4 bg-border"
          )}
        />
      ))}
    </div>
  )
}
