import { create } from "zustand"

import type { Integrations, UserConfig } from "@repo/database"
import { useShallow } from "zustand/react/shallow"

export interface BootupState {
  integrations: Integrations[]
  selectedIntegrationIds: string[]
  userConfig: UserConfig | null
  isReady: boolean
}

interface BootupStore extends BootupState {
  setBootupState: (state: Partial<BootupState>) => void
}

const initialState: BootupState = {
  integrations: [],
  selectedIntegrationIds: [],
  userConfig: null,
  isReady: false,
}

export const useBootupStore = create<BootupStore>((set) => ({
  ...initialState,
  setBootupState: (state) =>
    set((prev) => ({ ...prev, ...state })),
}))

export function useBootupState() {
  return useBootupStore(
    useShallow((s) => ({
      integrations: s.integrations,
      selectedIntegrationIds: s.selectedIntegrationIds,
      userConfig: s.userConfig,
      isReady: s.isReady,
    }))
  )
}
