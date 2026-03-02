"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/(client)/components/ui/dialog"
import { api } from "@/(client)/components/query-boundary/api-client"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  r2Key: string | null
  fileName: string
  alt?: string
}

export function ImageViewerModal(props: IProps) {
  const { open, onOpenChange, r2Key, fileName, alt } = props
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !r2Key) {
      setSignedUrl(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    api
      .get<{ url: string }>(
        `/api/signed-url?key=${encodeURIComponent(r2Key)}&type=image`
      )
      .then((res) => {
        setSignedUrl(res.data.url)
      })
      .catch(() => {
        setError("Failed to load image")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, r2Key])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col border-border bg-card p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="truncate text-foreground">
            {fileName}
          </DialogTitle>
        </DialogHeader>
        <div className="relative flex min-h-[200px] flex-1 items-center justify-center overflow-auto p-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center text-destructive">
              {error}
            </div>
          )}
          {signedUrl && !loading && !error && (
            <img
              src={signedUrl}
              alt={alt ?? fileName}
              className="max-h-[70vh] max-w-full object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
