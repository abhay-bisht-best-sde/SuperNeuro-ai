"use client"

import { useEffect, useState } from "react"
import { FileText, Loader2 } from "lucide-react"

import { api } from "@/(client)/components/query-boundary/api-client"
import { useResourceViewerStore } from "@/(client)/components/resource-viewer"
import type { RagSource } from "@/libs/ably-types"

interface IProps {
  sources: RagSource[]
}

function useSignedUrl(key: string, type: "pdf" | "image", fetchOnMount = false) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!fetchOnMount || !key) return
    setLoading(true)
    api
      .get<{ url: string }>(
        `/api/signed-url?key=${encodeURIComponent(key)}&type=${type}`
      )
      .then((res) => setUrl(res.data.url))
      .finally(() => setLoading(false))
  }, [key, type, fetchOnMount])

  return { url, loading }
}

type PdfSource = Extract<RagSource, { type: "pdf" }>
type ImageSource = Extract<RagSource, { type: "image" }>

function PdfSourceItem(props: {
  source: PdfSource
  onClick: () => void
}) {
  const { source, onClick } = props
  const { loading } = useSignedUrl(source.r2Key, "pdf")

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {source.fileName}
        </p>
        <p className="text-xs text-muted-foreground">
          Page {source.page + 1}
        </p>
      </div>
    </button>
  )
}

function ImageSourceItem(props: {
  source: ImageSource
  onClick: () => void
}) {
  const { source, onClick } = props
  const { url, loading } = useSignedUrl(source.r2Key, "image", true)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/30 transition-colors hover:bg-muted/50 disabled:opacity-50"
    >
      {url ? (
        <img
          src={url}
          alt={source.textSummary.slice(0, 80)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted/20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <p className="truncate text-xs text-white">
          {source.fileName} · Page {source.page + 1}
        </p>
      </div>
    </button>
  )
}

export function MessageRagSources(props: IProps) {
  const { sources } = props
  const openPdfViewer = useResourceViewerStore((s) => s.openPdfViewer)
  const openImageViewer = useResourceViewerStore((s) => s.openImageViewer)

  const pdfSources = sources.filter(
    (s): s is PdfSource => s.type === "pdf"
  )
  const imageSources = sources.filter(
    (s): s is ImageSource => s.type === "image"
  )

  const uniquePdfs = Array.from(
    new Map(pdfSources.map((s) => [`${s.r2Key}-${s.page}`, s])).values()
  )
  const uniqueImages = Array.from(
    new Map(imageSources.map((s) => [s.r2Key, s])).values()
  )

  if (uniquePdfs.length === 0 && uniqueImages.length === 0) return null

  return (
    <div className="mt-3 space-y-4">
      {uniquePdfs.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            PDF sources
          </p>
          <div className="flex flex-col gap-2">
            {uniquePdfs.map((s) => (
              <PdfSourceItem
                key={`${s.r2Key}-${s.page}`}
                source={s}
                onClick={() =>
                  openPdfViewer({
                    r2Key: s.r2Key,
                    fileName: s.fileName,
                    page: s.page,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
      {uniqueImages.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Image sources
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {uniqueImages.map((s) => (
              <ImageSourceItem
                key={s.r2Key}
                source={s}
                onClick={() =>
                  openImageViewer({
                    r2Key: s.r2Key,
                    fileName: s.fileName,
                    alt: s.textSummary,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
