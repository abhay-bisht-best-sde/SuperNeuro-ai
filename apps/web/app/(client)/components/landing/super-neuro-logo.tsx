import { BrainCircuit } from "lucide-react"
import { cn } from "@/(client)/libs/utils"

interface SuperNeuroLogoProps {
  className?: string
}

export function SuperNeuroLogo({ className }: SuperNeuroLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <BrainCircuit className="h-4 w-4 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">
        SuperNeuro
        <span className="text-primary">.ai</span>
      </span>
    </div>
  )
}
