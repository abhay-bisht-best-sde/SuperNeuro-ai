"use client"

import { useState } from "react"
import Image from "next/image"

interface IProps {
  src: string
  alt: string
  fallback: string
}

export function IntegrationLogo(props: IProps) {
  const { src, alt, fallback } = props

  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted-foreground/20 text-xs font-medium text-muted-foreground">
        {fallback}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={32}
      height={32}
      className="h-8 w-8 object-contain"
      onError={() => setErrored(true)}
    />
  )
}
