"use client"

import { useState, useEffect, useCallback } from "react"
import { SIDEBAR_COLLAPSED_KEY } from "@/(client)/libs/constants"

export function useSidebarExpanded() {
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (stored !== null) {
      setExpanded(stored !== "true")
    }
  }, [])

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(!next))
      return next
    })
  }, [])

  return [expanded, toggle] as const
}
