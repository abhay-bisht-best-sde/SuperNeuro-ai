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
  page?: number
}

export function PdfViewerModal(props: IProps) {
  const { open, onOpenChange, r2Key, fileName, page } = props
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !r2Key) {
      setSignedUrl(null)
      setError(null)
      setPdfLoading(true)
      return
    }
    setLoading(true)
    setError(null)
    setPdfLoading(true)
    api
      .get<{ url: string }>(
        `/api/signed-url?key=${encodeURIComponent(r2Key)}&type=pdf`
      )
      .then((res) => {
        setSignedUrl(res.data.url)
      })
      .catch(() => {
        setError("Failed to load PDF")
        setPdfLoading(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [open, r2Key])

  const showLoader = loading || (signedUrl && pdfLoading)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] flex-col border-border bg-card p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="truncate text-foreground">
            {fileName}
          </DialogTitle>
        </DialogHeader>
        <div className="relative min-h-0 flex-1">
          {showLoader && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-destructive">
              {error}
            </div>
          )}
          {signedUrl && !error && (
            <iframe
              src={`${signedUrl}#${page != null ? `page=${page + 1}&` : ""}toolbar=1`}
              title={fileName}
              className="h-full w-full border-0"
              onLoad={() => setPdfLoading(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
