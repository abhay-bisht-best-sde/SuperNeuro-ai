export interface StepProps {
  onNext: () => void
  onBack?: () => void
}

export type Purpose = "personal" | "professional"

export interface WelcomeFormData {
  purpose: Purpose | null
  companyName: string
  teamSize: string | null
  industry: string | null
  useCases: string[]
}

export interface Step1PurposeProps extends StepProps {
  purpose: Purpose | null
  onPurposeChange: (p: Purpose) => void
}

export interface Step2CompanyProps extends StepProps {
  companyName: string
  onCompanyNameChange: (v: string) => void
  teamSize: string | null
  onTeamSizeChange: (v: string) => void
}

export interface Step3IndustryProps extends StepProps {
  industry: string | null
  onIndustryChange: (v: string) => void
}

export interface Step4UseCasesProps extends StepProps {
  useCases: string[]
  onUseCasesChange: (addOrRemove: string) => void
  isSubmitting?: boolean
}
