import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDisplayLabelForStage(label: string | undefined | null): string {
  if (!label || typeof label !== "string") return "Thinking..."
  return label.replace(/\bcomposio\b/gi, "integrations").trim() || "Thinking..."
}
