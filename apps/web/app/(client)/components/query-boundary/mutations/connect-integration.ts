import { useMutation} from "@tanstack/react-query"

import { api } from "../api-client"

interface ConnectIntegrationPayload {
  provider: string
  returnUrl?: string
}

interface ConnectIntegrationResponse {
  redirectUrl: string
}

async function connectIntegration(payload: ConnectIntegrationPayload) {
  const { data } = await api.post<ConnectIntegrationResponse>(
    "/api/integrations/connect",
    payload
  )
  return data
}

export function useConnectIntegration() {
  return useMutation({
    mutationFn: connectIntegration,
  })
}
